/**
 * Video Provider Abstract Interface - Nabha Telemedicine Backend
 */

class VideoProvider {
  async createRoom(consultationId) {
    throw new Error('createRoom method must be implemented');
  }

  async generateToken(roomId, userId) {
    throw new Error('generateToken method must be implemented');
  }

  async endSession(sessionId) {
    throw new Error('endSession method must be implemented');
  }
}

module.exports = VideoProvider;
