const repo=require('../repositories/consultation.repository');
const requestRepo=require('../repositories/consultationRequest.repository');
const notifications=require('../repositories/notification.repository');
const audit=require('../repositories/audit.repository');
const patients=require('../repositories/patient.repository');
const appointments=require('../repositories/appointment.repository');
const db=require('../config/database');
const {NotFoundError,ValidationError,AuthorizationError}=require('../utils/errors');
const {calculatePagination}=require('../utils/pagination');

class ConsultationService{
  async access(c,u){
    if(u.role==='ADMIN')return true;
    if(u.role==='DOCTOR')return c.doctorId===u.id;
    if(u.role==='ASHA')return c.ashaId===u.id;
    if(u.role==='PATIENT'){const p=await patients.findByUserId(u.id);return !!p&&p.id===c.patientId}
    return false;
  }

  async getAllConsultations(q,u){
    const {page,limit,offset}=calculatePagination(q.page,q.limit);
    const r=await repo.findAll(limit,offset,u);
    const consultations=u.role==='PATIENT'
      ?r.rows.map(c=>c.status==='COMPLETED'?c:{...c,soapAssessment:null,soapPlan:null,assessment:null,treatment:null})
      :r.rows;
    return {consultations,pagination:{page,limit,total:r.total,totalPages:Math.ceil(r.total/limit)}};
  }

  async getConsultationById(id,u){
    const c=await repo.findById(id);
    if(!c)throw new NotFoundError('Consultation');
    if(!(await this.access(c,u)))throw new AuthorizationError('You are not authorized to access this consultation');
    if(u.role==='PATIENT'&&c.status!=='COMPLETED')
      return {...c,soapAssessment:null,soapPlan:null,assessment:null,treatment:null};
    return c;
  }

  async createConsultation(){
    throw new ValidationError('Consultations are created automatically when the assigned doctor starts the appointment');
  }

  async startAppointment(appointmentId,u){
    if(u.role!=='DOCTOR')throw new AuthorizationError('Only the assigned doctor can start a consultation');
    return db.transaction(async client=>{
      const a=await appointments.findByIdForUpdate(appointmentId,client);
      if(!a)throw new NotFoundError('Appointment');
      if(a.doctorId!==u.id)throw new AuthorizationError('You are not the assigned doctor for this appointment');
      if(['CANCELLED','COMPLETED'].includes(a.status))throw new ValidationError(`Cannot start appointment in status '${a.status}'`);

      const request=a.requestId?await requestRepo.findById(a.requestId,client):null;
      if(request){
        if(request.doctorId!==u.id)throw new AuthorizationError('You are not the assigned doctor for this request');
        if(request.status!=='ACCEPTED')throw new ValidationError('Accept the assigned consultation request before starting the consultation');
      }

      let c=await repo.findByAppointmentId(appointmentId,client);
      if(c&&c.status==='COMPLETED')throw new ValidationError('This consultation is already completed');
      if(!c){
        c=await repo.create({
          patientId:a.patientId,doctorId:a.doctorId,ashaId:a.ashaId,
          appointmentId,requestId:request?.id,
          symptoms:request?.symptoms||'Consultation requested',
          chiefComplaint:request?.chiefComplaint||null,
          healthCenterId:a.healthCenterId
        },client);
      }
      c=await repo.updateStatus(c.id,'IN_PROGRESS',{startedAt:new Date().toISOString()},client);
      await client.query(`UPDATE appointments SET status='IN_PROGRESS',updated_at=NOW() WHERE id=$1::uuid AND doctor_id=$2::uuid`,[a.id,u.id]);
      if(request){
        await requestRepo.setStatus(request.id,'IN_PROGRESS',client);
        await requestRepo.linkConsultation(request.id,c.id,client);
      }
      const p=await patients.findById(a.patientId,client);
      if(p?.userId)await notifications.create({
        userId:p.userId,type:'CONSULTATION',title:'Consultation started',
        message:'Your doctor has started the consultation. You can join the consultation room now.',
        data:{requestId:request?.id||null,appointmentId:a.id,consultationId:c.id}
      },client);
      await audit.log('CONSULTATION_STARTED','CONSULTATION',c.id,u.id,null,{appointmentId:a.id,requestId:request?.id||null},client);
      return c;
    });
  }

  async startConsultation(id,u){return this.startAppointment((await this.getConsultationById(id,u)).appointmentId,u)}

  async saveSoap(id,data,u){
    if(u.role!=='DOCTOR')throw new AuthorizationError('Only the assigned doctor can update clinical notes');
    const c=await repo.findById(id);
    if(!c)throw new NotFoundError('Consultation');
    if(c.doctorId!==u.id)throw new AuthorizationError('Only the assigned doctor can update clinical notes');
    if(c.status!=='IN_PROGRESS')throw new ValidationError('Clinical notes can only be updated during an active consultation');
    const saved=await repo.saveSoap(id,{
      chiefComplaint:data.chiefComplaint||null,
      soapSubjective:data.soapSubjective||null,
      soapObjective:data.soapObjective||null,
      soapAssessment:data.soapAssessment||null,
      soapPlan:data.soapPlan||null,
      followUpDate:data.followUpDate||null
    });
    return {saved};
  }

  async completeConsultation(id,data,u){
    if(u.role!=='DOCTOR')throw new AuthorizationError('Only the assigned doctor can complete a consultation');
    const {assessment,treatment,soapSubjective,soapObjective,soapAssessment,soapPlan,chiefComplaint,followUpDate}=data||{};
    return db.transaction(async client=>{
      const c=await repo.findByIdForUpdate(id,client);
      if(!c)throw new NotFoundError('Consultation');
      if(c.doctorId!==u.id)throw new AuthorizationError('Only the assigned doctor can complete a consultation');
      if(c.status!=='IN_PROGRESS')throw new ValidationError(`Cannot complete consultation in status '${c.status}'`);

      const updated=await repo.updateStatus(id,'COMPLETED',{
        completedAt:new Date().toISOString(),
        // Legacy fields (populated from SOAP assessment + plan for backward compat)
        assessment:soapAssessment||assessment||'',
        treatment:soapPlan||treatment||'',
        // Structured SOAP
        chiefComplaint:chiefComplaint||c.chiefComplaint||null,
        soapSubjective:soapSubjective||null,
        soapObjective:soapObjective||null,
        soapAssessment:soapAssessment||null,
        soapPlan:soapPlan||null,
        followUpDate:followUpDate||null
      },client);

      if(c.appointmentId)
        await client.query(`UPDATE appointments SET status='COMPLETED',updated_at=NOW() WHERE id=$1::uuid AND doctor_id=$2::uuid`,[c.appointmentId,u.id]);
      if(c.requestId)
        await requestRepo.setStatus(c.requestId,'COMPLETED',client);
      await client.query(
        `UPDATE video_sessions SET status='ENDED',ended_at=COALESCE(ended_at,NOW()) WHERE consultation_id=$1::uuid AND status='ACTIVE'`,
        [c.id]
      );
      const p=await patients.findById(c.patientId,client);
      if(p?.userId)await notifications.create({
        userId:p.userId,type:'CONSULTATION',title:'Consultation completed',
        message:'Your consultation is complete. Your clinical notes and prescription are now available on your dashboard.',
        data:{consultationId:id,appointmentId:c.appointmentId||null,followUpDate:followUpDate||null}
      },client);
      await audit.log('CONSULTATION_COMPLETED','CONSULTATION',id,u.id,null,{
        appointmentId:c.appointmentId||null,requestId:c.requestId||null,
        hasSoap:!!(soapAssessment||soapPlan),followUpDate:followUpDate||null
      },client);
      return repo.map(updated);
    });
  }

  async cancelConsultation(id,u){
    const c=await this.getConsultationById(id,u);
    if(c.status==='COMPLETED')throw new ValidationError('Completed consultations cannot be cancelled');
    return repo.updateStatus(id,'CANCELLED');
  }

  async addNote(id,n,u){
    if(u.role!=='DOCTOR')throw new AuthorizationError('Only the assigned doctor can add clinical notes');
    const c=await repo.findById(id);
    if(!c)throw new NotFoundError('Consultation');
    if(c.doctorId!==u.id)throw new AuthorizationError('Only the assigned doctor can add clinical notes');
    if(c.status!=='IN_PROGRESS')throw new ValidationError('Clinical notes can only be added during an active consultation');
    if(!String(n||'').trim())throw new ValidationError('Clinical note cannot be empty');
    return repo.addNote(id,u.id,String(n).trim());
  }

  async getNotes(id,u){
    const c=await repo.findById(id);
    if(!c)throw new NotFoundError('Consultation');
    if(!(await this.access(c,u)))throw new AuthorizationError('You are not authorized to access these clinical notes');
    if(u.role==='PATIENT'&&c.status!=='COMPLETED')throw new AuthorizationError('Clinical notes are released to the patient only after consultation completion');
    return repo.getNotes(id);
  }
}

module.exports=new ConsultationService();
