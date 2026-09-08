const env=require('../config/env');
const MockVideoProvider=require('../integrations/video/mock.provider');
const AgoraVideoProvider=require('../integrations/video/agora.provider');
const ZoomVideoProvider=require('../integrations/video/zoom.provider');
const db=require('../config/database');
const consultations=require('../repositories/consultation.repository');
const patients=require('../repositories/patient.repository');
const {AuthorizationError,NotFoundError}=require('../utils/errors');
const {v4:uuidv4}=require('uuid');
class VideoService{
 constructor(){this.selectProvider();}
 selectProvider(){const type=(env.VIDEO_PROVIDER||'mock').toLowerCase();if(type==='zoom')this.provider=new ZoomVideoProvider();else if(type==='agora')this.provider=new AgoraVideoProvider();else{if(env.NODE_ENV==='production')throw new Error('Mock video provider is not permitted in production');this.provider=new MockVideoProvider();}}
 async assertAccess(consultationId,user){const c=await consultations.findById(consultationId);if(!c)throw new NotFoundError('Consultation');if(user.role==='ADMIN')return c;if(user.role==='DOCTOR'&&c.doctorId===user.id)return c;if(user.role==='ASHA'&&c.ashaId===user.id)return c;if(user.role==='PATIENT'){const p=await patients.findByUserId(user.id);if(p&&p.id===c.patientId)return c;}throw new AuthorizationError('You are not authorized to access this video session');}
 async createSession(consultationId,user){if(!consultationId)throw Object.assign(new Error('Consultation ID is required'),{statusCode:400,code:'CONSULTATION_REQUIRED'});if(!['DOCTOR','ADMIN'].includes(user.role))throw new AuthorizationError('Only the assigned doctor can create the video session');const c=await this.assertAccess(consultationId,user);if(c.status!=='IN_PROGRESS')throw new AuthorizationError('The video room is available only after the doctor starts the consultation');const existing=await this.getSessionForConsultation(consultationId,user);if(existing)return existing;const room=await this.provider.createRoom(consultationId);const id=uuidv4();try{const r=await db.query(`INSERT INTO video_sessions(id,consultation_id,provider,room_id,session_token,status,join_url,start_url) VALUES($1::uuid,$2::uuid,$3::varchar,$4::varchar,$5::text,'ACTIVE',$6::text,$7::text) RETURNING *`,[id,c.id,room.provider,room.roomId,room.sessionToken||null,room.joinUrl||null,room.startUrl||null]);return r.rows[0];}catch(e){if(e.code==='23505'){const active=await this.getSessionForConsultation(consultationId,user);if(active)return active;}throw e;}}
 async getSessionForConsultation(consultationId,user){const c=await this.assertAccess(consultationId,user);const r=await db.query("SELECT * FROM video_sessions WHERE consultation_id=$1 AND status='ACTIVE' ORDER BY started_at DESC LIMIT 1",[c.id]);return r.rows[0]||null;}
 async getSessionById(id,user){const r=await db.query('SELECT * FROM video_sessions WHERE id=$1',[id]);if(!r.rowCount)return null;await this.assertAccess(r.rows[0].consultation_id,user);return r.rows[0];}
 async endSession(id,user){const r=await db.query('SELECT * FROM video_sessions WHERE id=$1',[id]);if(!r.rowCount)return null;await this.assertAccess(r.rows[0].consultation_id,user);const u=await db.query(`UPDATE video_sessions SET status='ENDED',ended_at=NOW() WHERE id=$1 RETURNING *`,[id]);return u.rows[0];}
}
module.exports=new VideoService();
