/**
 * Sync Routes - Nabha Telemedicine Backend (/api/v1/sync)
 */

const express = require('express');
const router = express.Router();

const syncController = require('../controllers/sync.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.post('/push', (req, res, next) => syncController.pushOperations(req, res, next));
router.post('/pull', (req, res, next) => syncController.pullChanges(req, res, next));
router.get('/status', (req, res, next) => syncController.getSyncStatus(req, res, next));

module.exports = router;
