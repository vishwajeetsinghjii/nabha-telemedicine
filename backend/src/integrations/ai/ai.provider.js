/**
 * AI Provider Interface - Nabha Telemedicine Backend
 * Abstract interface for AI preliminary triage providers
 */

class AIProvider {
  async evaluateTriage(patientId, symptoms, vitals) {
    throw new Error('evaluateTriage method must be implemented by concrete AI provider');
  }
}

module.exports = AIProvider;
