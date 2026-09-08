/**
 * Consultation Routes - Nabha Telemedicine Backend (/api/v1/consultations)
 */

const express = require('express');
const router = express.Router();

const consultationController = require('../controllers/consultation.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);

router.post('/', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => consultationController.createConsultation(req, res, next));
router.get('/', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => consultationController.getAllConsultations(req, res, next));
router.get('/:id', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => consultationController.getConsultationById(req, res, next));

router.post('/appointments/:appointmentId/start', requireRole('DOCTOR'), (req, res, next) => consultationController.startAppointment(req, res, next));
router.post('/:id/start', requireRole('DOCTOR'), (req, res, next) => consultationController.startConsultation(req, res, next));
router.post('/:id/complete', requireRole('DOCTOR'), (req, res, next) => consultationController.completeConsultation(req, res, next));
router.post('/:id/soap', requireRole('DOCTOR'), (req, res, next) => consultationController.saveSoap(req, res, next));
router.post('/:id/cancel', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => consultationController.cancelConsultation(req, res, next));

router.post('/:id/notes', requireRole('DOCTOR'), (req, res, next) => consultationController.addNote(req, res, next));
router.get('/:id/notes', requireRole('DOCTOR', 'ASHA', 'ADMIN', 'PATIENT'), (req, res, next) => consultationController.getNotes(req, res, next));

module.exports = router;
