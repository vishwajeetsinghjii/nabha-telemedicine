/**
 * Patient Routes - Nabha Telemedicine Backend (/api/v1/patients)
 */

const express = require('express');
const router = express.Router();

const patientController = require('../controllers/patient.controller');
const vitalsController = require('../controllers/vitals.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);

router.post('/', requireRole('ASHA', 'ADMIN'), (req, res, next) => patientController.createPatient(req, res, next));
router.get('/me', requireRole('PATIENT'), (req, res, next) => patientController.getMyPatient(req, res, next));
router.get('/', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => patientController.getAllPatients(req, res, next));
router.get('/:id', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => patientController.getPatientById(req, res, next));
router.put('/:id', requireRole('ASHA', 'ADMIN'), (req, res, next) => patientController.updatePatient(req, res, next));

router.post('/:id/vitals', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => vitalsController.recordVitals(req, res, next));
router.get('/:id/vitals', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => vitalsController.getVitals(req, res, next));
router.get('/:id/history', requireRole('ASHA', 'DOCTOR', 'ADMIN', 'PATIENT'), (req, res, next) => patientController.getPatientHistory(req, res, next));

module.exports = router;
