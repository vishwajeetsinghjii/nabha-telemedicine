const db=require('../config/database'); const {v4:uuidv4}=require('uuid'); const {generatePatientCode}=require('../utils/patientCode');
const select=`SELECT p.* FROM patients p`;
function map(r){return {id:r.id,patientCode:r.patient_code,userId:r.user_id,name:r.name,age:r.age,gender:r.gender,mobile:r.mobile,village:r.village,address:r.address,emergencyContact:r.emergency_contact,bloodGroup:r.blood_group,allergies:r.allergies,existingConditions:r.existing_conditions,medicalHistory:r.medical_history,healthCenterId:r.health_center_id,syncStatus:r.sync_status,createdAt:r.created_at,updatedAt:r.updated_at};}
async function findAll(limit=20,offset=0,user){let where='',params=[]; if(user&&user.role!=='ADMIN'){where=` WHERE p.health_center_id IN (SELECT health_center_id FROM user_center_assignments WHERE user_id=$1)`;params=[user.id];} const lim=params.length+1,off=params.length+2; const r=await db.query(`${select}${where} ORDER BY p.created_at DESC LIMIT $${lim} OFFSET $${off}`,[...params,limit,offset]); const c=await db.query(`SELECT COUNT(*) FROM patients p${where}`,params); return {rows:r.rows.map(map),total:Number(c.rows[0].count)};}
async function findById(id,client=db){
  if(!id||!String(id).trim())return null;
  const value=String(id).trim();
  const isUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const sql=isUuid
    ? `${select} WHERE p.id=$1::uuid LIMIT 1`
    : `${select} WHERE p.patient_code=$1::varchar LIMIT 1`;
  const r=await client.query(sql,[value]);
  return r.rows[0]?map(r.rows[0]):null;
}
async function findByUserId(userId,client=db){const r=await client.query(`${select} WHERE p.user_id=$1 LIMIT 1`,[userId]);return r.rows[0]?map(r.rows[0]):null;}
async function create(data,createdBy){const id=data.id||uuidv4(),code=data.patientCode||generatePatientCode(); const r=await db.query(`INSERT INTO patients(id,patient_code,user_id,name,age,gender,mobile,village,address,emergency_contact,blood_group,allergies,existing_conditions,medical_history,created_by,health_center_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,[id,code,data.userId||null,data.name,data.age,data.gender,data.mobile,data.village||'Not specified',data.address||null,data.emergencyContact||null,data.bloodGroup||'Unknown',data.allergies||'None',data.existingConditions||'None',data.medicalHistory||'None',createdBy||null,data.healthCenterId||null]);return map(r.rows[0]);}
async function update(id,data){if(!id||!String(id).trim())return null;const allowed={name:'name',age:'age',gender:'gender',mobile:'mobile',village:'village',address:'address',emergencyContact:'emergency_contact',bloodGroup:'blood_group',allergies:'allergies',existingConditions:'existing_conditions',medicalHistory:'medical_history'}; const entries=Object.entries(data).filter(([k])=>allowed[k]); if(!entries.length)return findById(id); const sets=entries.map(([k],i)=>`${allowed[k]}=$${i+2}`);const r=await db.query(`UPDATE patients SET ${sets.join(',')},updated_at=NOW() WHERE id=$1 RETURNING *`,[id,...entries.map(([,v])=>v)]);return r.rows[0]?map(r.rows[0]):null;}
async function isAccessible(patient,user){
 if(!patient||!user)return false;
 if(user.role==='ADMIN')return true;
 if(user.role==='PATIENT')return patient.userId===user.id;
 // A doctor assigned to a consultation/appointment must be able to access that
 // patient's clinical record even when the doctor is not permanently assigned
 // to the patient's health centre. This is the narrowest operational-scope
 // exception because the relationship is created by the admin assignment flow.
 if(user.role==='DOCTOR'){
  const assigned=await db.query(`
   SELECT 1
   FROM appointments a
   WHERE a.patient_id=$1::uuid AND a.doctor_id=$2::uuid
   UNION ALL
   SELECT 1
   FROM consultations c
   WHERE c.patient_id=$1::uuid AND c.doctor_id=$2::uuid
   UNION ALL
   SELECT 1
   FROM consultation_requests cr
   WHERE cr.patient_id=$1::uuid AND cr.assigned_doctor_id=$2::uuid
   LIMIT 1`,[patient.id,user.id]);
  if(assigned.rowCount)return true;
 }
 if(!patient.healthCenterId)return false;
 const r=await db.query(`SELECT 1 FROM user_center_assignments WHERE user_id=$1 AND health_center_id=$2 LIMIT 1`,[user.id,patient.healthCenterId]);
 return !!r.rowCount;
}
module.exports={findAll,findById,findByUserId,create,update,isAccessible};
