/**
 * Database Rollback Script - Nabha Telemedicine Backend
 * Drops tables in reverse dependency order
 */

const db = require('../config/database');
const logger = require('../utils/logger');

async function rollback() {
  console.log('[Rollback] Dropping database tables...');
  const isHealthy = await db.checkHealth();
  
  if (!isHealthy) {
    logger.warn('[Rollback Warning] PostgreSQL database not connected.');
    process.exit(0);
  }

  const dropSql = `
    DROP TABLE IF EXISTS refresh_tokens CASCADE;
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP TABLE IF EXISTS ivr_events CASCADE;
    DROP TABLE IF EXISTS video_sessions CASCADE;
    DROP TABLE IF EXISTS ai_triage_results CASCADE;
    DROP TABLE IF EXISTS sync_operations CASCADE;
    DROP TABLE IF EXISTS prescription_items CASCADE;
    DROP TABLE IF EXISTS prescriptions CASCADE;
    DROP TABLE IF EXISTS consultation_notes CASCADE;
    DROP TABLE IF EXISTS consultations CASCADE;
    DROP TABLE IF EXISTS appointments CASCADE;
    DROP TABLE IF EXISTS patient_vitals CASCADE;
    DROP TABLE IF EXISTS patients CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `;

  try {
    await db.query(dropSql);
    console.log('[Rollback] ✓ Database tables dropped cleanly.');
    process.exit(0);
  } catch (err) {
    logger.error('[Rollback Error] Failed to drop tables:', err);
    process.exit(1);
  }
}

rollback();
