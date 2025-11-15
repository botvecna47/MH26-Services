/**
 * Authentication E2E Tests
 */
import request from 'supertest';
import app from '../../src/app';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+91-9876543210',
          password: 'password123',
          role: 'CUSTOMER',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.tokens).toHaveProperty('refreshToken');
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'duplicate@example.com',
          phone: '+91-9876543211',
          password: 'password123',
        });

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'duplicate@example.com',
          phone: '+91-9876543212',
          password: 'password123',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Register first
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@example.com',
          phone: '+91-9876543213',
          password: 'password123',
        });

      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tokens');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});

