/**
 * IVR Controller - Nabha Telemedicine Backend
 */

const ivrService = require('../services/ivr.service');
const { successResponse } = require('../utils/response');

class IVRController {
  async handleCallHandler(req, res, next) {
    try {
      const payload = { ...req.query, ...req.body };
      const result = await ivrService.handleCallWebhook(payload);
      return successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IVRController();
