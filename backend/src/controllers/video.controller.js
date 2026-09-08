/**
 * Video Controller - Nabha Telemedicine Backend
 */

const videoService = require('../services/video.service');
const { successResponse } = require('../utils/response');

class VideoController {
  async createSession(req, res, next) {
    try {
      const { consultationId } = req.body;
      const session = await videoService.createSession(consultationId, req.user);
      return successResponse(res, session, 201);
    } catch (err) {
      next(err);
    }
  }

  async getSessionForConsultation(req,res,next){try{const session=await videoService.getSessionForConsultation(req.params.consultationId,req.user);return successResponse(res,session,200)}catch(err){next(err)}}

  async getSessionById(req, res, next) {
    try {
      const session = await videoService.getSessionById(req.params.id, req.user);
      return successResponse(res, session, 200);
    } catch (err) {
      next(err);
    }
  }

  async endSession(req, res, next) {
    try {
      const session = await videoService.endSession(req.params.id, req.user);
      return successResponse(res, session, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new VideoController();
