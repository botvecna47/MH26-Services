
import request from 'supertest';
import app from '../app';

describe('Provider Endpoints', () => {
  it('should list providers', async () => {
    const res = await request(app).get('/api/providers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
