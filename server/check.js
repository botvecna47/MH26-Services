const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient();
  
  // Get all tokens
  const tokens = await prisma.emailVerificationToken.findMany();
  console.log('Total tokens:', tokens.length);
  
  for (const t of tokens) {
    console.log('---');
    console.log('Token (first 50):', t.token.substring(0, 50));
    console.log('User ID:', t.userId);
    console.log('Expires:', t.expiresAt);
    
    // Try to decode email
    const parts = t.token.split('.');
    if (parts.length === 2) {
      const email = Buffer.from(parts[1], 'base64').toString();
      console.log('Decoded email:', email);
    }
  }
  
  // Get admin
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  console.log('\n--- Admin ---');
  console.log('Current email:', admin?.email);
  console.log('ID:', admin?.id);
  
  await prisma.$disconnect();
}

check();
