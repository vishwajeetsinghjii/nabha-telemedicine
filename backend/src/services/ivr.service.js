/**
 * IVR Service - Nabha Telemedicine Backend
 * Manages incoming telephony IVR call events and logs ivr_events
 */

const env = require('../config/env');
const MockIVRProvider = require('../integrations/ivr/mock.provider');
const ExotelIVRProvider = require('../integrations/ivr/exotel.provider');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const memoryIvrEvents = [];

class IVRService {
  constructor() {
    this.selectProvider();
  }

  selectProvider() {
    const providerType = (env.IVR_PROVIDER || 'mock').toLowerCase();
    if (providerType === 'exotel') {
      this.provider = new ExotelIVRProvider();
    } else {
      if(env.NODE_ENV==='production') throw new Error('Mock IVR provider is not permitted in production');
      this.provider = new MockIVRProvider();
    }
  }

  async handleCallWebhook(payload) {
    const parsed = await this.provider.handleWebhookPayload(payload);
    const id = uuidv4();

    const isHealthy = await db.checkHealth();
    if (isHealthy) {
      const sql = `
        INSERT INTO ivr_events (id, provider, event_type, caller_number, reference_id, payload_metadata, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const res = await db.query(sql, [
        id, parsed.provider, parsed.eventType, parsed.callerNumber,
        parsed.referenceId, JSON.stringify(parsed.metadata), 'PROCESSED'
      ]);
      return { event: res.rows[0], action: parsed.responseAction };
    }

    const eventRecord = {
      id,
      provider: parsed.provider,
      eventType: parsed.eventType,
      callerNumber: parsed.callerNumber,
      referenceId: parsed.referenceId,
      status: 'PROCESSED',
      createdAt: new Date().toISOString()
    };
    memoryIvrEvents.push(eventRecord);
    return { event: eventRecord, action: parsed.responseAction };
  }
}

module.exports = new IVRService();
