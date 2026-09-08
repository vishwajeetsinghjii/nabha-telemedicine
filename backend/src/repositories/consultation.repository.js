const db=require('../config/database');
const {v4:uuidv4}=require('uuid');

function map(r){
  return {
    id:r.id,patientId:r.patient_id,doctorId:r.doctor_id,ashaId:r.asha_id,
    appointmentId:r.appointment_id,requestId:r.request_id||null,
    symptoms:r.symptoms,status:r.status,
    // Legacy flat fields (kept for backward compat)
    assessment:r.assessment,treatment:r.treatment,
    // SOAP structured notes
    chiefComplaint:r.chief_complaint||null,
    soapSubjective:r.soap_subjective||null,
    soapObjective:r.soap_objective||null,
    soapAssessment:r.soap_assessment||null,
    soapPlan:r.soap_plan||null,
    followUpDate:r.follow_up_date||null,
    followUp:r.follow_up,
    startedAt:r.started_at,completedAt:r.completed_at,
    syncStatus:r.sync_status,healthCenterId:r.health_center_id||null,
    createdAt:r.created_at,updatedAt:r.updated_at
  };
}

async function findAll(limit=20,offset=0,u){
  let where='',p=[];
  if(u.role==='PATIENT'){where=' WHERE c.patient_id=(SELECT id FROM patients WHERE user_id=$1)';p=[u.id]}
  else if(u.role==='DOCTOR'){where=' WHERE c.doctor_id=$1';p=[u.id]}
  else if(u.role==='ASHA'){where=' WHERE c.asha_id=$1';p=[u.id]}
  const r=await db.query(`SELECT c.* FROM consultations c${where} ORDER BY c.created_at DESC LIMIT $${p.length+1} OFFSET $${p.length+2}`,[...p,limit,offset]);
  const c=await db.query(`SELECT COUNT(*) FROM consultations c${where}`,p);
  return {rows:r.rows.map(map),total:Number(c.rows[0].count)};
}

async function findByAppointmentId(appointmentId,client=db){
  const r=await client.query('SELECT * FROM consultations WHERE appointment_id=$1::uuid ORDER BY created_at DESC LIMIT 1',[appointmentId]);
  return r.rows[0]?map(r.rows[0]):null;
}

async function findById(id,client=db){
  const r=await client.query('SELECT * FROM consultations WHERE id=$1::uuid',[id]);
  return r.rows[0]?map(r.rows[0]):null;
}

async function findByIdForUpdate(id,client){
  const r=await client.query('SELECT * FROM consultations WHERE id=$1::uuid FOR UPDATE',[id]);
  return r.rows[0]?map(r.rows[0]):null;
}

async function create(d,client=db){
  const r=await client.query(
    `INSERT INTO consultations
      (id,patient_id,doctor_id,asha_id,appointment_id,request_id,symptoms,chief_complaint,status,health_center_id)
     VALUES($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,$7::text,$8::text,'SCHEDULED',$9::uuid)
     RETURNING *`,
    [uuidv4(),d.patientId,d.doctorId||null,d.ashaId||null,d.appointmentId||null,
     d.requestId||null,d.symptoms,d.chiefComplaint||null,d.healthCenterId||null]
  );
  return map(r.rows[0]);
}

async function updateStatus(id,status,d={},client=db){
  const r=await client.query(
    `UPDATE consultations SET
      status=$2::varchar,
      started_at=COALESCE($3,started_at),
      completed_at=COALESCE($4,completed_at),
      assessment=COALESCE($5,assessment),
      treatment=COALESCE($6,treatment),
      chief_complaint=COALESCE($7,chief_complaint),
      soap_subjective=COALESCE($8,soap_subjective),
      soap_objective=COALESCE($9,soap_objective),
      soap_assessment=COALESCE($10,soap_assessment),
      soap_plan=COALESCE($11,soap_plan),
      follow_up_date=COALESCE($12,follow_up_date),
      updated_at=NOW()
     WHERE id=$1::uuid RETURNING *`,
    [id,status,
     d.startedAt||null,d.completedAt||null,
     d.assessment||null,d.treatment||null,
     d.chiefComplaint||null,
     d.soapSubjective||null,d.soapObjective||null,
     d.soapAssessment||null,d.soapPlan||null,
     d.followUpDate||null]
  );
  return r.rows[0]?map(r.rows[0]):null;
}

/** Autosave SOAP notes mid-consultation (no status change) */
async function saveSoap(id,d={},client=db){
  const r=await client.query(
    `UPDATE consultations SET
      chief_complaint=COALESCE($2,chief_complaint),
      soap_subjective=COALESCE($3,soap_subjective),
      soap_objective=COALESCE($4,soap_objective),
      soap_assessment=COALESCE($5,soap_assessment),
      soap_plan=COALESCE($6,soap_plan),
      follow_up_date=COALESCE($7,follow_up_date),
      updated_at=NOW()
     WHERE id=$1::uuid AND status='IN_PROGRESS' RETURNING updated_at`,
    [id,d.chiefComplaint||null,d.soapSubjective||null,
     d.soapObjective||null,d.soapAssessment||null,
     d.soapPlan||null,d.followUpDate||null]
  );
  return r.rowCount>0;
}

async function addNote(cid,authorId,note,client=db){
  const r=await client.query(
    `INSERT INTO consultation_notes(id,consultation_id,author_id,note) VALUES($1::uuid,$2::uuid,$3::uuid,$4::text) RETURNING *`,
    [uuidv4(),cid,authorId,note]
  );
  return r.rows[0];
}

async function getNotes(cid,client=db){
  const r=await client.query(
    `SELECT cn.*,u.name AS author_name FROM consultation_notes cn LEFT JOIN users u ON u.id=cn.author_id WHERE cn.consultation_id=$1::uuid ORDER BY cn.created_at ASC`,
    [cid]
  );
  return r.rows;
}

module.exports={map,findAll,findById,findByIdForUpdate,findByAppointmentId,create,updateStatus,saveSoap,addNote,getNotes};
