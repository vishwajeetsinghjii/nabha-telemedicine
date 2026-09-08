/**
 * Prescription Routes - Nabha Telemedicine Backend (/api/v1/prescriptions)
 */

const express = require('express');
const router = express.Router();

const prescriptionController = require('../controllers/prescription.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);

router.post('/', requireRole('DOCTOR', 'ADMIN'), (req, res, next) => prescriptionController.createPrescription(req, res, next));
router.get('/', requireRole('DOCTOR', 'ASHA', 'ADMIN', 'PATIENT'), (req, res, next) => prescriptionController.getAllPrescriptions(req, res, next));
router.get('/:id', requireRole('DOCTOR', 'ASHA', 'ADMIN', 'PATIENT'), (req, res, next) => prescriptionController.getPrescriptionById(req, res, next));

module.exports = router;
