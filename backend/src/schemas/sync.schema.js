/**
 * Sync Schemas - Nabha Telemedicine Backend
 * Zod validation schemas for offline sync push and pull operations
 */

const { z } = require('zod');

const syncOperationSchema = z.object({
  operationId: z.string().min(1, 'operationId is required'),
  entityType: z.enum(['PATIENT', 'VITAL', 'CONSULTATION', 'APPOINTMENT']),
  entityId: z.string().min(1, 'entityId is required'),
  operationType: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  payload: z.record(z.any()),
  clientCreatedAt: z.string().min(1, 'clientCreatedAt ISO timestamp is required')
});

const syncPushSchema = z.object({
  operations: z.array(syncOperationSchema).min(1, 'At least one operation required for sync push')
});

const syncPullSchema = z.object({
  lastSyncAt: z.string().optional()
});

module.exports = {
  syncOperationSchema,
  syncPushSchema,
  syncPullSchema
};
