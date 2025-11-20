/**
 * Fix Service IDs Script
 * Updates all services with invalid IDs (service-*-*) to proper UUIDs
 * Run: npx ts-node server/prisma/fix-service-ids.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing service IDs...');

  // Find all services with invalid IDs (starting with "service-")
  const invalidServices = await prisma.service.findMany({
    where: {
      id: {
        startsWith: 'service-',
      },
    },
  });

  console.log(`Found ${invalidServices.length} services with invalid IDs`);

  if (invalidServices.length === 0) {
    console.log('✅ No services need fixing!');
    return;
  }

  // For each invalid service, we need to:
  // 1. Create a new service with proper UUID
  // 2. Update all bookings that reference the old service ID
  // 3. Delete the old service

  for (const oldService of invalidServices) {
    console.log(`Fixing service: ${oldService.id} - ${oldService.title}`);

    // Create new service with proper UUID (Prisma will auto-generate)
    const newService = await prisma.service.create({
      data: {
        providerId: oldService.providerId,
        title: oldService.title,
        description: oldService.description,
        price: oldService.price,
        durationMin: oldService.durationMin,
        imageUrl: oldService.imageUrl,
      },
    });

    // Update all bookings that reference the old service ID
    const updatedBookings = await prisma.booking.updateMany({
      where: {
        serviceId: oldService.id,
      },
      data: {
        serviceId: newService.id,
      },
    });

    console.log(`  ✅ Created new service: ${newService.id}`);
    console.log(`  ✅ Updated ${updatedBookings.count} bookings`);

    // Delete the old service
    await prisma.service.delete({
      where: {
        id: oldService.id,
      },
    });

    console.log(`  ✅ Deleted old service: ${oldService.id}`);
  }

  console.log('🎉 All service IDs fixed!');
}

main()
  .catch((e) => {
    console.error('❌ Fix failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

