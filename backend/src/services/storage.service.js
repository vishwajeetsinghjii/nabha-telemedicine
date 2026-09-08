/**
 * Storage Service Abstraction - Nabha Telemedicine Backend
 * Manages server-side file storage (local filesystem initially, S3 compatible later)
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const STORAGE_DIR = path.join(__dirname, '../../storage/prescriptions');

// Ensure local storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

class StorageService {
  async saveFile(filename, contentBuffer) {
    const filePath = path.join(STORAGE_DIR, filename);
    await fs.promises.writeFile(filePath, contentBuffer);
    logger.info(`[Storage Service] Saved file locally: ${filePath}`);
    return filePath;
  }

  async getFileStream(filePath) {
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);
    }
    return null;
  }
}

module.exports = new StorageService();
