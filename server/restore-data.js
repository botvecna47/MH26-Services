const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('📦 Loading backup data...');
    const backupPath = path.join(__dirname, 'prisma', 'demo_data.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    console.log(`✅ Found ${backupData.users?.length || 0} users`);
    console.log(`✅ Found ${backupData.providers?.length || 0} providers`);
    console.log(`✅ Found ${backupData.categories?.length || 0} categories`);
    console.log(`✅ Found ${backupData.services?.length || 0} services`);

    // Restore Users
    if (backupData.users) {
      console.log('\n👥 Restoring users...');
      for (const user of backupData.users) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            passwordHash: user.passwordHash,
            role: user.role,
            emailVerified: user.emailVerified,
            avatarUrl: user.avatarUrl,
            walletBalance: user.walletBalance || 0,
            totalSpending: user.totalSpending || 0,
            isBanned: user.isBanned || false,
            banReason: user.banReason,
            bannedAt: user.bannedAt ? new Date(user.bannedAt) : null,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
        });
      }
      console.log(`✅ Restored ${backupData.users.length} users`);
    }

    // Restore Categories
    if (backupData.categories) {
      console.log('\n📂 Restoring categories...');
      for (const category of backupData.categories) {
        await prisma.category.create({
          data: {
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            imageUrl: category.imageUrl,
            isActive: category.isActive,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt),
          },
        });
      }
      console.log(`✅ Restored ${backupData.categories.length} categories`);
    }

    // Restore Providers
    if (backupData.providers) {
      console.log('\n🏢 Restoring providers...');
      for (const provider of backupData.providers) {
        await prisma.provider.create({
          data: {
            id: provider.id,
            userId: provider.userId,
            businessName: provider.businessName,
            description: provider.description,
            primaryCategory: provider.primaryCategory,
            secondaryCategory: provider.secondaryCategory,
            address: provider.address,
            city: provider.city,
            state: provider.state,
            pincode: provider.pincode,
            lat: provider.lat,
            lng: provider.lng,
            averageRating: provider.averageRating,
            totalRatings: provider.totalRatings,
            status: provider.status,
            phoneVisible: provider.phoneVisible,
            qrCodeUrl: provider.qrCodeUrl,
            gallery: provider.gallery,
            createdAt: new Date(provider.createdAt),
            updatedAt: new Date(provider.updatedAt),
          },
        });
      }
      console.log(`✅ Restored ${backupData.providers.length} providers`);
    }

    // Restore Services
    if (backupData.services) {
      console.log('\n🛠️  Restoring services...');
      for (const service of backupData.services) {
        await prisma.service.create({
          data: {
            id: service.id,
            providerId: service.providerId,
            name: service.name,
            description: service.description,
            category: service.category,
            basePrice: service.basePrice,
            priceUnit: service.priceUnit,
            estimatedDuration: service.estimatedDuration,
            isActive: service.isActive,
            createdAt: new Date(service.createdAt),
            updatedAt: new Date(service.updatedAt),
          },
        });
      }
      console.log(`✅ Restored ${backupData.services.length} services`);
    }

    // Restore Bookings (if any)
    if (backupData.bookings && backupData.bookings.length > 0) {
      console.log('\n📅 Restoring bookings...');
      for (const booking of backupData.bookings) {
        await prisma.booking.create({
          data: {
            id: booking.id,
            userId: booking.userId,
            providerId: booking.providerId,
            serviceId: booking.serviceId,
            status: booking.status,
            scheduledDate: new Date(booking.scheduledDate),
            timeSlot: booking.timeSlot,
            address: booking.address,
            city: booking.city,
            pincode: booking.pincode,
            totalAmount: booking.totalAmount,
            platformFee: booking.platformFee,
            providerEarnings: booking.providerEarnings,
            completionOTP: booking.completionOTP,
            completedAt: booking.completedAt ? new Date(booking.completedAt) : null,
            createdAt: new Date(booking.createdAt),
            updatedAt: new Date(booking.updatedAt),
          },
        });
      }
      console.log(`✅ Restored ${backupData.bookings.length} bookings`);
    }

    // Restore Reviews (if any)
    if (backupData.reviews && backupData.reviews.length > 0) {
      console.log('\n⭐ Restoring reviews...');
      for (const review of backupData.reviews) {
        await prisma.review.create({
          data: {
            id: review.id,
            bookingId: review.bookingId,
            userId: review.userId,
            providerId: review.providerId,
            rating: review.rating,
            comment: review.comment,
            createdAt: new Date(review.createdAt),
            updatedAt: new Date(review.updatedAt),
          },
        });
      }
      console.log(`✅ Restored ${backupData.reviews.length} reviews`);
    }

    console.log('\n🎉 Data restoration complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${backupData.users?.length || 0}`);
    console.log(`   Providers: ${backupData.providers?.length || 0}`);
    console.log(`   Categories: ${backupData.categories?.length || 0}`);
    console.log(`   Services: ${backupData.services?.length || 0}`);
    console.log(`   Bookings: ${backupData.bookings?.length || 0}`);
    console.log(`   Reviews: ${backupData.reviews?.length || 0}`);
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
