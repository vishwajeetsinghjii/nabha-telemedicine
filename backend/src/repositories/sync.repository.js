/**
 * Sync Repository - Nabha Telemedicine Backend
 * Enforces transaction-safe processing and operationId idempotency
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const memorySyncOps = new Map();

class SyncRepository {
  async findByOperationId(operationId) {
    const isHealthy = await db.checkHealth();
    if (isHealthy) {
      const res = await db.query('SELECT * FROM sync_operations WHERE operation_id = $1', [operationId]);
      return res.rows[0] ? this.mapRow(res.rows[0]) : null;
    }
    return memorySyncOps.get(operationId) || null;
  }

  async recordOperation(opData, userId, status = 'SYNCED', errorCode = null, errorMessage = null) {
    const isHealthy = await db.checkHealth();
    const id = uuidv4();
    if (isHealthy) {
      const sql = `
        INSERT INTO sync_operations (id, operation_id, user_id, entity_type, entity_id, operation_type, payload, client_created_at, status, error_code, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (operation_id) DO NOTHING
        RETURNING *;
      `;
      const res = await db.query(sql, [
        id, opData.operationId, userId, opData.entityType, opData.entityId,
        opData.operationType, JSON.stringify(opData.payload), opData.clientCreatedAt,
        status, errorCode, errorMessage
      ]);
      return res.rows[0] ? this.mapRow(res.rows[0]) : null;
    }
    const record = { id, userId, ...opData, status, errorCode, errorMessage, serverProcessedAt: new Date().toISOString() };
    memorySyncOps.set(opData.operationId, record);
    return record;
  }

  async getSyncStatus() {
    const isHealthy = await db.checkHealth();
    if (isHealthy) {
      const res = await db.query(`
        SELECT status, COUNT(*) as count 
        FROM sync_operations 
        GROUP BY status
      `);
      return res.rows.reduce((acc, r) => {
        acc[r.status] = parseInt(r.count, 10);
        return acc;
      }, { SYNCED: 0, CONFLICT: 0, FAILED: 0 });
    }
    const counts = { SYNCED: 0, CONFLICT: 0, FAILED: 0 };
    for (const op of memorySyncOps.values()) {
      counts[op.status] = (counts[op.status] || 0) + 1;
    }
    return counts;
  }

  mapRow(row) {
    return {
      id: row.id,
      operationId: row.operation_id,
      userId: row.user_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operationType: row.operation_type,
      payload: row.payload,
      clientCreatedAt: row.client_created_at,
      serverProcessedAt: row.server_processed_at,
      status: row.status,
      retryCount: row.retry_count,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      createdAt: row.created_at
    };
  }
}

module.exports = new SyncRepository();
