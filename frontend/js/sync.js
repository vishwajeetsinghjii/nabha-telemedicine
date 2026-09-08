/**
 * Offline Sync Engine - Nabha Telemedicine Platform
 * Queues local CRUD operations when offline and syncs automatically when network returns
 */

class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('online', () => {
      console.log('[Sync Engine] Network restored! Triggering automatic sync queue processing...');
      this.processQueue();
    });
  }

  /**
   * Add a new operation to the offline sync queue
   */
  async queueOperation(entityType, entityId, operationType, payload) {
    const op = {
      operationId: `op-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      entityType,
      entityId,
      operationType,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING',
      lastError: null
    };

    await idb.addRecord('syncQueue', op);
    console.log(`[Sync Engine] Queued operation ${op.operationId} for ${entityType}:${operationType}`);

    // If online, attempt immediate sync
    if (offline.isOnline()) {
      this.processQueue();
    } else {
      ui.showToast('Saved offline. Will sync automatically when connected.', 'warning');
    }

    return op;
  }

  /**
   * Process all pending operations in the sync queue
   */
  async processQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const allOps = await idb.getAllRecords('syncQueue');
      const pendingOps = allOps.filter(o => o.status === 'PENDING' || o.status === 'FAILED');

      if (pendingOps.length === 0) {
        this.isSyncing = false;
        return;
      }

      ui.updateConnectivityStatus('SYNCING');
      ui.showToast(`Syncing ${pendingOps.length} offline records...`, 'info', 2000);

      let successCount = 0;

      for (const op of pendingOps) {
        const success = await this.syncOperation(op);
        if (success) {
          successCount++;
        }
      }

      ui.updateConnectivityStatus('ONLINE');

      if (successCount > 0) {
        ui.showToast(`✓ Sync complete! ${successCount} records synchronized.`, 'success');
      }
    } catch (err) {
      console.error('[Sync Engine] Error processing sync queue:', err);
      ui.updateConnectivityStatus('FAILED');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Execute sync for a single operation
   */
  async syncOperation(op) {
    op.status = 'SYNCING';
    await idb.updateRecord('syncQueue', op);

    try {
      // Simulate remote API push
      await new Promise(resolve => setTimeout(resolve, 600));

      // Update local entity status to SYNCED
      await this.updateLocalEntityStatus(op.entityType, op.entityId, 'SYNCED');

      // Remove from queue upon success
      await idb.deleteRecord('syncQueue', op.operationId);
      console.log(`[Sync Engine] Successfully synced ${op.entityType}:${op.entityId}`);
      return true;
    } catch (err) {
      console.error(`[Sync Engine] Failed to sync operation ${op.operationId}:`, err);
      op.retryCount++;
      op.status = 'FAILED';
      op.lastError = err.message || 'Network error';
      await idb.updateRecord('syncQueue', op);
      return false;
    }
  }

  async updateLocalEntityStatus(entityType, entityId, newStatus) {
    let storeName = '';
    switch (entityType) {
      case 'PATIENT': storeName = 'patients'; break;
      case 'VITALS': storeName = 'vitals'; break;
      case 'CONSULTATION': storeName = 'consultations'; break;
      case 'PRESCRIPTION': storeName = 'prescriptions'; break;
      case 'APPOINTMENT': storeName = 'appointments'; break;
    }

    if (!storeName) return;

    const record = await idb.getRecord(storeName, entityId);
    if (record) {
      record.syncStatus = newStatus;
      record.updatedAt = new Date().toISOString();
      await idb.updateRecord(storeName, record);
    }
  }

  async getSyncStatus() {
    const allOps = await idb.getAllRecords('syncQueue');
    return {
      pendingCount: allOps.filter(o => o.status === 'PENDING').length,
      failedCount: allOps.filter(o => o.status === 'FAILED').length,
      totalCount: allOps.length,
      operations: allOps
    };
  }
}

const syncEngine = new SyncEngine();
