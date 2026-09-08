const db = require('../config/database');

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id, name: row.name, email: row.email, mobile: row.mobile,
    passwordHash: row.password_hash, role: row.role,
    accountStatus: row.account_status || (row.is_active === false ? 'DISABLED' : 'ACTIVE'),
    organizationId: row.organization_id || null, healthCenterId: row.health_center_id || null,
    isActive: row.is_active, createdAt: row.created_at, updatedAt: row.updated_at, lastLoginAt: row.last_login_at
  };
}
const select = `SELECT id,name,email,mobile,password_hash,role,is_active,account_status,organization_id,health_center_id,created_at,updated_at,last_login_at FROM users`;
async function findById(id, client=db) { const r=await client.query(`${select} WHERE id=$1 LIMIT 1`,[id]); return mapUser(r.rows[0]); }
async function findByEmail(email, client=db) { const r=await client.query(`${select} WHERE LOWER(email)=LOWER($1) LIMIT 1`,[email]); return mapUser(r.rows[0]); }
async function findByMobile(mobile, client=db) { const r=await client.query(`${select} WHERE mobile=$1 LIMIT 1`,[mobile]); return mapUser(r.rows[0]); }
async function findByIdentifier(identifier, client=db) { const r=await client.query(`${select} WHERE mobile=$1 OR LOWER(email)=LOWER($1) LIMIT 1`,[identifier]); return mapUser(r.rows[0]); }
async function create(data, client=db) {
 const r=await client.query(`INSERT INTO users(name,mobile,email,password_hash,role,is_active,account_status,organization_id,health_center_id,created_at,updated_at) VALUES($1,$2,$3,$4,$5,TRUE,$6,$7,$8,NOW(),NOW()) RETURNING id,name,email,mobile,password_hash,role,is_active,account_status,organization_id,health_center_id,created_at,updated_at,last_login_at`,[data.name,data.mobile||null,data.email||null,data.passwordHash,data.role,data.accountStatus,data.organizationId||null,data.healthCenterId||null]);
 return mapUser(r.rows[0]);
}
async function touchLogin(id,client=db){const r=await client.query(`UPDATE users SET last_login_at=NOW(),updated_at=NOW() WHERE id=$1 RETURNING *`,[id]);return mapUser(r.rows[0]);}
async function updateAccountStatus(id,status,client=db){const allowed=['ACTIVE','PENDING_APPROVAL','SUSPENDED','REJECTED','DISABLED']; if(!allowed.includes(status)) throw new Error('Invalid account status'); const r=await client.query(`UPDATE users SET account_status=$2::varchar,is_active=($2::varchar='ACTIVE'),updated_at=NOW() WHERE id=$1::uuid RETURNING *`,[id,status]); return mapUser(r.rows[0]);}
async function listByRole(role,limit=50,offset=0,client=db){const r=await client.query(`${select} WHERE role=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,[role,limit,offset]);return r.rows.map(mapUser);}
module.exports={findById,findByEmail,findByMobile,findByIdentifier,create,touchLogin,updateAccountStatus,listByRole,mapUser};
