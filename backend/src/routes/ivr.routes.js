/**
 * IVR Routes - Nabha Telemedicine Backend (/api/v1/ivr)
 */

const express = require('express');
const router = express.Router();

const ivrController = require('../controllers/ivr.controller');

router.post('/call-handler', (req, res, next) => ivrController.handleCallHandler(req, res, next));
router.get('/call-handler', (req, res, next) => ivrController.handleCallHandler(req, res, next));

module.exports = router;
