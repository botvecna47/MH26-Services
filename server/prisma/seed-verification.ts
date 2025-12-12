
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting verification seed...');

  const providerEmail = 'vishal@deepclean.com';
  
  // 1. Find Provider User
  const providerUser = await prisma.user.findUnique({
    where: { email: providerEmail },
    include: { provider: { include: { services: true } } }
  });

  if (!providerUser || !providerUser.provider) {
    console.error(`❌ Provider ${providerEmail} not found! Run full seed first.`);
    return;
  }
  
  // Ensure we know the password (reset it to 'password123')
  const hashedPassword = await bcrypt.hash('password123', 12);
  await prisma.user.update({
    where: { id: providerUser.id },
    data: { passwordHash: hashedPassword }
  });
  console.log(`✅ Provider password reset to 'password123'`);

  // 2. Find a Service
  const service = providerUser.provider.services[0];
  if (!service) {
    console.error('❌ Provider has no services!');
    return;
  }

  // 3. Find/Create Customer
  let customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' }
  });

  if (!customer) {
    console.log('Creating a test customer...');
    customer = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'test.customer@example.com',
        phone: '+91-9999999999',
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
        emailVerified: true,
        phoneVerified: true,
      }
    });
  }

  // 4. Create Confirmed Booking (Tomorrow 10 AM)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const booking = await prisma.booking.create({
    data: {
      userId: customer.id,
      providerId: providerUser.provider.id,
      serviceId: service.id,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      scheduledAt: tomorrow,
      totalAmount: service.price,
      platformFee: Number(service.price) * 0.1,
      providerEarnings: Number(service.price) * 0.9,
      address: '123 Test Street, Nanded',
      city: 'Nanded',
      pincode: '431601',
      requirements: 'Verification test booking',
    }
  });

  console.log('\n✅ SEEDING COMPLETE!');
  console.log('------------------------------------------------');
  console.log(`bookingId: ${booking.id}`);
  console.log(`Provider:  ${providerUser.email} / password123`);
  console.log(`Customer:  ${customer.email} / password123`);
  console.log(`Status:    ${booking.status}`);
  console.log('------------------------------------------------');
  console.log('You can now log in as the Provider to test "Mark Job Complete".');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
