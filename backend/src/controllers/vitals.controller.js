/**
 * Vitals Controller - Nabha Telemedicine Backend
 */

const vitalsService = require('../services/vitals.service');
const { successResponse } = require('../utils/response');
const { recordVitalsSchema } = require('../schemas/patient.schema');

class VitalsController {
  async recordVitals(req, res, next) {
    try {
      const validated = recordVitalsSchema.parse(req.body);
      const vitals = await vitalsService.recordVitals(req.params.id, validated, req.user);
      return successResponse(res, vitals, 201);
    } catch (err) {
      next(err);
    }
  }

  async getVitals(req, res, next) {
    try {
      const vitals = await vitalsService.getVitalsByPatientId(req.params.id, req.user);
      return successResponse(res, vitals, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new VitalsController();
