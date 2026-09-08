/**
 * Mock Video Provider - Nabha Telemedicine Backend
 * Local standalone mock implementation requiring zero third-party cloud credentials
 */

const VideoProvider = require('./video.provider');
const { v4: uuidv4 } = require('uuid');

class MockVideoProvider extends VideoProvider {
  async createRoom(consultationId) {
    const roomId = `nabha-room-${consultationId || uuidv4().slice(0, 8)}`;
    return {
      provider: 'mock',
      roomId,
      sessionToken: `mock-token-${uuidv4()}`
    };
  }

  async generateToken(roomId, userId) {
    return `mock-token-${userId}-${Date.now()}`;
  }

  async endSession(sessionId) {
    return { status: 'ENDED', endedAt: new Date().toISOString() };
  }
}

module.exports = MockVideoProvider;
