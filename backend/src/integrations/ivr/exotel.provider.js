/**
 * Exotel IVR Provider - Nabha Telemedicine Backend
 * Parses Exotel telephony webhook payloads and formats ExML responses
 */

const IVRProvider = require('./ivr.provider');

class ExotelIVRProvider extends IVRProvider {
  async handleWebhookPayload(payload) {
    const callerNumber = payload.From || payload.CallFrom || 'Unknown';
    const callSid = payload.CallSid || `exotel-${Date.now()}`;
    const status = payload.Status || 'completed';

    return {
      provider: 'exotel',
      eventType: status,
      callerNumber,
      referenceId: callSid,
      metadata: payload,
      responseAction: 'CONNECT_TO_DUTY_DOCTOR'
    };
  }
}

module.exports = ExotelIVRProvider;
