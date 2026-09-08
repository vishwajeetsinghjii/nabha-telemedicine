/**
 * Consultation Controller - Nabha Telemedicine Backend
 */

const consultationService = require('../services/consultation.service');
const { successResponse } = require('../utils/response');
const { createConsultationSchema, consultationNoteSchema } = require('../schemas/appointment.schema');

class ConsultationController {
  async getAllConsultations(req, res, next) {
    try {
      const result = await consultationService.getAllConsultations(req.query, req.user);
      return successResponse(res, result.consultations, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getConsultationById(req, res, next) {
    try {
      const consultation = await consultationService.getConsultationById(req.params.id, req.user);
      return successResponse(res, consultation, 200);
    } catch (err) {
      next(err);
    }
  }

  async createConsultation(req, res, next) {
    try {
      const validated = createConsultationSchema.parse(req.body);
      const consultation = await consultationService.createConsultation(validated, req.user);
      return successResponse(res, consultation, 201);
    } catch (err) {
      next(err);
    }
  }

  async startAppointment(req, res, next) {
    try {
      const consultation = await consultationService.startAppointment(req.params.appointmentId, req.user);
      return successResponse(res, consultation, 200);
    } catch (err) {
      next(err);
    }
  }

  async startConsultation(req, res, next) {
    try {
      const consultation = await consultationService.startConsultation(req.params.id, req.user);
      return successResponse(res, consultation, 200);
    } catch (err) {
      next(err);
    }
  }

  async completeConsultation(req, res, next) {
    try {
      const consultation = await consultationService.completeConsultation(req.params.id, req.body, req.user);
      return successResponse(res, consultation, 200);
    } catch (err) {
      next(err);
    }
  }

  async saveSoap(req, res, next) {
    try {
      const consultation = await consultationService.saveSoap(req.params.id, req.body, req.user);
      return successResponse(res, consultation, 200);
    } catch (err) {
      next(err);
    }
  }

  async cancelConsultation(req, res, next) {
    try {
      const consultation = await consultationService.cancelConsultation(req.params.id, req.user);
      return successResponse(res, consultation, 200);
    } catch (err) {
      next(err);
    }
  }

  async addNote(req, res, next) {
    try {
      const validated = consultationNoteSchema.parse(req.body);
      const note = await consultationService.addNote(req.params.id, validated.note, req.user);
      return successResponse(res, note, 201);
    } catch (err) {
      next(err);
    }
  }

  async getNotes(req, res, next) {
    try {
      const notes = await consultationService.getNotes(req.params.id, req.user);
      return successResponse(res, notes, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ConsultationController();
