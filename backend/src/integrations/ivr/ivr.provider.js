/**
 * IVR Provider Abstract Interface - Nabha Telemedicine Backend
 */

class IVRProvider {
  async handleWebhookPayload(payload) {
    throw new Error('handleWebhookPayload method must be implemented');
  }
}

module.exports = IVRProvider;
