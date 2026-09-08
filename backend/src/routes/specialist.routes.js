const express = require('express');
const router = express.Router();
const controller = require('../controllers/specialist.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(requireAuth);
router.get('/', requireRole('ASHA','DOCTOR','ADMIN'), controller.list.bind(controller));
router.post('/presence', requireRole('DOCTOR'), controller.presence.bind(controller));

module.exports = router;
