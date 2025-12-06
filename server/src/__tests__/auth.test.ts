
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'CUSTOMER',
        phone: '1234567890'
      });
    
    // Expect 201 Created or 200 OK depending on implementation
    // Also might return 400 if email service fails (mocking needed?)
    // For now, let's see what it returns.
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('message');
  });

  it('should login the user', async () => {
    // First verify/activate the user if needed. 
    // Assuming direct login might fail if not verified.
    // Let's manually verify the user in DB
    await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { emailVerified: true, phoneVerified: true }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});
