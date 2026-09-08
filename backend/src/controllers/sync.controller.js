/**
 * Sync Controller - Nabha Telemedicine Backend
 */

const syncService = require('../services/sync.service');
const { successResponse } = require('../utils/response');
const { syncPushSchema, syncPullSchema } = require('../schemas/sync.schema');

class SyncController {
  async pushOperations(req, res, next) {
    try {
      const validated = syncPushSchema.parse(req.body);
      const result = await syncService.processPushOperations(validated.operations, req.user);
      return successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async pullChanges(req, res, next) {
    try {
      const validated = syncPullSchema.parse(req.body);
      const result = await syncService.processPullChanges(validated.lastSyncAt, req.user);
      return successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async getSyncStatus(req, res, next) {
    try {
      const status = await syncService.getSyncStatus();
      return successResponse(res, status, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SyncController();
