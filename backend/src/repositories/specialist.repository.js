const db = require('../config/database');

function map(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    specialization: row.specialization || 'General Medicine',
    experienceYears: row.experience_years == null ? null : Number(row.experience_years),
    qualification: row.qualification || null,
    healthCenterId: row.health_center_id || null,
    presence: row.presence_status || 'OFFLINE',
    lastSeenAt: row.last_seen_at || null
  };
}

async function listSpecialists() {
  const { rows } = await db.query(`
    SELECT u.id, u.name, u.email, u.health_center_id,
           da.specialization, da.experience_years, da.qualification,
           COALESCE(dp.status, 'OFFLINE') AS presence_status,
           dp.last_seen_at
      FROM users u
      LEFT JOIN LATERAL (
        SELECT specialization, experience_years, qualification
          FROM doctor_applications
         WHERE user_id = u.id
         ORDER BY created_at DESC
         LIMIT 1
      ) da ON TRUE
      LEFT JOIN doctor_presence dp ON dp.doctor_id = u.id
     WHERE u.role = 'DOCTOR'
       AND u.is_active = TRUE
       AND u.account_status = 'ACTIVE'
     ORDER BY
       CASE WHEN COALESCE(dp.status, 'OFFLINE') = 'ONLINE'
              AND dp.last_seen_at > NOW() - INTERVAL '90 seconds' THEN 0
            WHEN COALESCE(dp.status, 'OFFLINE') = 'AWAY'
              AND dp.last_seen_at > NOW() - INTERVAL '5 minutes' THEN 1
            ELSE 2 END,
       u.name ASC
  `);
  return rows.map(map).map(x => {
    const stale = !x.lastSeenAt || (Date.now() - new Date(x.lastSeenAt).getTime()) > 90_000;
    if (x.presence === 'ONLINE' && stale) x.presence = 'OFFLINE';
    if (x.presence === 'AWAY' && (!x.lastSeenAt || Date.now() - new Date(x.lastSeenAt).getTime() > 300_000)) x.presence = 'OFFLINE';
    return x;
  });
}

async function setPresence(doctorId, status) {
  const { rows } = await db.query(`
    INSERT INTO doctor_presence(doctor_id,status,last_seen_at,updated_at)
    VALUES($1,$2,NOW(),NOW())
    ON CONFLICT(doctor_id)
    DO UPDATE SET status=EXCLUDED.status,last_seen_at=NOW(),updated_at=NOW()
    RETURNING doctor_id,status,last_seen_at
  `, [doctorId, status]);
  return rows[0];
}

module.exports = { listSpecialists, setPresence };
