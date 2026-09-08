/**
 * Health & Core Integration Tests - Nabha Telemedicine Backend
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /health Diagnostic Endpoint', () => {
  it('should return health status JSON with X-Request-ID header', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBeOneOf([200, 503]);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('database');
  });

  it('should handle 404 for non-existent routes', async () => {
    const response = await request(app).get('/unknown-api-path-xyz');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});

// Helper for Jest toBeOneOfmatcher
expect.extend({
  toBeOneOf(received, expectedArray) {
    const pass = expectedArray.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expectedArray.join(', ')}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expectedArray.join(', ')}`,
        pass: false
      };
    }
  }
});
