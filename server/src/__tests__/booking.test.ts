
import request from 'supertest';
import app from '../app';

describe('Booking Endpoints', () => {
  it('should require authentication to create booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({
        serviceId: 'some-id',
        date: new Date().toISOString()
      });
    
    expect(res.status).toBe(401);
  });
});
