/**
 * Patient Controller - Nabha Telemedicine Backend
 */

const patientService = require('../services/patient.service');
const { successResponse } = require('../utils/response');
const { createPatientSchema, updatePatientSchema } = require('../schemas/patient.schema');

class PatientController {
  async getAllPatients(req, res, next) {
    try {
      const result = await patientService.getAllPatients(req.query, req.user);
      return successResponse(res, result.patients, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getMyPatient(req, res, next) {
    try {
      const patient = await patientService.getPatientByUser(req.user);
      return successResponse(res, patient, 200);
    } catch (err) {
      next(err);
    }
  }

  async getPatientById(req, res, next) {
    try {
      const patient = await patientService.getPatientById(req.params.id, req.user);
      return successResponse(res, patient, 200);
    } catch (err) {
      next(err);
    }
  }

  async createPatient(req, res, next) {
    try {
      const validated = createPatientSchema.parse(req.body);
      const patient = await patientService.createPatient(validated, req.user);
      return successResponse(res, patient, 201);
    } catch (err) {
      next(err);
    }
  }

  async updatePatient(req, res, next) {
    try {
      const validated = updatePatientSchema.parse(req.body);
      const patient = await patientService.updatePatient(req.params.id, validated, req.user);
      return successResponse(res, patient, 200);
    } catch (err) {
      next(err);
    }
  }

  async getPatientHistory(req, res, next) {
    try {
      const history = await patientService.getPatientMedicalHistory(req.params.id, req.user);
      return successResponse(res, history, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PatientController();
