const VideoProvider=require('./video.provider');
const env=require('../../config/env');
class ZoomVideoProvider extends VideoProvider{
 async accessToken(){
  if(!env.ZOOM_CLIENT_ID||!env.ZOOM_CLIENT_SECRET||!env.ZOOM_ACCOUNT_ID)throw Object.assign(new Error('Zoom Server-to-Server OAuth credentials are not configured'),{code:'VIDEO_PROVIDER_NOT_CONFIGURED',statusCode:503});
  const basic=Buffer.from(`${env.ZOOM_CLIENT_ID}:${env.ZOOM_CLIENT_SECRET}`).toString('base64');
  const r=await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(env.ZOOM_ACCOUNT_ID)}`,{method:'POST',headers:{Authorization:`Basic ${basic}`,Accept:'application/json'}});
  if(!r.ok)throw Object.assign(new Error('Unable to authenticate with Zoom'),{code:'VIDEO_PROVIDER_AUTH_FAILED',statusCode:503});
  const body=await r.json();return body.access_token;
 }
 async createRoom(consultationId){
  const token=await this.accessToken();
  const r=await fetch('https://api.zoom.us/v2/users/me/meetings',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({topic:`Nabha Telemedicine consultation ${consultationId||''}`.trim(),type:2,duration:60,settings:{join_before_host:false,waiting_room:true,host_video:true,participant_video:true,mute_upon_entry:true,auto_recording:'none'}})});
  if(!r.ok){let detail='Unable to create Zoom meeting';try{const b=await r.json();detail=b.message||detail;}catch{}throw Object.assign(new Error(detail),{code:'VIDEO_PROVIDER_MEETING_FAILED',statusCode:503});}
  const m=await r.json();return {provider:'zoom',roomId:String(m.id),sessionToken:null,joinUrl:m.join_url,startUrl:m.start_url,expiresAt:new Date(Date.now()+60*60*1000).toISOString()};
 }
 async generateToken(){return null;}
 async endSession(){return {status:'ENDED',endedAt:new Date().toISOString()};}
}
module.exports=ZoomVideoProvider;
