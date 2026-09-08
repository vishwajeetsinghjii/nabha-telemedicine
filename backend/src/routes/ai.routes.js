/**
 * AI Routes - Nabha Telemedicine Backend (/api/v1/ai)
 */

const express = require('express');
const router = express.Router();

const aiController = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { publicAiLimiter } = require('../middleware/rateLimit.middleware');

router.post('/public-triage', publicAiLimiter, (req, res, next) => aiController.publicTriage(req, res, next));

router.use(requireAuth);

router.post('/triage', requireRole('ASHA', 'DOCTOR', 'ADMIN'), (req, res, next) => aiController.runTriage(req, res, next));

module.exports = router;
