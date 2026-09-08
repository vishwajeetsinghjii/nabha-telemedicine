/**
 * AI Service - Nabha Telemedicine Backend
 * Orchestrates AI preliminary triage requests with safe error fallback
 */

const FastAPIAIProvider = require('../integrations/ai/fastapi.provider');
const aiRepository = require('../repositories/ai.repository');
const patientRepository = require('../repositories/patient.repository');
const { NotFoundError, ExternalServiceError } = require('../utils/errors');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.aiProvider = new FastAPIAIProvider();
  }

  async runPublicTriage({ symptoms, age, gender, vitals }) {
    const text = typeof symptoms === 'string' ? symptoms.trim() : '';
    if (text.length < 2 || text.length > 4000) {
      const { ValidationError } = require('../utils/errors');
      throw new ValidationError('Please describe your symptoms in 2 to 4000 characters.');
    }
    const normalizedAge = age === undefined || age === '' || age === null ? null : Number(age);
    if (normalizedAge !== null && (!Number.isInteger(normalizedAge) || normalizedAge < 0 || normalizedAge > 120)) {
      const { ValidationError } = require('../utils/errors');
      throw new ValidationError('Age must be between 0 and 120 years.');
    }
    const safeVitals = vitals && typeof vitals === 'object' ? vitals : {};
    const result = await this.aiProvider.evaluateTriage(null, text, safeVitals, { age: normalizedAge, gender });
    return {
      ...result,
      disclaimer: 'This is an AI-assisted preliminary symptom check, not a diagnosis. It cannot replace a doctor. If symptoms are severe or life-threatening, seek emergency medical care immediately.',
      analyzedAt: new Date().toISOString(),
      public: true
    };
  }

  async runTriage(patientId, symptoms, vitals, consultationId, currentUser) {
    if (patientId) {
      const patient = await patientRepository.findById(patientId);
      if (!patient) {
        throw new NotFoundError('Patient');
      }
    }

    try {
      // 1. Evaluate triage via AI Provider
      const triageResult = await this.aiProvider.evaluateTriage(patientId, symptoms, vitals);

      // 2. Persist assessment in ai_triage_results
      const savedRecord = await aiRepository.saveTriageResult({
        patientId,
        consultationId,
        requestedBy: currentUser.id,
        ...triageResult
      });

      return {
        disclaimer: 'AI-assisted preliminary triage ONLY. Not a definitive diagnosis.',
        assessment: savedRecord
      };

    } catch (err) {
      logger.error('[AI Service Fallback Triggered]', err);
      // Section 34: If AI service fails, return graceful error code without failing entire patient workflow
      throw new ExternalServiceError('AI Service', 'AI triage is temporarily unavailable. Please proceed with manual clinical assessment.');
    }
  }
}

module.exports = new AIService();
