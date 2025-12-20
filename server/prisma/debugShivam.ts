import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Inspecting Provider: Shivam...');
  
  const providers = await prisma.user.findMany({
    where: { name: { contains: 'Shivam', mode: 'insensitive' } },
    include: { provider: true }
  });

  if (providers.length === 0) {
      console.log('❌ No user found with name "Shivam"');
  } else {
      providers.forEach(u => {
          console.log(`\nUser: ${u.name} (${u.email})`);
          if (u.provider) {
              console.log(`Provider Business: ${u.provider.businessName}`);
              console.log(`Primary Category: "${u.provider.primaryCategory}"`);
              console.log(`Status: ${u.provider.status}`);
          } else {
              console.log('❌ No Provider Profile found for this user.');
          }
      });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
