/**
 * AI Controller - Nabha Telemedicine Backend
 */

const aiService = require('../services/ai.service');
const { successResponse } = require('../utils/response');

class AIController {
  async publicTriage(req, res, next) {
    try {
      const { symptoms, age, gender, vitals } = req.body || {};
      const result = await aiService.runPublicTriage({ symptoms, age, gender, vitals });
      return successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async runTriage(req, res, next) {
    try {
      const { patientId, symptoms, vitals, consultationId } = req.body;
      const result = await aiService.runTriage(patientId, symptoms, vitals, consultationId, req.user);
      return successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
