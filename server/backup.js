const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function backup() {
  const prisma = new PrismaClient();
  const data = {};
  
  const models = [
    'User', 'Provider', 'ProviderDocument', 'Service', 'Booking', 
    'Transaction', 'Message', 'Notification', 'Review', 'Report', 
    'RefreshToken', 'Payout', 'SavedProvider', 'Appeal', 'Category', 'AuditLog'
  ];
  
  for (const model of models) {
    try {
      const modelName = model.charAt(0).toLowerCase() + model.slice(1);
      data[model] = await prisma[modelName].findMany();
      console.log(`${model}: ${data[model].length} records`);
    } catch(e) {
      console.log(`${model}: skipped (${e.message})`);
    }
  }
  
  const filename = `../db_backup_${new Date().toISOString().slice(0,10)}.json`;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`\nBackup saved to: ${filename}`);
  
  await prisma.$disconnect();
}

backup().catch(console.error);
