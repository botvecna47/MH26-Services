
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.provider.findMany({
    select: {
      id: true,
      businessName: true,
      primaryCategory: true,
      status: true,
      services: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  const fs = require('fs');
  fs.writeFileSync('categories_utf8.txt', JSON.stringify(providers, null, 2), 'utf8');
  console.log('Written to categories_utf8.txt');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
