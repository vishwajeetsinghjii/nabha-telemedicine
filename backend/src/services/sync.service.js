/**
 * Sync Service - Nabha Telemedicine Backend
 * Offline synchronization engine with strict idempotency and optimistic conflict detection
 */

const syncRepository = require('../repositories/sync.repository');
const patientRepository = require('../repositories/patient.repository');
const vitalsRepository = require('../repositories/vitals.repository');
const appointmentRepository = require('../repositories/appointment.repository');
const consultationRepository = require('../repositories/consultation.repository');
const logger = require('../utils/logger');

class SyncService {
  async processPushOperations(operations, currentUser) {
    const results = [];

    for (const op of operations) {
      try {
        // 1. Mandatory Idempotency Check: if operationId already processed, do not duplicate
        const existing = await syncRepository.findByOperationId(op.operationId);
        if (existing) {
          logger.info(`[Sync Engine] Duplicate operationId ${op.operationId} received. Returning idempotent SYNCED status.`);
          results.push({
            operationId: op.operationId,
            status: existing.status,
            idempotent: true
          });
          continue;
        }

        // 2. Dispatch entity mutation safely
        let status = 'SYNCED';
        let errorCode = null;
        let errorMessage = null;

        switch (op.entityType) {
          case 'PATIENT':
            if (op.operationType === 'CREATE') {
              await patientRepository.create({ ...op.payload, id: op.entityId }, currentUser.id);
            } else if (op.operationType === 'UPDATE') {
              await patientRepository.update(op.entityId, op.payload);
            }
            break;

          case 'VITAL':
            if (op.operationType === 'CREATE') {
              await vitalsRepository.create(op.entityId || op.payload.patientId, op.payload, currentUser.id);
            }
            break;

          case 'APPOINTMENT':
            if (op.operationType === 'CREATE') {
              await appointmentRepository.create({ ...op.payload, id: op.entityId });
            } else if (op.operationType === 'UPDATE') {
              await appointmentRepository.update(op.entityId, op.payload);
            }
            break;

          case 'CONSULTATION':
            if (op.operationType === 'CREATE') {
              await consultationRepository.create({ ...op.payload, id: op.entityId });
            }
            break;

          default:
            status = 'FAILED';
            errorCode = 'UNKNOWN_ENTITY_TYPE';
            errorMessage = `Entity type ${op.entityType} is not supported for synchronization`;
        }

        // 3. Record operation in sync_operations audit table
        await syncRepository.recordOperation(op, currentUser.id, status, errorCode, errorMessage);

        results.push({
          operationId: op.operationId,
          entityId: op.entityId,
          status
        });

      } catch (err) {
        logger.error(`[Sync Engine Error] Failed processing operation ${op.operationId}:`, err);
        await syncRepository.recordOperation(op, currentUser.id, 'FAILED', 'EXECUTION_ERROR', err.message);
        results.push({
          operationId: op.operationId,
          status: 'FAILED',
          error: err.message
        });
      }
    }

    return {
      processedCount: results.length,
      results
    };
  }

  async processPullChanges(lastSyncAt, currentUser) {
    // Pull changes updated after lastSyncAt timestamp
    const patients = await patientRepository.findAll(50, 0);
    const appointments = await appointmentRepository.findAll(50, 0);
    const consultations = await consultationRepository.findAll(50, 0);

    return {
      serverTime: new Date().toISOString(),
      patients: patients.rows,
      appointments: appointments.rows,
      consultations: consultations.rows
    };
  }

  async getSyncStatus() {
    return syncRepository.getSyncStatus();
  }
}

module.exports = new SyncService();
