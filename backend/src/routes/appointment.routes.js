/**
 * Appointment Routes - Nabha Telemedicine Backend (/api/v1/appointments)
 */

const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);

router.post('/', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => appointmentController.createAppointment(req, res, next));
router.get('/', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => appointmentController.getAllAppointments(req, res, next));
router.get('/:id', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => appointmentController.getAppointmentById(req, res, next));
router.post('/:id/accept', requireRole('DOCTOR'), (req, res, next) => appointmentController.acceptAppointment(req, res, next));
router.put('/:id', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => appointmentController.updateAppointment(req, res, next));

module.exports = router;
