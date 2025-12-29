/**
 * Seed Reports - Add sample provider reports for testing (without bookingId for now)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReports() {
  console.log('🔍 Finding providers and customers for sample reports...');
  
  // Find a customer to be the reporter
  const customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' },
  });

  if (!customer) {
    console.log('⚠️ No customer found. Creating admin as reporter fallback.');
  }

  // Find providers to report
  const providers = await prisma.provider.findMany({
    where: { status: 'APPROVED' },
    take: 2,
    include: { user: true },
  });

  if (providers.length === 0) {
    console.log('⚠️ No approved providers found. Cannot create reports.');
    return;
  }

  // Get admin if no customer
  const reporter = customer || await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  if (!reporter) {
    console.log('⚠️ No users found to create reports.');
    return;
  }

  console.log(`📋 Reporter: ${reporter.name} (${reporter.email})`);
  console.log(`📋 Found ${providers.length} providers to report`);

  const reportReasons = [
    { reason: 'Poor service quality', details: 'The service was not performed as described. Work was incomplete and provider left without finishing the job properly.' },
    { reason: 'Provider no-show', details: 'Provider confirmed the booking but did not show up at the scheduled time without any prior notice or communication.' },
    { reason: 'Unprofessional behavior', details: 'The provider was rude and unprofessional during the service. Made inappropriate comments and was disrespectful.' },
    { reason: 'Overcharging', details: 'Provider demanded extra payment of ₹500 beyond the agreed price without any prior discussion or justification.' },
  ];

  let createdCount = 0;
  
  for (const provider of providers) {
    // Create 2 reports per provider
    for (let i = 0; i < 2; i++) {
      const reportData = reportReasons[(createdCount) % reportReasons.length];

      // Check if similar report already exists
      const existing = await prisma.report.findFirst({
        where: { 
          reporterId: reporter.id,
          providerId: provider.id,
          reason: reportData.reason,
        },
      });

      if (existing) {
        console.log(`   Skipping duplicate report for ${provider.businessName}`);
        continue;
      }

      await prisma.report.create({
        data: {
          reporterId: reporter.id,
          providerId: provider.id,
          reason: reportData.reason,
          details: reportData.details,
          status: 'OPEN',
        },
      });

      createdCount++;
      console.log(`✅ Created report: "${reportData.reason}" for ${provider.businessName}`);
    }
  }

  console.log(`\n✨ Created ${createdCount} sample reports`);
  console.log(`\n📌 View them in Admin Panel → Reports tab`);
}

seedReports()
  .catch((e) => {
    console.error('❌ Seed reports failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
