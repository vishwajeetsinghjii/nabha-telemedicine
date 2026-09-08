/**
 * Video Routes - Nabha Telemedicine Backend (/api/v1/video)
 */

const express = require('express');
const router = express.Router();

const videoController = require('../controllers/video.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.post('/sessions', (req, res, next) => videoController.createSession(req, res, next));
router.get('/consultations/:consultationId/session', (req, res, next) => videoController.getSessionForConsultation(req, res, next));
router.get('/sessions/:id', (req, res, next) => videoController.getSessionById(req, res, next));
router.post('/sessions/:id/end', (req, res, next) => videoController.endSession(req, res, next));

module.exports = router;
