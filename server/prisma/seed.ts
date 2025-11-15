/**
 * Database Seed Script
 * Creates 35 providers (5 per category), users, bookings, transactions
 * Run: npm run seed or npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

const prisma = new PrismaClient();

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Salon',
  'Tutoring',
  'Fitness',
  'Catering',
];

const PROVIDER_DATA = {
  Plumbing: [
    { name: 'Patil Plumbing Works', owner: 'Vijay Patil', phone: '+91-9876543210' },
    { name: 'Nanded Plumbing Services', owner: 'Suresh Kale', phone: '+91-9887654321' },
    { name: 'Pipe Doctor Services', owner: 'Santosh More', phone: '+91-9898765432' },
    { name: 'Rapid Plumbing Solutions', owner: 'Ganesh Bhosale', phone: '+91-9809876543' },
    { name: 'Master Plumbers Nanded', owner: 'Ramesh Pawar', phone: '+91-9810987654' },
  ],
  Electrical: [
    { name: 'Shinde Electricals', owner: 'Anil Shinde', phone: '+91-9765432108' },
    { name: 'Bright Electricals', owner: 'Prakash Gaikwad', phone: '+91-9776543210' },
    { name: 'Voltage Solutions', owner: 'Sanjay Khedkar', phone: '+91-9787654321' },
    { name: 'Current Tech Electricians', owner: 'Madhav Bhandari', phone: '+91-9798765432' },
    { name: 'Safe Wire Electricals', owner: 'Dinesh Kamble', phone: '+91-9809876540' },
  ],
  Cleaning: [
    { name: 'Clean & Shine Services', owner: 'Mangesh More', phone: '+91-9889012347' },
    { name: 'Sparkle Cleaning', owner: 'Rekha Bhosale', phone: '+91-9890123458' },
    { name: 'Deep Clean Experts', owner: 'Vishal Pawar', phone: '+91-9801234569' },
    { name: 'Green Cleaning Solutions', owner: 'Sunita Kamble', phone: '+91-9812345680' },
    { name: 'Swift Clean Services', owner: 'Amit Gaikwad', phone: '+91-9823456781' },
  ],
  Salon: [
    { name: 'Lakme Beauty Salon', owner: 'Pooja Sharma', phone: '+91-9834567891' },
    { name: 'Men\'s Grooming Studio', owner: 'Akash Patil', phone: '+91-9845678903' },
    { name: 'Beauty Bliss Salon', owner: 'Neha Deshmukh', phone: '+91-9856789014' },
    { name: 'Quick Cuts Unisex', owner: 'Sachin Kale', phone: '+91-9867890125' },
    { name: 'Elite Hair & Beauty', owner: 'Kavita Jadhav', phone: '+91-9878901236' },
  ],
  Tutoring: [
    { name: 'Nanded Tutoring Center', owner: 'Rajesh Deshmukh', phone: '+91-9901234567' },
    { name: 'Smart Learning Academy', owner: 'Priya Kulkarni', phone: '+91-9912345678' },
    { name: 'Expert Tutors Nanded', owner: 'Amit Jadhav', phone: '+91-9923456789' },
    { name: 'Study Hub Nanded', owner: 'Sneha Patil', phone: '+91-9934567890' },
    { name: 'Knowledge Point', owner: 'Vikram More', phone: '+91-9945678901' },
  ],
  Fitness: [
    { name: 'Gold\'s Gym Nanded', owner: 'Rahul Chavan', phone: '+91-9889012346' },
    { name: 'Power Fitness Studio', owner: 'Sneha Patil', phone: '+91-9890123457' },
    { name: 'Iron Gym Nanded', owner: 'Vikram Salunkhe', phone: '+91-9801234568' },
    { name: 'Yoga & Wellness Center', owner: 'Anjali Bhosale', phone: '+91-9812345679' },
    { name: 'CrossFit Nanded', owner: 'Abhijeet Jadhav', phone: '+91-9823456780' },
  ],
  Catering: [
    { name: 'Shri Sai Tiffin Service', owner: 'Sunita Patil', phone: '+91-9823456789' },
    { name: 'Maa Ki Rasoi Tiffin', owner: 'Rajesh Sharma', phone: '+91-9834567890' },
    { name: 'Ghar Jaisa Khana', owner: 'Anita Deshmukh', phone: '+91-9845678901' },
    { name: 'Student Special Tiffin', owner: 'Prakash Jadhav', phone: '+91-9856789012' },
    { name: 'Premium Tiffin Express', owner: 'Meera Kulkarni', phone: '+91-9867890123' },
  ],
};

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mh26services.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@mh26services.com',
      phone: '+91-9000000000',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      phoneVerified: true,
    },
  });
  console.log('✅ Created admin user');

  // Create 5 customer users
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const password = await hashPassword('customer123');
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `+91-987654321${i}`,
        passwordHash: password,
        role: 'CUSTOMER',
        emailVerified: true,
        phoneVerified: true,
      },
    });
    customers.push(customer);
  }
  console.log('✅ Created 5 customer users');

  // Create providers (5 per category = 35 total)
  const providers = [];
  let providerIndex = 0;

  for (const category of CATEGORIES) {
    const categoryProviders = PROVIDER_DATA[category as keyof typeof PROVIDER_DATA];
    
    for (const providerData of categoryProviders) {
      providerIndex++;
      const password = await hashPassword('provider123');
      
      // Create user for provider
      const user = await prisma.user.upsert({
        where: { email: `provider${providerIndex}@example.com` },
        update: {},
        create: {
          name: providerData.owner,
          email: `provider${providerIndex}@example.com`,
          phone: providerData.phone,
          passwordHash: password,
          role: 'PROVIDER',
          emailVerified: true,
          phoneVerified: true,
          avatarUrl: `https://maps.googleapis.com/maps/api/streetview?size=200x200&location=Nanded,Maharashtra&key=placeholder`,
        },
      });

      // Create provider
      const provider = await prisma.provider.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          businessName: providerData.name,
          description: `Professional ${category.toLowerCase()} services in Nanded. Serving the community with quality and reliability.`,
          primaryCategory: category,
          address: `${Math.floor(Math.random() * 100)} Main Street, Nanded`,
          city: 'Nanded',
          state: 'Maharashtra',
          pincode: '431601',
          lat: 19.15 + (Math.random() * 0.05),
          lng: 77.31 + (Math.random() * 0.05),
          averageRating: 4.0 + (Math.random() * 1.0),
          totalRatings: Math.floor(Math.random() * 100) + 10,
          status: 'APPROVED',
          phoneVisible: true,
        },
      });

      // Create at least 1 service
      await prisma.service.upsert({
        where: { id: `service-${provider.id}` },
        update: {},
        create: {
          id: `service-${provider.id}`,
          providerId: provider.id,
          title: `${category} Service`,
          description: `Professional ${category.toLowerCase()} service`,
          price: 500 + Math.floor(Math.random() * 2000),
          durationMin: 60 + Math.floor(Math.random() * 120),
        },
      });

      // Create 1 document
      await prisma.providerDocument.create({
        data: {
          providerId: provider.id,
          type: 'aadhar',
          url: `https://s3.amazonaws.com/mh26-services-uploads/documents/${provider.id}/aadhar.pdf`,
          filename: 'aadhar.pdf',
        },
      });

      providers.push(provider);
    }
  }
  console.log('✅ Created 35 providers (5 per category)');

  // Create 20 bookings
  const bookings = [];
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const service = await prisma.service.findFirst({
      where: { providerId: provider.id },
    });

    if (!service) continue;

    const totalAmount = Number(service.price);
    const platformFee = totalAmount * 0.1; // 10%
    const providerEarnings = totalAmount - platformFee;

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + Math.floor(Math.random() * 30));

    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;

    const booking = await prisma.booking.create({
      data: {
        userId: customer.id,
        providerId: provider.id,
        serviceId: service.id,
        scheduledAt,
        status,
        totalAmount,
        platformFee,
        providerEarnings,
        address: `${Math.floor(Math.random() * 100)} Customer Address, Nanded`,
      },
    });

    bookings.push(booking);
  }
  console.log('✅ Created 20 bookings');

  // Create 20 transactions
  for (const booking of bookings.slice(0, 20)) {
    await prisma.transaction.create({
      data: {
        userId: booking.userId,
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'INR',
        gateway: 'razorpay',
        gatewayOrderId: `order_${booking.id}`,
        gatewayPaymentId: `pay_${booking.id}`,
        status: booking.status === 'COMPLETED' ? 'SUCCESS' : 'PENDING',
      },
    });
  }
  console.log('✅ Created 20 transactions');

  // Create service categories
  for (const category of CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.toLowerCase() },
      update: {},
      create: {
        name: category,
        slug: category.toLowerCase(),
        description: `${category} services`,
        icon: '🔧',
        isActive: true,
      },
    });
  }
  console.log('✅ Created service categories');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

