/**
 * Test Setup
 * Runs before all tests
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  await prisma.$disconnect();
});

