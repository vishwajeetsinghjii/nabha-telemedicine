/**
 * IndexedDB Core Database Engine - Nabha Telemedicine Platform
 * Primary offline database storage for patients, vitals, consultations, prescriptions, and sync queue
 */

class IndexedDBEngine {
  constructor() {
    this.dbName = 'nabhaTelemedicine';
    this.dbVersion = 2;
    this.db = null;
    this.isReady = false;
  }

  async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('[IndexedDB] Upgrading schema...');

        // 1. Patients store
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('mobile', 'mobile', { unique: false });
          patientStore.createIndex('village', 'village', { unique: false });
          patientStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        // 2. Vitals store
        if (!db.objectStoreNames.contains('vitals')) {
          const vitalsStore = db.createObjectStore('vitals', { keyPath: 'id' });
          vitalsStore.createIndex('patientId', 'patientId', { unique: false });
        }

        // 3. Consultations store
        if (!db.objectStoreNames.contains('consultations')) {
          const consultStore = db.createObjectStore('consultations', { keyPath: 'id' });
          consultStore.createIndex('patientId', 'patientId', { unique: false });
          consultStore.createIndex('doctorId', 'doctorId', { unique: false });
          consultStore.createIndex('status', 'status', { unique: false });
        }

        // 4. Prescriptions store
        if (!db.objectStoreNames.contains('prescriptions')) {
          const rxStore = db.createObjectStore('prescriptions', { keyPath: 'id' });
          rxStore.createIndex('patientId', 'patientId', { unique: false });
          rxStore.createIndex('consultationId', 'consultationId', { unique: false });
        }

        // 5. Appointments store
        if (!db.objectStoreNames.contains('appointments')) {
          const apptStore = db.createObjectStore('appointments', { keyPath: 'id' });
          apptStore.createIndex('patientId', 'patientId', { unique: false });
          apptStore.createIndex('doctorId', 'doctorId', { unique: false });
        }

        // 6. Sync Queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'operationId' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 7. Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        this.isReady = true;
        console.log('[IndexedDB] Database initialized successfully.');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Error initializing database:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // --- Generic CRUD Operations ---

  async addRecord(storeName, record) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(record);

      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getRecord(storeName, id) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllRecords(storeName) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async updateRecord(storeName, record) {
    return this.addRecord(storeName, record);
  }

  async deleteRecord(storeName, id) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async clearStore(storeName) {
    await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

}

const idb = new IndexedDBEngine();
