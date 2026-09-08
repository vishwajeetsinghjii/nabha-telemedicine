/**
 * Storage Manager - Nabha Telemedicine Platform
 * Safe wrapper for LocalStorage with in-memory fallback
 */

class StorageManager {
  constructor() {
    this.memoryStorage = new Map();
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory storage fallback.');
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    try {
      if (this.isAvailable) {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } else {
        return this.memoryStorage.has(key) ? this.memoryStorage.get(key) : defaultValue;
      }
    } catch (e) {
      console.error(`Error reading key ${key} from storage:`, e);
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (this.isAvailable) {
        window.localStorage.setItem(key, serialized);
      } else {
        this.memoryStorage.set(key, value);
      }
      return true;
    } catch (e) {
      console.error(`Error setting key ${key} in storage:`, e);
      return false;
    }
  }

  removeItem(key) {
    try {
      if (this.isAvailable) {
        window.localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
      return true;
    } catch (e) {
      console.error(`Error removing key ${key} from storage:`, e);
      return false;
    }
  }

  clear() {
    try {
      if (this.isAvailable) {
        window.localStorage.clear();
      } else {
        this.memoryStorage.clear();
      }
      return true;
    } catch (e) {
      console.error('Error clearing storage:', e);
      return false;
    }
  }
}

const storage = new StorageManager();
