import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';

// Mock auth middleware
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 'user-123', role: 'USER' };
    next();
  },
  requireRole: (...roles: string[]) => (req: any, res: any, next: any) => {
    next();
  },
}));

// Mock logger
jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock validateEnv
jest.mock('../src/config/validateEnv', () => ({
  validateEnv: jest.fn(),
}));

// Mock Prisma
jest.mock('../src/config/db', () => ({
  prisma: {
    appeal: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    provider: {
      update: jest.fn(),
    },
  },
}));

describe('Appeal Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appeals', () => {
    it('should create an appeal', async () => {
      (prisma.appeal.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.appeal.create as jest.Mock).mockResolvedValue({
        id: 'appeal-123',
        userId: 'user-123',
        type: 'UNBAN_REQUEST',
        status: 'PENDING',
      });

      const res = await request(app)
        .post('/api/appeals')
        .send({
          type: 'UNBAN_REQUEST',
          reason: 'I was banned by mistake',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('appeal-123');
    });

    it('should return 400 if pending appeal exists', async () => {
      (prisma.appeal.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-appeal' });

      const res = await request(app)
        .post('/api/appeals')
        .send({
          type: 'UNBAN_REQUEST',
          reason: 'Another appeal',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/appeals', () => {
    it('should list appeals', async () => {
      (prisma.appeal.findMany as jest.Mock).mockResolvedValue([
        { id: 'appeal-1', status: 'PENDING' },
      ]);
      (prisma.appeal.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/appeals');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
