/**
 * AI Repository - Nabha Telemedicine Backend
 * Data access layer for storing AI preliminary triage assessments
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const memoryAiResults = [];

class AIRepository {
  async saveTriageResult(data) {
    const isHealthy = await db.checkHealth();
    const id = uuidv4();
    if (isHealthy) {
      const sql = `
        INSERT INTO ai_triage_results (id, patient_id, consultation_id, requested_by, risk_level, triage_category, confidence, warning_flags, guidance, model_version)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const res = await db.query(sql, [
        id, data.patientId || null, data.consultationId || null, data.requestedBy || null,
        data.riskLevel, data.triageCategory, data.confidence, JSON.stringify(data.warningFlags || []),
        data.guidance, data.modelVersion
      ]);
      return res.rows[0];
    }
    const record = { id, ...data, createdAt: new Date().toISOString() };
    memoryAiResults.push(record);
    return record;
  }
}

module.exports = new AIRepository();
