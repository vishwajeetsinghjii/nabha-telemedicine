const specialistRepository = require('../repositories/specialist.repository');
const { successResponse } = require('../utils/response');
const { ValidationError, AuthorizationError } = require('../utils/errors');

class SpecialistController {
  async list(req, res, next) {
    try {
      const specialists = await specialistRepository.listSpecialists();
      return successResponse(res, specialists, 200);
    } catch (err) { next(err); }
  }

  async presence(req, res, next) {
    try {
      if (req.user.role !== 'DOCTOR') throw new AuthorizationError('Only doctors can update doctor presence');
      const status = String(req.body?.status || '').toUpperCase();
      if (!['ONLINE','AWAY','OFFLINE'].includes(status)) throw new ValidationError('Invalid presence status');
      const result = await specialistRepository.setPresence(req.user.id, status);
      return successResponse(res, result, 200);
    } catch (err) { next(err); }
  }
}
module.exports = new SpecialistController();
