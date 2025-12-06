
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.provider.findMany({
    include: {
      user: true,
    },
    orderBy: {
      businessName: 'asc',
    },
  });

  const fs = require('fs');
  const path = require('path');

  let output = '| ID | Business Name | Contact Name | Current Avatar URL |\n';
  output += '|---|---|---|---|\n';
  providers.forEach((p) => {
    output += `| ${p.id} | ${p.businessName} | ${p.user.name} | ${p.user.avatarUrl || 'N/A'} |\n`;
  });

  fs.writeFileSync(path.join(__dirname, '../../providers_list.md'), output);
  console.log('List written to providers_list.md');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
