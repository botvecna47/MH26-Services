/**
 * Test Setup
 * Configuration for Jest tests
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/mh26_test',
    },
  },
});

beforeAll(async () => {
  // Setup test database
  // await prisma.$connect();
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  // await prisma.$executeRaw`TRUNCATE TABLE "User", "Provider", "Booking" CASCADE`;
});

export { prisma };

