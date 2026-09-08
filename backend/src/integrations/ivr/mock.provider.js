/**
 * Mock IVR Provider - Nabha Telemedicine Backend
 * Local standalone IVR webhook parser requiring zero external API tokens
 */

const IVRProvider = require('./ivr.provider');

class MockIVRProvider extends IVRProvider {
  async handleWebhookPayload(payload) {
    const callerNumber = payload.caller || payload.From || payload.mobile || '9876543212';
    const eventType = payload.eventType || payload.CallStatus || 'INCOMING_CALL';

    return {
      provider: 'mock',
      eventType,
      callerNumber,
      referenceId: payload.callSid || `mock-call-${Date.now()}`,
      metadata: payload,
      responseAction: 'PLAY_WELCOME_IVR_MENU'
    };
  }
}

module.exports = MockIVRProvider;
