const db=require('../config/database');

function map(r){
  return {
    id:r.id,patientId:r.patient_id,
    patientName:r.patient_name||null,patientCode:r.patient_code||null,
    patientAge:r.patient_age==null?null:Number(r.patient_age),
    patientGender:r.patient_gender||null,
    patientAllergies:r.patient_allergies||null,
    patientConditions:r.patient_conditions||null,
    healthCenterId:r.health_center_id,
    symptoms:r.symptoms,chiefComplaint:r.chief_complaint||null,
    preferredLanguage:r.preferred_language,
    priority:r.priority,status:r.status,
    doctorId:r.assigned_doctor_id||null,doctorName:r.doctor_name||null,
    doctorSpecialization:r.doctor_specialization||null,
    assignedBy:r.assigned_by||null,assignedAt:r.assigned_at,
    acceptedAt:r.accepted_at,declinedAt:r.declined_at||null,
    declineReason:r.decline_reason||null,
    appointmentId:r.appointment_id,consultationId:r.consultation_id,
    // Triage + vitals snapshot for admin queue
    triageRisk:r.triage_risk||null,
    vitalsSnapshot:r.vitals_spo2!=null?{spo2:r.vitals_spo2,heartRate:r.vitals_heart_rate,systolicBp:r.vitals_systolic_bp}:null,
    createdAt:r.created_at,updatedAt:r.updated_at
  };
}

const select=`
  SELECT r.*,
    p.name AS patient_name,p.patient_code,p.age AS patient_age,p.gender AS patient_gender,
    p.allergies AS patient_allergies, p.existing_conditions AS patient_conditions,
    u.name AS doctor_name,
    da.specialization AS doctor_specialization,
    tr.risk_level AS triage_risk,
    v.spo2 AS vitals_spo2, v.heart_rate AS vitals_heart_rate, v.systolic_bp AS vitals_systolic_bp
  FROM consultation_requests r
  JOIN patients p ON p.id=r.patient_id
  LEFT JOIN users u ON u.id=r.assigned_doctor_id
  LEFT JOIN LATERAL (SELECT specialization FROM doctor_applications WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1) da ON TRUE
  LEFT JOIN LATERAL (SELECT risk_level FROM ai_triage_results WHERE patient_id=p.id ORDER BY created_at DESC LIMIT 1) tr ON TRUE
  LEFT JOIN LATERAL (SELECT spo2,heart_rate,systolic_bp FROM patient_vitals WHERE patient_id=p.id ORDER BY recorded_at DESC LIMIT 1) v ON TRUE
`;

async function create(d,client=db){
  const q=await client.query(
    `INSERT INTO consultation_requests(patient_id,health_center_id,symptoms,chief_complaint,preferred_language,priority)
     VALUES($1::uuid,$2::uuid,$3::text,$4::text,$5::varchar,$6::varchar) RETURNING *`,
    [d.patientId,d.healthCenterId||null,d.symptoms,d.chiefComplaint||null,d.preferredLanguage||null,d.priority||'NORMAL']
  );
  return map((await client.query(`${select} WHERE r.id=$1::uuid`,[q.rows[0].id])).rows[0]);
}

async function findById(id,client=db){
  const r=await client.query(`${select} WHERE r.id=$1::uuid`,[id]);
  return r.rows[0]?map(r.rows[0]):null;
}

async function findForPatient(patientId,client=db){
  const r=await client.query(`${select} WHERE r.patient_id=$1::uuid ORDER BY r.created_at DESC LIMIT 20`,[patientId]);
  return r.rows.map(map);
}

async function listAdmin({status='REQUESTED',search='',page=1,limit=10}){
  const offset=(page-1)*limit;
  const params=[];const where=[];
  if(status&&status!=='ALL'){params.push(status);where.push(`r.status=$${params.length}::varchar`);}
  if(search){params.push(`%${search}%`);where.push(`(p.name ILIKE $${params.length} OR p.patient_code ILIKE $${params.length} OR p.mobile ILIKE $${params.length} OR r.symptoms ILIKE $${params.length})`);}
  const w=where.length?' WHERE '+where.join(' AND '):'';
  const count=await db.query(`SELECT COUNT(*) ${select.slice(select.indexOf('FROM'))}${w}`,params);
  const rows=await db.query(
    `${select}${w} ORDER BY CASE r.priority WHEN 'URGENT' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'NORMAL' THEN 2 ELSE 3 END,r.created_at ASC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
    [...params,limit,offset]
  );
  return {rows:rows.rows.map(map),total:Number(count.rows[0].count)};
}

async function listDoctors(){
  const r=await db.query(
    `SELECT u.id,u.name,u.mobile,u.email,
       da.specialization,da.qualification,
       COALESCE(dp.status,'OFFLINE') AS presence,
       dp.updated_at AS presence_updated_at
     FROM users u
     LEFT JOIN LATERAL(SELECT specialization,qualification FROM doctor_applications WHERE user_id=u.id ORDER BY created_at DESC LIMIT 1) da ON TRUE
     LEFT JOIN doctor_presence dp ON dp.doctor_id=u.id
     WHERE u.role='DOCTOR' AND u.account_status='ACTIVE' AND u.is_active=TRUE
     ORDER BY CASE COALESCE(dp.status,'OFFLINE') WHEN 'ONLINE' THEN 0 WHEN 'AWAY' THEN 1 ELSE 2 END, u.name`
  );
  return r.rows;
}

async function assign(id,doctorId,adminId,client=db){
  const r=await client.query(
    `UPDATE consultation_requests SET status='ASSIGNED',assigned_doctor_id=$2::uuid,assigned_by=$3::uuid,assigned_at=NOW(),updated_at=NOW() WHERE id=$1::uuid AND status='REQUESTED'`,
    [id,doctorId,adminId]
  );
  return r.rowCount?findById(id,client):null;
}

async function accept(id,doctorId,client=db){
  const r=await client.query(
    `UPDATE consultation_requests SET status='ACCEPTED',accepted_at=NOW(),updated_at=NOW() WHERE id=$1::uuid AND assigned_doctor_id=$2::uuid AND status='ASSIGNED'`,
    [id,doctorId]
  );
  return r.rowCount?findById(id,client):null;
}

async function decline(id,doctorId,reason,client=db){
  const r=await client.query(
    `UPDATE consultation_requests SET status='DECLINED',declined_at=NOW(),decline_reason=$3::text,updated_at=NOW() WHERE id=$1::uuid AND assigned_doctor_id=$2::uuid AND status='ASSIGNED'`,
    [id,doctorId,reason||'']
  );
  return r.rowCount?findById(id,client):null;
}

async function setStatus(id,status,client=db){
  await client.query(`UPDATE consultation_requests SET status=$2::varchar,updated_at=NOW() WHERE id=$1::uuid`,[id,status]);
  return findById(id,client);
}

async function linkAppointment(id,appointmentId,client=db){
  await client.query(`UPDATE consultation_requests SET appointment_id=$2::uuid,updated_at=NOW() WHERE id=$1::uuid`,[id,appointmentId]);
}

async function linkConsultation(id,consultationId,client=db){
  await client.query(`UPDATE consultation_requests SET consultation_id=$2::uuid,updated_at=NOW() WHERE id=$1::uuid`,[id,consultationId]);
}

module.exports={create,findById,findForPatient,listAdmin,listDoctors,assign,accept,decline,setStatus,linkAppointment,linkConsultation};
