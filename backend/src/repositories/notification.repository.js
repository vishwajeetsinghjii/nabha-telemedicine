const db=require('../config/database');
async function listForUser(userId,limit=50){const r=await db.query(`SELECT id,type,title,message,data,read_at,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`,[userId,limit]);return r.rows;}
async function markRead(id,userId){const r=await db.query(`UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND user_id=$2 RETURNING *`,[id,userId]);return r.rows[0]||null;}
async function create({userId,type='SYSTEM',title,message,data=null},client=db){const r=await client.query(`INSERT INTO notifications(user_id,type,title,message,data,created_at) VALUES($1::uuid,$2::varchar,$3::varchar,$4::text,$5::jsonb,NOW()) RETURNING id,type,title,message,data,read_at,created_at`,[userId,type,title,message,data?JSON.stringify(data):null]);return r.rows[0];}
module.exports={listForUser,markRead,create};
