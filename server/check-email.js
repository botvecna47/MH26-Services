// Check email verification tokens and admin user email
const { PrismaClient } = require('@prisma/client');

async function checkEmailData() {
  const prisma = new PrismaClient();
  
  try {
    // Get all email verification tokens
    console.log('\n=== Email Verification Tokens ===');
    const tokens = await prisma.emailVerificationToken.findMany({
      include: { user: { select: { id: true, email: true, name: true } } }
    });
    
    if (tokens.length === 0) {
      console.log('No verification tokens found in database.');
    } else {
      tokens.forEach(t => {
        console.log(`Token: ${t.token.substring(0, 30)}...`);
        console.log(`  User: ${t.user?.name} (${t.user?.email})`);
        console.log(`  Expires: ${t.expiresAt}`);
        
        // Decode email from token
        const parts = t.token.split('.');
        if (parts.length === 2) {
          try {
            const decoded = Buffer.from(parts[1], 'base64').toString('ascii');
            console.log(`  New Email (decoded): ${decoded}`);
          } catch (e) {
            console.log('  Could not decode email from token');
          }
        }
        console.log('');
      });
    }
    
    // Get admin user
    console.log('\n=== Admin User ===');
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, emailVerified: true }
    });
    
    if (admin) {
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Email Verified: ${admin.emailVerified}`);
      console.log(`ID: ${admin.id}`);
    } else {
      console.log('No admin user found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailData();
