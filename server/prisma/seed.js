const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting fresh seed with Real Nanded Providers...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleared\n');

  // Create Admin
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@mh26services.com',
      phone: '+91-9000000000',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}\n`);

  // Create Categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Plumbing',
        slug: 'plumbing',
        description: 'Professional plumbing services for homes and businesses',
        icon: '🔧',
        imageUrl: 'https://via.placeholder.com/800x600',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electrical',
        slug: 'electrical',
        description: 'Licensed electricians for all your electrical needs',
        icon: '⚡',
        imageUrl: 'https://via.placeholder.com/800x600',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cleaning',
        slug: 'cleaning',
        description: 'Professional cleaning services for homes and offices',
        icon: '🧹',
        imageUrl: 'https://via.placeholder.com/800x600',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Catering',
        slug: 'catering',
        description: 'Delicious catering services for all occasions',
        icon: '🍽️',
        imageUrl: 'https://via.placeholder.com/800x600',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Salon',
        slug: 'salon',
        description: 'Beauty and grooming services for everyone',
        icon: '💇',
        imageUrl: 'https://via.placeholder.com/800x600',
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // Real Nanded Providers Data
  const providersData = [
    // PLUMBING
    {
      name: 'Sameer Khan',
      email: 'sameer.plumbers@gmail.com',
      phone: '+91-9876543210',
      businessName: 'Sameer Plumbers',
      category: 'Plumbing',
      description: 'Expert plumbing services in Nanded since 2010. Specializing in residential and commercial plumbing, pipe repairs, leak detection, and 24/7 emergency services.',
      address: 'Shop No. 5, Sarafa Line, Nanded',
      services: [
        { name: 'Pipe Repair & Replacement', price: 500, duration: 60 },
        { name: 'Leak Detection & Fixing', price: 400, duration: 45 },
        { name: 'Bathroom Fitting Installation', price: 1500, duration: 120 },
        { name: 'Water Tank Cleaning', price: 800, duration: 90 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },
    {
      name: 'Santosh Kumar',
      email: 'sk.plumber.nanded@gmail.com',
      phone: '+91-9823456789',
      businessName: 'SK Plumber Nanded',
      category: 'Plumbing',
      description: 'Licensed plumber with 15+ years experience. All types of plumbing work including drainage, sanitary fittings, and water supply systems.',
      address: 'Near Bus Stand, Shivaji Nagar, Nanded',
      services: [
        { name: 'Drain Cleaning & Unclogging', price: 600, duration: 60 },
        { name: 'Tap & Faucet Repair', price: 300, duration: 30 },
        { name: 'Water Heater Installation', price: 1200, duration: 90 },
        { name: 'Sanitary Fitting Replacement', price: 800, duration: 75 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },

    // ELECTRICAL
    {
      name: 'Shravan Patil',
      email: 'shravan.electrical2010@gmail.com',
      phone: '+91-9923799555',
      businessName: 'Shravan Electrical Contractor',
      category: 'Electrical',
      description: 'Established in 2009, offering comprehensive electrical services including H.T. and L.T. works, solar installations, and 24/7 emergency services.',
      address: 'Janki Nagar, Hanuman Gadh, Nanded',
      services: [
        { name: 'House Wiring & Rewiring', price: 2500, duration: 180 },
        { name: 'Switch & Socket Installation', price: 400, duration: 45 },
        { name: 'Fan & Light Installation', price: 350, duration: 40 },
        { name: 'Circuit Breaker Repair', price: 600, duration: 60 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },
    {
      name: 'Rajesh Sharma',
      email: 'tirupati.electronics@gmail.com',
      phone: '+91-9890123456',
      businessName: 'Tirupati Electronics',
      category: 'Electrical',
      description: 'Trusted electrical services provider in Nanded. Specializing in residential electrical work, appliance repair, and electrical safety inspections.',
      address: 'Main Road, Vazirabad, Nanded',
      services: [
        { name: 'Electrical Appliance Repair', price: 500, duration: 60 },
        { name: 'Inverter Installation', price: 1500, duration: 120 },
        { name: 'Electrical Safety Inspection', price: 800, duration: 90 },
        { name: 'Emergency Electrical Repair', price: 1000, duration: 60 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },

    // CLEANING
    {
      name: 'Siddharth Patil',
      email: 'sidh.homecleaning@gmail.com',
      phone: '+91-9876501234',
      businessName: 'Sidh Home Cleaning',
      category: 'Cleaning',
      description: 'Professional home and office cleaning services in Nanded. Deep cleaning, regular maintenance, and specialized cleaning solutions.',
      address: 'Shivaji Nagar, Nanded',
      services: [
        { name: 'Full Home Deep Cleaning', price: 2000, duration: 180 },
        { name: 'Kitchen Deep Cleaning', price: 800, duration: 90 },
        { name: 'Bathroom Cleaning', price: 500, duration: 60 },
        { name: 'Sofa & Carpet Cleaning', price: 1200, duration: 120 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },
    {
      name: 'Amit Deshmukh',
      email: 'shine.cleaning.nanded@gmail.com',
      phone: '+91-9823401234',
      businessName: 'Shine Cleaning Service',
      category: 'Cleaning',
      description: 'Eco-friendly cleaning services for homes and commercial spaces. Using safe, non-toxic cleaning products.',
      address: 'Near Railway Station, Nanded',
      services: [
        { name: 'Office Cleaning', price: 1500, duration: 120 },
        { name: 'Window & Glass Cleaning', price: 600, duration: 60 },
        { name: 'Floor Polishing', price: 1000, duration: 90 },
        { name: 'Post-Construction Cleaning', price: 3000, duration: 240 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },

    // CATERING
    {
      name: 'Tulsi Bhavani',
      email: 'tulljabhavani.caterers@gmail.com',
      phone: '+91-9890567890',
      businessName: 'Tulljabhavani Caterers',
      category: 'Catering',
      description: 'Premium catering services in Nanded offering North Indian, South Indian, Maharashtrian, and multi-cuisine options for weddings and events.',
      address: 'Sarafa, Nanded',
      services: [
        { name: 'Wedding Catering (per plate)', price: 500, duration: 240 },
        { name: 'Corporate Event Catering', price: 350, duration: 180 },
        { name: 'Birthday Party Catering', price: 300, duration: 120 },
        { name: 'Traditional Maharashtrian Thali', price: 400, duration: 120 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },
    {
      name: 'Nitin Jadhav',
      email: 'nj.caterers.nanded@gmail.com',
      phone: '+91-9823567890',
      businessName: 'NJ Caterers',
      category: 'Catering',
      description: 'Vegetarian catering specialists serving Nanded for over 10 years. Known for authentic taste and quality service.',
      address: 'Vazirabad, Nanded',
      services: [
        { name: 'Pure Veg Wedding Catering', price: 450, duration: 240 },
        { name: 'Jain Food Catering', price: 500, duration: 180 },
        { name: 'House Warming Catering', price: 350, duration: 120 },
        { name: 'Festival Special Menu', price: 400, duration: 150 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },

    // SALON
    {
      name: 'Priya Kulkarni',
      email: 'sybarite.salon@gmail.com',
      phone: '+91-9876509876',
      businessName: 'Sybarite Salon & Academy',
      category: 'Salon',
      description: 'Top-rated unisex salon in Nanded offering hair styling, makeup, spa services, and beauty treatments with experienced professionals.',
      address: 'Main Road, Shivaji Nagar, Nanded',
      services: [
        { name: 'Haircut & Styling', price: 300, duration: 45 },
        { name: 'Bridal Makeup Package', price: 5000, duration: 180 },
        { name: 'Hair Spa Treatment', price: 1200, duration: 90 },
        { name: 'Facial & Cleanup', price: 800, duration: 60 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },
    {
      name: 'Glamour Team',
      email: 'glamazone.unisex@gmail.com',
      phone: '+91-9823509876',
      businessName: 'Glamazone Unisex Salon',
      category: 'Salon',
      description: 'Modern unisex salon providing professional hair care, beauty services, nail art, and spa treatments in a hygienic environment.',
      address: 'Near Bus Stand, Nanded',
      services: [
        { name: 'Hair Coloring & Highlights', price: 2000, duration: 120 },
        { name: 'Manicure & Pedicure', price: 600, duration: 60 },
        { name: 'Hair Straightening/Smoothening', price: 3500, duration: 180 },
        { name: 'Waxing (Full Body)', price: 1500, duration: 90 },
      ],
      gallery: [
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
        'https://via.placeholder.com/800x600',
      ],
    },
  ];

  // Create Providers and Services
  console.log('🏢 Creating providers and services...');
  for (const providerData of providersData) {
    // Create user
    const password = await bcrypt.hash(`${providerData.category}@123`, 12);
    const user = await prisma.user.create({
      data: {
        name: providerData.name,
        email: providerData.email,
        phone: providerData.phone,
        passwordHash: password,
        role: 'PROVIDER',
        emailVerified: true,
      },
    });

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        userId: user.id,
        businessName: providerData.businessName,
        description: providerData.description,
        primaryCategory: providerData.category,
        address: providerData.address,
        city: 'Nanded',
        state: 'Maharashtra',
        pincode: '431601',
        lat: 19.1383 + (Math.random() - 0.5) * 0.1,
        lng: 77.3210 + (Math.random() - 0.5) * 0.1,
        status: 'APPROVED',
        gallery: providerData.gallery,
        averageRating: 4.0 + Math.random() * 0.9,
        totalRatings: Math.floor(Math.random() * 20) + 5,
      },
    });

    // Create services
    for (const serviceData of providerData.services) {
      await prisma.service.create({
        data: {
          providerId: provider.id,
          name: serviceData.name,
          description: `Professional ${serviceData.name.toLowerCase()} service`,
          category: providerData.category,
          basePrice: serviceData.price,
          priceUnit: 'per service',
          estimatedDuration: serviceData.duration,
          isActive: true,
        },
      });
    }

    console.log(`✅ Created: ${providerData.businessName} (${providerData.category})`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   Admin: admin@mh26services.com (password: admin123)`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Providers: ${providersData.length} (2 per category)`);
  console.log(`   Services: ${providersData.reduce((sum, p) => sum + p.services.length, 0)}`);
  console.log(`\n🔐 Provider Passwords: {CategoryName}@123`);
  console.log(`   Example: Plumbing@123, Electrical@123, etc.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
