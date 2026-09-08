/**
 * Admin Onboarding Controller - Nabha Telemedicine Backend
 * Privileged account provisioning, doctor application review, and account lifecycle management
 */

const onboardingService = require('../services/onboarding.service');
const { inviteAshaSchema, reviewDoctorSchema } = require('../schemas/onboarding.schema');

class OnboardingController {
  async inviteAsha(req, res, next) {
    try {
      const validated = inviteAshaSchema.parse(req.body);
      const result = await onboardingService.inviteAsha(req.user.id, validated);
      res.status(201).json({
        success: true,
        message: 'ASHA account provisioned successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async listDoctorApplications(req, res, next) {
    try {
      const { status } = req.query;
      const applications = await onboardingService.listDoctorApplications(status);
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (err) {
      next(err);
    }
  }

  async getDoctorApplicationById(req, res, next) {
    try {
      const application = await onboardingService.getDoctorApplicationById(req.params.id);
      res.status(200).json({
        success: true,
        data: application
      });
    } catch (err) {
      next(err);
    }
  }

  async approveDoctor(req, res, next) {
    try {
      const validated = reviewDoctorSchema.parse(req.body);
      const result = await onboardingService.approveDoctor(req.user.id, req.params.id, validated.notes);
      res.status(200).json({
        success: true,
        message: 'Doctor application APPROVED. User account activated with DOCTOR role.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectDoctor(req, res, next) {
    try {
      const validated = reviewDoctorSchema.parse(req.body);
      const result = await onboardingService.rejectDoctor(req.user.id, req.params.id, validated.notes);
      res.status(200).json({
        success: true,
        message: 'Doctor application REJECTED.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async activateUser(req, res, next) {
    try {
      const updated = await onboardingService.setUserStatus(req.user.id, req.params.id, 'ACTIVE');
      res.status(200).json({ success: true, message: 'User account activated.', data: updated });
    } catch (err) {
      next(err);
    }
  }

  async suspendUser(req, res, next) {
    try {
      const updated = await onboardingService.setUserStatus(req.user.id, req.params.id, 'SUSPENDED');
      res.status(200).json({ success: true, message: 'User account suspended.', data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deactivateUser(req, res, next) {
    try {
      const updated = await onboardingService.setUserStatus(req.user.id, req.params.id, 'DEACTIVATED');
      res.status(200).json({ success: true, message: 'User account deactivated.', data: updated });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OnboardingController();
