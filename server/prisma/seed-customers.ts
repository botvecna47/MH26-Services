import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedCustomers() {
  console.log('🌱 Seeding 3 new customers...\n');

  const customers = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91-9988776655',
      password: 'customer123',
      address: 'Shivaji Nagar, Nanded',
      city: 'Nanded',
    },
    {
      name: 'Rahul Deshmukh',
      email: 'rahul.deshmukh@gmail.com',
      phone: '+91-9876543211',
      password: 'customer123',
      address: 'CIDCO Colony, Nanded',
      city: 'Nanded',
    },
    {
      name: 'Anjali Patil',
      email: 'anjali.patil@gmail.com',
      phone: '+91-9123456789',
      password: 'customer123',
      address: 'Vazirabad, Nanded',
      city: 'Nanded',
    },
  ];

  for (const customer of customers) {
    const passwordHash = await bcrypt.hash(customer.password, 12);
    
    try {
      const user = await prisma.user.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          passwordHash,
          role: UserRole.CUSTOMER,
          emailVerified: true,
          address: customer.address,
          city: customer.city,
        },
      });
      
      console.log(`✅ Created: ${customer.name} (${customer.email})`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️ Skipped: ${customer.email} (already exists)`);
      } else {
        throw error;
      }
    }
  }

  console.log('\n✨ Customer seeding completed!');
  console.log('\n📋 Customer Credentials:');
  console.log('   All passwords: customer123');
  console.log('   1. priya.sharma@gmail.com');
  console.log('   2. rahul.deshmukh@gmail.com');
  console.log('   3. anjali.patil@gmail.com');
}

seedCustomers()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
