/**
 * Audit Repository - Nabha Telemedicine Backend
 * Data access layer for compliance audit logs
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const memoryAuditLogs = [];

class AuditRepository {
  async log(action, resourceType, resourceId, userId, requestId = null, metadata = {}, client = null) {
    const id = uuidv4();
    if (client) {
      const sql = `
        INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, request_id, metadata)
        VALUES ($1::uuid, $2::uuid, $3::varchar, $4::varchar, $5::uuid, $6::varchar, $7::jsonb)
        RETURNING *;
      `;
      const res = await client.query(sql, [id, userId || null, action, resourceType, resourceId || null, requestId || null, JSON.stringify(metadata)]);
      return res.rows[0];
    }
    const isHealthy = await db.checkHealth();
    if (isHealthy) {
      const sql = `INSERT INTO audit_logs (id,user_id,action,resource_type,resource_id,request_id,metadata) VALUES ($1::uuid,$2::uuid,$3::varchar,$4::varchar,$5::uuid,$6::varchar,$7::jsonb) RETURNING *`;
      const res = await db.query(sql, [id,userId || null,action,resourceType,resourceId || null,requestId || null,JSON.stringify(metadata)]);
      return res.rows[0];
    }
    const logRecord = { id, userId, action, resourceType, resourceId, requestId, metadata, createdAt: new Date().toISOString() };
    memoryAuditLogs.unshift(logRecord);
    return logRecord;
  }

  async findAll(limit = 50, offset = 0) {
    const isHealthy = await db.checkHealth();
    if (isHealthy) {
      const res = await db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
      const countRes = await db.query('SELECT COUNT(*) FROM audit_logs');
      return {
        rows: res.rows,
        total: parseInt(countRes.rows[0].count, 10)
      };
    }
    return {
      rows: memoryAuditLogs.slice(offset, offset + limit),
      total: memoryAuditLogs.length
    };
  }
}

module.exports = new AuditRepository();
