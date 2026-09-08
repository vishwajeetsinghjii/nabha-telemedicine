/**
 * Prescription Controller - Nabha Telemedicine Backend
 */

const prescriptionService = require('../services/prescription.service');
const { successResponse } = require('../utils/response');
const { createPrescriptionSchema } = require('../schemas/prescription.schema');

class PrescriptionController {
  async getAllPrescriptions(req, res, next) {
    try {
      const result = await prescriptionService.getAllPrescriptions(req.query, req.user);
      return successResponse(res, result.prescriptions, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getPrescriptionById(req, res, next) {
    try {
      const rx = await prescriptionService.getPrescriptionById(req.params.id, req.user);
      return successResponse(res, rx, 200);
    } catch (err) {
      next(err);
    }
  }

  async createPrescription(req, res, next) {
    try {
      const validated = createPrescriptionSchema.parse(req.body);
      const rx = await prescriptionService.createPrescription(validated, req.user);
      return successResponse(res, rx, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PrescriptionController();
