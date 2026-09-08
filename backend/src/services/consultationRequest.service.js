const repo=require('../repositories/consultationRequest.repository');
const patients=require('../repositories/patient.repository');
const appointments=require('../repositories/appointment.repository');
const users=require('../repositories/user.repository');
const notifications=require('../repositories/notification.repository');
const audit=require('../repositories/audit.repository');
const db=require('../config/database');
const {NotFoundError,ValidationError,AuthorizationError}=require('../utils/errors');
class ConsultationRequestService{
 async create(d,u){
  if(u.role!=='PATIENT'&&u.role!=='ASHA'&&u.role!=='ADMIN')throw new AuthorizationError('Only a patient, ASHA worker or administrator can request a consultation');
  const p=await patients.findById(d.patientId); if(!p)throw new NotFoundError('Patient');
  if(u.role==='PATIENT'&&p.userId!==u.id)throw new AuthorizationError('You can only request care for yourself');
  if(u.role!=='ADMIN'&&u.role!=='PATIENT'&&!(await patients.isAccessible(p,u)))throw new AuthorizationError('Patient is outside your operational scope');
  try{const r=await repo.create({...d,healthCenterId:p.healthCenterId});
   const admins=await db.query(`SELECT id FROM users WHERE role='ADMIN' AND account_status='ACTIVE' AND is_active=TRUE`);
   for(const a of admins.rows)await notifications.create({userId:a.id,type:'CONSULTATION_REQUEST',title:'New consultation request',message:`${r.patientName||'A patient'} has requested a consultation.`,data:{requestId:r.id,patientId:r.patientId,priority:r.priority}});
   await audit.log('CONSULTATION_REQUESTED','CONSULTATION_REQUEST',r.id,u.id,null,{patientId:r.patientId,priority:r.priority});return r;
  }catch(e){if(e.code==='23505')throw new ValidationError('This patient already has an active consultation request. Please wait for the current request to be processed.');throw e;}
 }
 async patientList(u){const p=await patients.findByUserId(u.id);if(!p)return[];return repo.findForPatient(p.id);}
 async adminList(q){return repo.listAdmin({status:q.status,search:q.search,page:Number(q.page)||1,limit:Math.min(50,Math.max(1,Number(q.limit)||10))});}
 async doctors(){return repo.listDoctors();}
 async assign(id,doctorId,u){
  if(u.role!=='ADMIN')throw new AuthorizationError('Only administrators can assign doctors');
  const doctor=await users.findById(doctorId);if(!doctor||doctor.role!=='DOCTOR'||doctor.accountStatus!=='ACTIVE'||doctor.isActive===false)throw new ValidationError('Only an approved active doctor can be assigned');
  return db.transaction(async client=>{
   const r=await repo.findById(id,client);if(!r)throw new NotFoundError('Consultation request');if(r.status!=='REQUESTED')throw new ValidationError(`Request cannot be assigned from status '${r.status}'`);
   const assigned=await repo.assign(id,doctorId,u.id,client);
   if(!assigned||assigned.status!=='ASSIGNED')throw new ValidationError('The consultation request was changed by another administrator. Refresh and try again.');
   const a=await appointments.create({patientId:r.patientId,doctorId,healthCenterId:r.healthCenterId,scheduledAt:new Date().toISOString(),consultationType:'VIDEO',status:'SCHEDULED',requestId:id},client);
   await repo.linkAppointment(id,a.id,client);
   await notifications.create({userId:doctorId,type:'CONSULTATION_REQUEST',title:'New patient assigned',message:`${r.patientName||'A patient'} has been assigned to you for consultation. Please review and accept the request.`,data:{requestId:id,appointmentId:a.id,patientId:r.patientId}},client);
   if(r.patientId){const p=await patients.findById(r.patientId,client);if(p?.userId)await notifications.create({userId:p.userId,type:'CONSULTATION_REQUEST',title:'Doctor assigned',message:`Dr. ${doctor.name} has been assigned to your consultation request.`,data:{requestId:id,appointmentId:a.id,doctorId}},client);}
   await audit.log('CONSULTATION_DOCTOR_ASSIGNED','CONSULTATION_REQUEST',id,u.id,null,{doctorId,appointmentId:a.id},client);
   return repo.findById(id,client);
  });
 }
 async accept(id,u){
  if(u.role!=='DOCTOR')throw new AuthorizationError('Only the assigned doctor can accept this request');
  return db.transaction(async client=>{const r=await repo.findById(id,client);if(!r)throw new NotFoundError('Consultation request');if(r.doctorId!==u.id)throw new AuthorizationError('You are not the assigned doctor');if(r.status!=='ASSIGNED')throw new ValidationError(`Request cannot be accepted from status '${r.status}'`);const accepted=await repo.accept(id,u.id,client);if(r.appointmentId)await client.query(`UPDATE appointments SET status='WAITING',updated_at=NOW() WHERE id=$1::uuid AND doctor_id=$2::uuid`,[r.appointmentId,u.id]);const p=await patients.findById(r.patientId,client);if(p?.userId)await notifications.create({userId:p.userId,type:'CONSULTATION_REQUEST',title:'Doctor accepted your request',message:`Dr. ${u.name||'your doctor'} is ready to begin your consultation.`,data:{requestId:id,appointmentId:r.appointmentId}},client);await audit.log('CONSULTATION_REQUEST_ACCEPTED','CONSULTATION_REQUEST',id,u.id,null,{appointmentId:r.appointmentId},client);return accepted;});
 }

 async decline(id,reason,u){
  if(u.role!=='DOCTOR')throw new AuthorizationError('Only the assigned doctor can decline this request');
  return db.transaction(async client=>{
   const r=await repo.findById(id,client);if(!r)throw new NotFoundError('Consultation request');
   if(r.doctorId!==u.id)throw new AuthorizationError('You are not the assigned doctor');
   if(r.status!=='ASSIGNED')throw new ValidationError(`Request cannot be declined from status '${r.status}'`);
   const declined=await repo.decline(id,u.id,reason,client);
   const admins=await db.query(`SELECT id FROM users WHERE role='ADMIN' AND account_status='ACTIVE' AND is_active=TRUE`);
   for(const admin of admins.rows)await notifications.create({userId:admin.id,type:'CONSULTATION_REQUEST',title:'Doctor declined assignment',message:`${u.name||'The assigned doctor'} declined a consultation request. Please reassign it.`,data:{requestId:id,reason:reason||null}},client);
   await audit.log('CONSULTATION_REQUEST_DECLINED','CONSULTATION_REQUEST',id,u.id,null,{reason:reason||null},client);
   return declined;
  });
 }
}
module.exports=new ConsultationRequestService();
