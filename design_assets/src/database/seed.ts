// Database seeding script for development
// This would be run with: npx prisma db seed

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create service categories
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: 'tiffin-services' },
      update: {},
      create: {
        name: 'Tiffin Services',
        slug: 'tiffin-services',
        description: 'Home-cooked meals delivered fresh to your doorstep',
        icon: '🍱',
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'electrical-services' },
      update: {},
      create: {
        name: 'Electrical Services',
        slug: 'electrical-services',
        description: 'Professional electrical repairs and installations',
        icon: '⚡',
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'plumbing-services' },
      update: {},
      create: {
        name: 'Plumbing Services',
        slug: 'plumbing-services',
        description: 'Expert plumbing solutions for your home',
        icon: '🔧',
        isActive: true,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'tourism-guide' },
      update: {},
      create: {
        name: 'Tourism Guide',
        slug: 'tourism-guide',
        description: 'Local tourism and travel guide services',
        icon: '🗺️',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Service categories created');

  // Create services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-tiffin-1' },
      update: {},
      create: {
        id: 'service-tiffin-1',
        name: 'Home Tiffin Service',
        categoryId: categories[0].id,
        description: 'Fresh, home-cooked meals delivered daily with authentic taste',
        basePrice: 150.0,
        priceType: 'FIXED',
        duration: 30,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-electrical-1' },
      update: {},
      create: {
        id: 'service-electrical-1',
        name: 'Electrical Repair',
        categoryId: categories[1].id,
        description: 'Professional electrical repair and installation services',
        basePrice: 200.0,
        priceType: 'HOURLY',
        duration: 60,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-plumbing-1' },
      update: {},
      create: {
        id: 'service-plumbing-1',
        name: 'Plumbing Repair',
        categoryId: categories[2].id,
        description: 'Quick and reliable plumbing solutions for your home',
        basePrice: 180.0,
        priceType: 'HOURLY',
        duration: 45,
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-tourism-1' },
      update: {},
      create: {
        id: 'service-tourism-1',
        name: 'Local Tourism Guide',
        categoryId: categories[3].id,
        description: 'Explore Nanded with a local guide who knows all the hidden gems',
        basePrice: 500.0,
        priceType: 'FIXED',
        duration: 240,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Services created');

  // Create admin permissions
  const permissions = await Promise.all([
    prisma.adminPermission.upsert({
      where: { name: 'user_management' },
      update: {},
      create: {
        name: 'user_management',
        description: 'Manage users, providers, and customers',
      },
    }),
    prisma.adminPermission.upsert({
      where: { name: 'service_management' },
      update: {},
      create: {
        name: 'service_management',
        description: 'Manage services and categories',
      },
    }),
    prisma.adminPermission.upsert({
      where: { name: 'booking_management' },
      update: {},
      create: {
        name: 'booking_management',
        description: 'Manage bookings and disputes',
      },
    }),
    prisma.adminPermission.upsert({
      where: { name: 'analytics_access' },
      update: {},
      create: {
        name: 'analytics_access',
        description: 'Access to analytics and reports',
      },
    }),
    prisma.adminPermission.upsert({
      where: { name: 'system_settings' },
      update: {},
      create: {
        name: 'system_settings',
        description: 'Manage system settings and configuration',
      },
    }),
  ]);

  console.log('✅ Admin permissions created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mh26services.com' },
    update: {},
    create: {
      email: 'admin@mh26services.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+91-9876543210',
      userType: 'ADMIN',
      isVerified: true,
      isActive: true,
      permissions: {
        connect: permissions.map(p => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Admin user created');

  // Create demo customer
  const demoCustomerPassword = await bcrypt.hash('demo123', 12);
  const demoCustomer = await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {},
    create: {
      email: 'customer@demo.com',
      password: demoCustomerPassword,
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-9876543211',
      userType: 'CUSTOMER',
      isVerified: true,
      isActive: true,
      loyaltyPoints: 100,
    },
  });

  // Create demo customer address
  await prisma.address.upsert({
    where: { id: 'address-customer-1' },
    update: {},
    create: {
      id: 'address-customer-1',
      userId: demoCustomer.id,
      type: 'HOME',
      street: '123 Main Street',
      area: 'Civil Lines',
      city: 'Nanded',
      state: 'Maharashtra',
      pincode: '431601',
      landmark: 'Near City Hospital',
      isDefault: true,
    },
  });

  console.log('✅ Demo customer created');

  // Create demo provider
  const demoProviderPassword = await bcrypt.hash('demo123', 12);
  const demoProvider = await prisma.user.upsert({
    where: { email: 'provider@demo.com' },
    update: {},
    create: {
      email: 'provider@demo.com',
      password: demoProviderPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '+91-9876543212',
      userType: 'PROVIDER',
      businessName: 'Kumar Tiffin Services',
      businessDescription: 'Serving authentic homemade meals since 2018',
      serviceCategories: ['Tiffin Services'],
      isVerified: true,
      isActive: true,
      isApproved: true,
      approvedAt: new Date(),
      averageRating: 4.5,
      totalReviews: 28,
      totalEarnings: 45000,
      thisMonthEarnings: 12000,
      pendingEarnings: 2500,
    },
  });

  // Create demo provider address
  await prisma.address.upsert({
    where: { id: 'address-provider-1' },
    update: {},
    create: {
      id: 'address-provider-1',
      userId: demoProvider.id,
      type: 'BUSINESS',
      street: '456 Food Street',
      area: 'Shivaji Nagar',
      city: 'Nanded',
      state: 'Maharashtra',
      pincode: '431602',
      landmark: 'Behind SBI Bank',
      isDefault: true,
    },
  });

  // Create provider availability
  const availabilityDays = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
  for (const day of availabilityDays) {
    await prisma.providerAvailability.upsert({
      where: { providerId_dayOfWeek: { providerId: demoProvider.id, dayOfWeek: day } },
      update: {},
      create: {
        providerId: demoProvider.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '20:00',
        isAvailable: true,
      },
    });
  }

  console.log('✅ Demo provider created');

  // Create system settings
  const systemSettings = [
    { key: 'platform_fee_percentage', value: '10', type: 'number', description: 'Platform fee percentage on each booking' },
    { key: 'min_booking_amount', value: '100', type: 'number', description: 'Minimum booking amount allowed' },
    { key: 'cancellation_window_hours', value: '2', type: 'number', description: 'Hours before booking when cancellation is allowed' },
    { key: 'auto_approve_providers', value: 'false', type: 'boolean', description: 'Auto approve new provider registrations' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode' },
    { key: 'support_email', value: 'support@mh26services.com', type: 'string', description: 'Support email address' },
    { key: 'support_phone', value: '+91-9876543210', type: 'string', description: 'Support phone number' },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        ...setting,
        updatedBy: adminUser.id,
      },
    });
  }

  console.log('✅ System settings created');

  // Create a sample booking
  const sampleBooking = await prisma.booking.create({
    data: {
      customerId: demoCustomer.id,
      providerId: demoProvider.id,
      serviceId: services[0].id,
      addressId: 'address-customer-1',
      status: 'COMPLETED',
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      scheduledTime: '12:00',
      requirements: 'No spicy food, vegetarian only',
      estimatedDuration: 30,
      estimatedPrice: 150.0,
      actualPrice: 150.0,
      paymentStatus: 'COMPLETED',
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
  });

  // Create a sample review
  await prisma.review.create({
    data: {
      bookingId: sampleBooking.id,
      customerId: demoCustomer.id,
      providerId: demoProvider.id,
      rating: 5,
      comment: 'Excellent food quality and timely delivery. Highly recommended!',
      isAnonymous: false,
    },
  });

  // Create a sample payment
  await prisma.payment.create({
    data: {
      bookingId: sampleBooking.id,
      customerId: demoCustomer.id,
      providerId: demoProvider.id,
      amount: 150.0,
      platformFee: 15.0,
      providerAmount: 135.0,
      paymentMethod: 'UPI',
      status: 'COMPLETED',
      transactionId: 'TXN' + Date.now(),
      processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Sample booking, review, and payment created');

  console.log('🎉 Database seeding completed successfully!');
  
  console.log('\n📝 Demo Credentials:');
  console.log('Admin: admin@mh26services.com / admin123');
  console.log('Customer: customer@demo.com / demo123');
  console.log('Provider: provider@demo.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });