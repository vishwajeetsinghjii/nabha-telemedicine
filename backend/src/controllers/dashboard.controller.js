const db = require('../config/database');
const patientRepo = require('../repositories/patient.repository');

function n(value) { return Number(value || 0); }
function rows(result) { return result?.rows || []; }

async function patientDashboard(user) {
  const patient = await patientRepo.findByUserId(user.id);
  if (!patient) {
    return { role: 'PATIENT', profile: null, stats: { appointments: 0, consultations: 0, prescriptions: 0, vitals: 0 }, upcomingAppointments: [], recentConsultations: [], recentPrescriptions: [], latestVitals: null, vitalsHistory: [] };
  }

  const [stats, upcoming, consultations, prescriptions, latestVitals, vitalsHistory] = await Promise.all([
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM appointments WHERE patient_id=$1) AS appointments,
        (SELECT COUNT(*) FROM consultations WHERE patient_id=$1) AS consultations,
        (SELECT COUNT(*) FROM prescriptions WHERE patient_id=$1) AS prescriptions,
        (SELECT COUNT(*) FROM patient_vitals WHERE patient_id=$1) AS vitals
    `, [patient.id]),
    db.query(`
      SELECT a.*, u.name AS doctor_name
      FROM appointments a LEFT JOIN users u ON u.id=a.doctor_id
      WHERE a.patient_id=$1 AND a.scheduled_at >= NOW() AND a.status NOT IN ('CANCELLED','COMPLETED')
      ORDER BY a.scheduled_at ASC LIMIT 5
    `, [patient.id]),
    db.query(`
      SELECT c.*, u.name AS doctor_name
      FROM consultations c LEFT JOIN users u ON u.id=c.doctor_id
      WHERE c.patient_id=$1 ORDER BY c.created_at DESC LIMIT 5
    `, [patient.id]),
    db.query(`
      SELECT p.id,p.consultation_id,p.assessment,p.instructions,p.pdf_path,p.signed_at,p.created_at,u.name AS doctor_name,
             COALESCE((SELECT COUNT(*) FROM prescription_items pi WHERE pi.prescription_id=p.id),0) AS item_count
      FROM prescriptions p LEFT JOIN users u ON u.id=p.doctor_id
      WHERE p.patient_id=$1 ORDER BY p.created_at DESC LIMIT 5
    `, [patient.id]),
    db.query(`
      SELECT id,temperature,systolic_bp,diastolic_bp,heart_rate,spo2,weight,respiratory_rate,recorded_at
      FROM patient_vitals WHERE patient_id=$1 ORDER BY recorded_at DESC LIMIT 1
    `, [patient.id]),
    db.query(`
      SELECT id,temperature,systolic_bp,diastolic_bp,heart_rate,spo2,weight,respiratory_rate,recorded_at
      FROM patient_vitals WHERE patient_id=$1 ORDER BY recorded_at DESC LIMIT 12
    `, [patient.id])
  ]);

  const s = stats.rows[0] || {};
  return {
    role: 'PATIENT', profile: patient,
    stats: { appointments: n(s.appointments), consultations: n(s.consultations), prescriptions: n(s.prescriptions), vitals: n(s.vitals) },
    upcomingAppointments: rows(upcoming).map(mapAppointment),
    recentConsultations: rows(consultations).map(mapPatientConsultation),
    recentPrescriptions: rows(prescriptions).map(r => ({ id:r.id, consultationId:r.consultation_id, assessment:r.assessment, instructions:r.instructions, pdfPath:r.pdf_path, signedAt:r.signed_at, createdAt:r.created_at, doctorName:r.doctor_name, itemCount:n(r.item_count) })),
    latestVitals: latestVitals.rows[0] ? mapVitals(latestVitals.rows[0]) : null,
    vitalsHistory: rows(vitalsHistory).map(mapVitals).reverse(),
  };
}

async function doctorDashboard(user) {
  const [stats, queue, recent, verification] = await Promise.all([
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM appointments WHERE doctor_id=$1) AS appointments,
        (SELECT COUNT(*) FROM consultations WHERE doctor_id=$1) AS consultations,
        (SELECT COUNT(*) FROM prescriptions WHERE doctor_id=$1) AS prescriptions,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id=$1 AND scheduled_at >= CURRENT_DATE AND scheduled_at < CURRENT_DATE + INTERVAL '1 day' AND status IN ('SCHEDULED','WAITING','IN_PROGRESS')) AS today,
        (SELECT COUNT(*) FROM appointments WHERE doctor_id=$1 AND scheduled_at >= CURRENT_DATE AND scheduled_at < CURRENT_DATE + INTERVAL '1 day' AND status='WAITING') AS waiting
    `, [user.id]),
    db.query(`
      SELECT a.id,a.request_id,a.patient_id,a.scheduled_at,a.consultation_type,a.status,
             p.patient_code,p.name AS patient_name,p.age,p.gender,p.village,p.mobile,
             v.temperature,v.systolic_bp,v.diastolic_bp,v.heart_rate,v.spo2,v.recorded_at AS vitals_recorded_at,
             tr.risk_level,tr.confidence,tr.guidance,tr.created_at AS triage_created_at
      FROM appointments a
      JOIN patients p ON p.id=a.patient_id
      LEFT JOIN LATERAL (
        SELECT * FROM patient_vitals pv WHERE pv.patient_id=p.id ORDER BY pv.recorded_at DESC LIMIT 1
      ) v ON TRUE
      LEFT JOIN LATERAL (
        SELECT risk_level,confidence,guidance,created_at FROM ai_triage_results atr WHERE atr.patient_id=p.id ORDER BY atr.created_at DESC LIMIT 1
      ) tr ON TRUE
      WHERE a.doctor_id=$1 AND a.scheduled_at >= CURRENT_DATE AND a.scheduled_at < CURRENT_DATE + INTERVAL '1 day'
        AND a.status NOT IN ('CANCELLED','COMPLETED')
      ORDER BY CASE COALESCE(tr.risk_level,'LOW') WHEN 'EMERGENCY' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MODERATE' THEN 3 ELSE 4 END,
               a.scheduled_at ASC LIMIT 20
    `, [user.id]),
    db.query(`
      SELECT c.id,c.patient_id,c.status,c.assessment,c.treatment,c.created_at,c.completed_at,p.patient_code,p.name AS patient_name
      FROM consultations c JOIN patients p ON p.id=c.patient_id
      WHERE c.doctor_id=$1 ORDER BY c.created_at DESC LIMIT 6
    `, [user.id]),
    db.query(`
      SELECT id,status,review_notes,reviewer_id,created_at,updated_at,reviewed_at,specialization,qualification,experience_years
      FROM doctor_applications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1
    `, [user.id])
  ]);
  const s = stats.rows[0] || {};
  return {
    role:'DOCTOR', profile:{ name:user.name, mobile:user.mobile, email:user.email, role:user.role, accountStatus:user.accountStatus, healthCenterId:user.healthCenterId },
    verification: verification.rows[0] ? {applicationId:verification.rows[0].id,status:verification.rows[0].status,reviewNotes:verification.rows[0].review_notes,reviewedAt:verification.rows[0].reviewed_at||verification.rows[0].updated_at,specialization:verification.rows[0].specialization,qualification:verification.rows[0].qualification,experienceYears:verification.rows[0].experience_years} : null,
    stats:{ appointments:n(s.appointments), consultations:n(s.consultations), prescriptions:n(s.prescriptions), today:n(s.today), waiting:n(s.waiting) },
    queue:rows(queue).map(r=>({ id:r.id, requestId:r.request_id||null, patientId:r.patient_id, patientCode:r.patient_code, patientName:r.patient_name, age:r.age, gender:r.gender, village:r.village, mobile:r.mobile, scheduledAt:r.scheduled_at, consultationType:r.consultation_type, status:r.status, vitals:{temperature:r.temperature,systolicBp:r.systolic_bp,diastolicBp:r.diastolic_bp,heartRate:r.heart_rate,spo2:r.spo2,recordedAt:r.vitals_recorded_at}, triage:r.risk_level?{riskLevel:r.risk_level,confidence:r.confidence,guidance:r.guidance,createdAt:r.triage_created_at}:null })),
    recentConsultations:rows(recent).map(r=>({id:r.id,patientId:r.patient_id,patientCode:r.patient_code,patientName:r.patient_name,status:r.status,assessment:r.assessment,treatment:r.treatment,createdAt:r.created_at,completedAt:r.completed_at}))
  };
}

async function ashaDashboard(user) {
  const [stats, patients, appointments, sync] = await Promise.all([
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM patients p WHERE p.health_center_id IN (SELECT health_center_id FROM user_center_assignments WHERE user_id=$1)) AS patients,
        (SELECT COUNT(*) FROM appointments WHERE asha_id=$1) AS appointments,
        (SELECT COUNT(*) FROM appointments WHERE asha_id=$1 AND scheduled_at >= CURRENT_DATE AND scheduled_at < CURRENT_DATE + INTERVAL '1 day') AS today,
        (SELECT COUNT(*) FROM sync_operations WHERE user_id=$1 AND status IN ('FAILED','CONFLICT')) AS sync_issues
    `, [user.id]),
    db.query(`
      SELECT p.id,p.patient_code,p.name,p.age,p.gender,p.mobile,p.village,p.sync_status,
             v.temperature,v.systolic_bp,v.diastolic_bp,v.heart_rate,v.spo2,v.recorded_at AS vitals_recorded_at,
             tr.risk_level,tr.confidence,tr.guidance,tr.created_at AS triage_created_at
      FROM patients p
      LEFT JOIN LATERAL (SELECT * FROM patient_vitals pv WHERE pv.patient_id=p.id ORDER BY pv.recorded_at DESC LIMIT 1) v ON TRUE
      LEFT JOIN LATERAL (SELECT risk_level,confidence,guidance,created_at FROM ai_triage_results atr WHERE atr.patient_id=p.id ORDER BY atr.created_at DESC LIMIT 1) tr ON TRUE
      WHERE p.health_center_id IN (SELECT health_center_id FROM user_center_assignments WHERE user_id=$1)
      ORDER BY CASE COALESCE(tr.risk_level,'LOW') WHEN 'EMERGENCY' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MODERATE' THEN 3 ELSE 4 END,
               p.updated_at DESC LIMIT 20
    `, [user.id]),
    db.query(`
      SELECT a.*,p.patient_code,p.name AS patient_name,u.name AS doctor_name
      FROM appointments a JOIN patients p ON p.id=a.patient_id LEFT JOIN users u ON u.id=a.doctor_id
      WHERE a.asha_id=$1 AND a.scheduled_at >= CURRENT_DATE AND a.scheduled_at < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY a.scheduled_at ASC LIMIT 10
    `, [user.id]),
    db.query(`SELECT COUNT(*) FILTER (WHERE status='SYNCED') AS synced, COUNT(*) FILTER (WHERE status='FAILED') AS failed, COUNT(*) FILTER (WHERE status='CONFLICT') AS conflicts, COUNT(*) AS total FROM sync_operations WHERE user_id=$1`, [user.id])
  ]);
  const s=stats.rows[0]||{}, q=sync.rows[0]||{};
  return {
    role:'ASHA', profile:{name:user.name,mobile:user.mobile,email:user.email,role:user.role,accountStatus:user.accountStatus,healthCenterId:user.healthCenterId},
    stats:{patients:n(s.patients),appointments:n(s.appointments),today:n(s.today),syncIssues:n(s.sync_issues)},
    patients:rows(patients).map(r=>({id:r.id,patientCode:r.patient_code,name:r.name,age:r.age,gender:r.gender,mobile:r.mobile,village:r.village,syncStatus:r.sync_status,vitals:{temperature:r.temperature,systolicBp:r.systolic_bp,diastolicBp:r.diastolic_bp,heartRate:r.heart_rate,spo2:r.spo2,recordedAt:r.vitals_recorded_at},triage:r.risk_level?{riskLevel:r.risk_level,confidence:r.confidence,guidance:r.guidance,createdAt:r.triage_created_at}:null})),
    todayAppointments:rows(appointments).map(mapAppointment),
    sync:{total:n(q.total),synced:n(q.synced),failed:n(q.failed),conflicts:n(q.conflicts)}
  };
}

async function adminDashboard() {
  const [stats, doctorApps, ashaApps, users, audits] = await Promise.all([
    db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM patients p JOIN users u ON u.id=p.user_id WHERE u.role='PATIENT' AND u.is_active=TRUE) AS patients,
        (SELECT COUNT(*) FROM users WHERE role='DOCTOR' AND is_active=TRUE AND account_status='ACTIVE') AS doctors,
        (SELECT COUNT(*) FROM users WHERE role='ASHA' AND is_active=TRUE AND account_status='ACTIVE') AS asha,
        (SELECT COUNT(*) FROM appointments WHERE scheduled_at >= CURRENT_DATE AND scheduled_at < CURRENT_DATE + INTERVAL '1 day') AS today_appointments,
        (SELECT COUNT(*) FROM consultations WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day') AS today_consultations,
        (SELECT COUNT(*) FROM doctor_applications WHERE status IN ('PENDING','UNDER_REVIEW')) AS pending_doctors,
        (SELECT COUNT(*) FROM asha_applications WHERE status='PENDING') AS pending_asha,
        (SELECT COUNT(*) FROM consultation_requests WHERE status='REQUESTED') AS pending_consultation_requests,
        (SELECT COUNT(*) FROM consultation_requests WHERE status='REQUESTED') AS waiting_assignment,
        (SELECT COUNT(*) FROM consultation_requests WHERE status='ASSIGNED' AND assigned_at >= CURRENT_DATE) AS assigned_today
    `),
    db.query(`SELECT da.id,da.user_id,da.full_name,da.qualification,da.license_number,da.specialization,da.experience_years,da.status,da.created_at,u.mobile,u.email FROM doctor_applications da JOIN users u ON u.id=da.user_id WHERE da.status IN ('PENDING','UNDER_REVIEW') ORDER BY da.created_at ASC LIMIT 10`),
    db.query(`SELECT aa.id,aa.user_id,u.name,u.mobile,u.email,aa.status,aa.created_at,aa.application_data FROM asha_applications aa JOIN users u ON u.id=aa.user_id WHERE aa.status='PENDING' ORDER BY aa.created_at ASC LIMIT 10`),
    db.query(`SELECT id,name,mobile,email,role,account_status,is_active,created_at,last_login_at FROM users ORDER BY created_at DESC LIMIT 8`),
    db.query(`SELECT id,action,resource_type,resource_id,metadata,created_at FROM audit_logs ORDER BY created_at DESC LIMIT 8`)
  ]);
  const s=stats.rows[0]||{};
  return {
    role:'ADMIN', profile:{name:'',role:'ADMIN'},
    stats:{users:n(s.users),patients:n(s.patients),doctors:n(s.doctors),asha:n(s.asha),todayAppointments:n(s.today_appointments),todayConsultations:n(s.today_consultations),pendingDoctors:n(s.pending_doctors),pendingAsha:n(s.pending_asha),pendingConsultationRequests:n(s.pending_consultation_requests),waitingAssignment:n(s.waiting_assignment),assignedToday:n(s.assigned_today)},
    pendingDoctorApplications:rows(doctorApps).map(r=>({id:r.id,userId:r.user_id,fullName:r.full_name,qualification:r.qualification,licenseNumber:r.license_number,specialization:r.specialization,experienceYears:r.experience_years,status:r.status,createdAt:r.created_at,mobile:r.mobile,email:r.email})),
    pendingAshaApplications:rows(ashaApps).map(r=>({id:r.id,userId:r.user_id,name:r.name,mobile:r.mobile,email:r.email,status:r.status,createdAt:r.created_at,applicationData:r.application_data||{}})),
    recentUsers:rows(users).map(r=>({id:r.id,name:r.name,mobile:r.mobile,email:r.email,role:r.role,accountStatus:r.account_status,isActive:r.is_active,createdAt:r.created_at,lastLoginAt:r.last_login_at})),
    audit:rows(audits).map(r=>({id:r.id,action:r.action,resourceType:r.resource_type,resourceId:r.resource_id,metadata:r.metadata||{},createdAt:r.created_at}))
  };
}

function mapAppointment(r){return{id:r.id,requestId:r.request_id||null,patientId:r.patient_id,patientCode:r.patient_code||null,patientName:r.patient_name||null,doctorId:r.doctor_id||null,doctorName:r.doctor_name||null,ashaId:r.asha_id||null,ashaName:r.asha_name||null,scheduledAt:r.scheduled_at,consultationType:r.consultation_type,status:r.status,createdAt:r.created_at,updatedAt:r.updated_at};}
function mapConsultation(r){return{id:r.id,requestId:r.request_id||null,patientId:r.patient_id,doctorId:r.doctor_id,doctorName:r.doctor_name||null,status:r.status,symptoms:r.symptoms,assessment:r.assessment,treatment:r.treatment,soapSubjective:r.soap_subjective||null,soapObjective:r.soap_objective||null,soapAssessment:r.soap_assessment||null,soapPlan:r.soap_plan||null,followUpDate:r.follow_up_date||null,createdAt:r.created_at,completedAt:r.completed_at};}
function mapPatientConsultation(r){const completed=r.status==='COMPLETED';return{id:r.id,requestId:r.request_id||null,patientId:r.patient_id,doctorId:r.doctor_id,doctorName:r.doctor_name||null,status:r.status,symptoms:r.symptoms,assessment:completed?r.assessment:null,treatment:completed?r.treatment:null,soapSubjective:completed?r.soap_subjective:null,soapObjective:completed?r.soap_objective:null,soapAssessment:completed?r.soap_assessment:null,soapPlan:completed?r.soap_plan:null,followUpDate:completed?r.follow_up_date:null,createdAt:r.created_at,completedAt:r.completed_at};}
function mapVitals(r){return{id:r.id,temperature:r.temperature,systolicBp:r.systolic_bp,diastolicBp:r.diastolic_bp,heartRate:r.heart_rate,spo2:r.spo2,weight:r.weight,respiratoryRate:r.respiratory_rate,recordedAt:r.recorded_at};}

async function dashboard(req,res,next){
  try {
    const u=req.user;
    let data;
    if(u.role==='PATIENT') data=await patientDashboard(u);
    else if(u.role==='DOCTOR') data=await doctorDashboard(u);
    else if(u.role==='ASHA') data=await ashaDashboard(u);
    else if(u.role==='ADMIN') data=await adminDashboard(u);
    else return res.status(403).json({success:false,error:{code:'ROLE_NOT_SUPPORTED',message:'Dashboard is not available for this role'}});
    return res.json({success:true,data});
  } catch(e){next(e);}
}

module.exports={dashboard};
