/**
 * Appointment Controller - Nabha Telemedicine Backend
 */

const appointmentService = require('../services/appointment.service');
const { successResponse } = require('../utils/response');
const { createAppointmentSchema, updateAppointmentSchema } = require('../schemas/appointment.schema');

class AppointmentController {
  async getAllAppointments(req, res, next) {
    try {
      const result = await appointmentService.getAllAppointments(req.query, req.user);
      return successResponse(res, result.appointments, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  async getAppointmentById(req, res, next) {
    try {
      const appointment = await appointmentService.getAppointmentById(req.params.id, req.user);
      return successResponse(res, appointment, 200);
    } catch (err) {
      next(err);
    }
  }

  async createAppointment(req, res, next) {
    try {
      const validated = createAppointmentSchema.parse(req.body);
      const appointment = await appointmentService.createAppointment(validated, req.user);
      return successResponse(res, appointment, 201);
    } catch (err) {
      next(err);
    }
  }


  async acceptAppointment(req,res,next){try{return successResponse(res,await appointmentService.acceptAppointment(req.params.id,req.user),200);}catch(err){next(err);}}

  async updateAppointment(req, res, next) {
    try {
      const validated = updateAppointmentSchema.parse(req.body);
      const appointment = await appointmentService.updateAppointment(req.params.id, validated, req.user);
      return successResponse(res, appointment, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AppointmentController();
