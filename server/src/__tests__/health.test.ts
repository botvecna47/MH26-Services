/**
 * Health Check Tests
 * Example test file
 */
import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should return detailed health status', async () => {
    const response = await request(app)
      .get('/api/health/detailed')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('services');
    expect(response.body.services).toHaveProperty('database');
    // Redis might be optional in dev environment
    if (response.body.services.redis) {
      expect(response.body.services).toHaveProperty('redis');
    }
  });
});

