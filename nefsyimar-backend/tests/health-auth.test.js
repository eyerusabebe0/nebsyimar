const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();

describe('Health endpoint', () => {
  it('GET /health returns OK status and metadata', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment');
  });
});

describe('Auth status endpoint', () => {
  it('GET /api/v1/auth/status returns unauthenticated when no session or token', async () => {
    const res = await request(app).get('/api/v1/auth/status');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      authenticated: false,
      data: null,
    });
  });
});
