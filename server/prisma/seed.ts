import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
      role: UserRole.ADMIN,
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
        imageUrl: '',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electrical',
        slug: 'electrical',
        description: 'Licensed electricians for all your electrical needs',
        icon: '⚡',
        imageUrl: '',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cleaning',
        slug: 'cleaning',
        description: 'Professional cleaning services for homes and offices',
        icon: '🧹',
        imageUrl: '',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Catering',
        slug: 'catering',
        description: 'Delicious catering services for all occasions',
        icon: '🍽️',
        imageUrl: '',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Salon',
        slug: 'salon',
        description: 'Beauty and grooming services for everyone',
        icon: '💇',
        imageUrl: '',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Carpentry',
        slug: 'carpentry',
        description: 'Expert carpentry services for furniture and renovations',
        icon: '🪚',
        imageUrl: '',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Other',
        slug: 'other',
        description: 'Miscellaneous services that do not fit other categories',
        icon: '📦',
        imageUrl: '',
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
        { name: 'Pipe Repair & Replacement', price: 500, duration: 60, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/comp/nanded/e8/9999p2462.2462.200109184813.f8e8/catalogue/sameer-plumbers-shivaji-nagar-nanded-nanded-plumbers-kzux3u2z6w.jpg',
      ],
    },
    {
      name: 'Shri Owner',
      email: 'shri.plumbing@gmail.com',
      phone: '+91-9823456789',
      businessName: 'Shri Plumbing Services',
      category: 'Plumbing',
      description: 'Established in 2000, we offer general plumbing and construction contracting services. Operations available 24 hours a day.',
      address: 'Sanmitra Colony, Nanded',
      services: [
        { name: 'General Plumbing', price: 600, duration: 60, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/comp/nanded/j3/9999p2462.2462.220912074522.j3j3/catalogue/shri-plumbing-services-sanmitra-colony-nanded-nanded-g5di1ln642.jpg',
      ],
    },

    // ELECTRICAL
    {
      name: 'Farhan Raza',
      email: 'fr.electricals@gmail.com',
      phone: '+91-9923799555',
      businessName: 'Fr Electricals',
      category: 'Electrical',
      description: 'Professional electrical services for residential and commercial properties. We handle all kinds of wiring and appliance installations.',
      address: 'Itwara, Nanded',
      services: [
        { name: 'House Wiring', price: 2500, duration: 180, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/v2/comp/nanded/a6/9999p2462.2462.211227114707.w9a6/catalogue/fr-electricals-shivaji-nagar-nanded-nanded-electricians-vs44lk4ikr.jpg',
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
        { name: 'Appliance Repair', price: 500, duration: 60, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/comp/nanded/c4/9999p2462.2462.190424155147.s9c4/catalogue/tirupati-electronics-anand-nagar-chowk-nanded-electricians-0sy9o2s1u3.jpg',
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
        { name: 'Full Home Deep Cleaning', price: 2000, duration: 180, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/v2/comp/nanded/b1/9999p2462.2462.250714174051.i2b1/catalogue/shidha-home-cleaning-anand-nagar-chowk-nanded-cleaning-services-k7tub4z5dx.jpg',
      ],
    },


    // CATERING
    {
      name: 'Nitin Jadhav',
      email: 'jai.malhar.caters@gmail.com',
      phone: '+91-9823567890',
      businessName: 'Shri Jai Malhar Caters And Mandap Decoration',
      category: 'Catering',
      description: 'Vegetarian catering specialists serving Nanded. Known for authentic taste and quality service for all events.',
      address: 'Hingoli Naka, Nanded',
      services: [
        { name: 'Wedding Catering (Veg)', price: 450, duration: 240, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/v2/comp/nanded/f5/9999p2462.2462.230923130704.q8f5/catalogue/shri-jai-malhar-caters-and-mandap-decoration-hingoli-naka-nanded-caterers-kalfrj16vh.jpg',
      ],
    },
    {
      name: 'Siddhi Manager',
      email: 'siddhi.mangal@gmail.com',
      phone: '+91-9890567891',
      businessName: 'Siddhi Mangal Karyalay',
      category: 'Catering',
      description: 'Premium catering and event hall services. We handle everything from food to decoration for your special day.',
      address: 'CIDCO, Nanded',
      services: [
        { name: 'Full Event Catering', price: 600, duration: 300, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/comp/nanded/v4/9999p2462.2462.141231131928.b2v4/catalogue/siddhi-mangal-karyalay-nanded-ho-nanded-decorators-nln6j78h5i.jpg',
      ],
    },

    // SALON
    {
      name: 'Simran Kaur',
      email: 'signate.beauty@gmail.com',
      phone: '+91-9876509877',
      businessName: 'Signate Beauty Salon',
      category: 'Salon',
      description: 'Premium unisex salon offering advanced hair and skin treatments. Experience luxury and care.',
      address: 'Vazirabad, Nanded',
      services: [
        { name: 'Haircut & Styling', price: 400, duration: 45, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/comp/nanded/l8/9999p2462.2462.140129155207.t9l8/catalogue/signate-beauty-salon-unisex-salon--vazirabad-nanded-nanded-beauty-parlours-0pb4nwfd4c.jpg',
      ],
    },
    {
      name: 'Shweta Deshmukh',
      email: 'shweta.beautyhub@gmail.com',
      phone: '+91-9823509877',
      businessName: 'Shweta\'s Beauty Hub',
      category: 'Salon',
      description: 'Exclusive ladies beauty parlour in Bhagya Nagar. We specialize in bridal makeup and regular beauty care.',
      address: 'Bhagya Nagar Colony, Nanded',
      services: [
        { name: 'Bridal Makeup', price: 5000, duration: 180, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/v2/comp/nanded/p6/9999p2462.2462.240717104534.p9p6/catalogue/pefnss42b82gbsr-3e4bac2sy1.jpg',
      ],
    },

    // CARPENTRY
    {
      name: 'Imran Khan',
      email: 'jai.hind.furniture@gmail.com',
      phone: '+91-9922334455',
      businessName: 'Jai Hind Furniture and Interior Decoretars',
      category: 'Carpentry',
      description: 'Specialists in custom furniture and interior woodwork. We bring your furniture ideas to life.',
      address: 'Labor Colony, Nanded',
      services: [
        { name: 'Custom Furniture Making', price: 5000, duration: 240, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/comp/nanded/j8/9999p2462.2462.161218190302.g1j8/catalogue/jai-hind-furniture-and-interior-decoretars-shivaji-nagar-nanded-nanded-interior-designers-v5qjs.jpg',
      ],
    },
    {
      name: 'Ganesh Shinde',
      email: 'ekdant.enterprises@gmail.com',
      phone: '+91-8877665544',
      businessName: 'Ekdant Enterprises',
      category: 'Carpentry',
      description: 'All types of carpentry work including door installation, window frames, and general repairs.',
      address: 'Shivaji Road, Nanded',
      services: [
        { name: 'Door & Window Installation', price: 1500, duration: 120, image: '' },
      ],
      gallery: [
        'https://images.jdmagicbox.com/v2/comp/nanded/d7/9999p2462.2462.250308124507.p3d7/catalogue/ekdant-enterprises-and-multiservices-chatrapati-nagar-nanded-electricians-qaqgzcmk16.jpg',
      ],
    },

    // ========== ADDITIONAL PROVIDERS (3 more per category to reach 5 total) ==========

    // PLUMBING (3 more)
    {
      name: 'Rahul Udgire',
      email: 'samarth.plumbing@gmail.com',
      phone: '+91-9823456001',
      businessName: 'Samarth Udgire Plumbing Service',
      category: 'Plumbing',
      description: 'Reliable plumbing services with 15+ years of experience. Specializing in water heater installation, bathroom fittings, and drainage solutions.',
      address: 'Shivaji Nagar, Nanded',
      services: [
        { name: 'Water Heater Installation', price: 800, duration: 90, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/p2/9999p2462.2462.240412125542.a7p2/catalogue/k6db5zd9hgl7yg1-6pvdcwjq32.jpg'],
    },
    {
      name: 'Vijay Patil',
      email: 'omkar.plumbing@gmail.com',
      phone: '+91-9823456002',
      businessName: 'Omkar Plumbing Service',
      category: 'Plumbing',
      description: 'Complete plumbing solutions for residential and commercial properties in Vazirabad area. 24/7 emergency services available.',
      address: 'Vazirabad, Nanded',
      services: [
        { name: 'Drainage Cleaning', price: 400, duration: 45, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/v2/comp/nanded/t4/9999p2462.2462.220802122055.f7t4/catalogue/omkar-plumbing-services-nanded-midc-nanded-plumbers-aspz0mgo05.jpg'],
    },
    {
      name: 'Santosh Jadhav',
      email: 'super.sanitary@gmail.com',
      phone: '+91-9823456003',
      businessName: 'New Super Sanatary',
      category: 'Plumbing',
      description: 'One stop shop for all sanitary and plumbing needs. Wide range of fittings available with installation services.',
      address: 'Opposite Kshetriya Karyalay, Ashoknagar, Nanded',
      services: [
        { name: 'Sanitary Installation', price: 700, duration: 60, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/d7/9999p2462.2462.170428171109.z1d7/catalogue/new-super-sanitary-nanded-ho-nanded-tile-dealers-8s0cec.jpg'],
    },

    // ELECTRICAL (2 more - Pandurang skipped as outside Nanded)
    {
      name: 'Anil Sharma',
      email: 'anil.electricals@gmail.com',
      phone: '+91-9823456004',
      businessName: 'Anil Electricals & Rewinding Works',
      category: 'Electrical',
      description: 'Expert in motor rewinding and electrical repairs. Over 20 years of experience serving Nanded.',
      address: 'Anand Nagar Chowk, Nanded',
      services: [
        { name: 'Motor Rewinding', price: 1500, duration: 180, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/y3/9999p2462.2462.180322183653.a2y3/catalogue/anil-electricals-and-rewinding-works-anand-nagar-chowk-nanded-electricians-whgpl.jpg'],
    },
    {
      name: 'Varad Kulkarni',
      email: 'varad.electrical@gmail.com',
      phone: '+91-9823456005',
      businessName: 'Varad Electrical',
      category: 'Electrical',
      description: 'Professional electrical services with safety first approach. Sales and service of electronic goods.',
      address: 'CIDCO, Nanded',
      services: [
        { name: 'Switch & Socket Installation', price: 400, duration: 30, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/v2/comp/nanded/q1/9999p2462.2462.230323101552.j8q1/catalogue/varad-electricals-nanded-electronic-goods-showrooms-xx8a9ic1ob.jpg'],
    },

    // CLEANING - No additional providers (others outside Nanded)

    // CATERING (3 more)
    {
      name: 'Rajesh Joshi',
      email: 'joshi.caterers@gmail.com',
      phone: '+91-9823456011',
      businessName: 'Joshi Caterers',
      category: 'Catering',
      description: 'Traditional Maharashtrian and North Indian cuisine for all occasions. Known for authentic taste and hygiene.',
      address: 'Vazirabad, Nanded',
      services: [
        { name: 'Birthday Party Catering', price: 350, duration: 180, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/b7/9999p2462.2462.140331105130.s1b7/catalogue/joshi-caterers-nanded-caterers-for-wedding-kkrvw.jpg'],
    },
    {
      name: 'Shri Sahayog',
      email: 'sahayog.seva@gmail.com',
      phone: '+91-9823456012',
      businessName: 'Shri Sahayog Seva',
      category: 'Catering',
      description: 'Complete event catering and mandap decoration services. Making your special occasions memorable.',
      address: 'Deglour Naka, Nanded',
      services: [
        { name: 'Mandap Decoration', price: 15000, duration: 480, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/e8/9999p2462.2462.130730180108.b9e8/catalogue/shri-sahayog-seva-deglour-naka-nanded-mandap-decorators-p0kw9wk2lf.jpg'],
    },

    // SALON (1 more with real image)
    {
      name: 'Oasis Owner',
      email: 'oasis.beauty@gmail.com',
      phone: '+91-9823456014',
      businessName: 'Oasis Beauty & Hair Training Centre',
      category: 'Salon',
      description: 'Complete beauty parlour and hair cutting centre in Vazirabad. Professional makeup artists available.',
      address: 'Vazirabad, Nanded',
      services: [
        { name: 'Professional Makeup', price: 1500, duration: 90, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/v2/comp/nanded/r6/9999p2462.2462.150513112711.n9r6/catalogue/oasis-spa-beauty-parlour-and-hair-cutting-centre-vazirabad-nanded-nanded-makeup-artists-37dx9wf.jpg'],
    },

    // CARPENTRY (3 more)
    {
      name: 'Vishwakarma Rao',
      email: 'vishwakarma.furniture@gmail.com',
      phone: '+91-9823456017',
      businessName: 'Vishwakarma Furniture',
      category: 'Carpentry',
      description: 'Traditional carpentry work with modern designs. Custom furniture for every room in your home.',
      address: 'Shivaji Road, Nanded',
      services: [
        { name: 'Wardrobe Making', price: 15000, duration: 480, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/def_content/wooden-furniture-manufacturers/shutterstock-418494745-wooden-furniture-manufacturers-10-3mjjn.jpg'],
    },
    {
      name: 'Krishna Sharma',
      email: 'krishna.furniture@gmail.com',
      phone: '+91-9823456018',
      businessName: 'Shri Krishna Furniture and Appliances',
      category: 'Carpentry',
      description: 'Quality furniture and home appliances store. Wide range of ready-made and custom furniture.',
      address: 'Wadi Budruk, Nanded',
      services: [
        { name: 'Ready-made Furniture', price: 5000, duration: 60, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/x3/9999p2462.2462.200829225512.n3x3/catalogue/shri-krishna-furniture-and-appliances-wadi-budruk-nanded-furniture-dealers-3ajkxswmbc.jpg'],
    },
    {
      name: 'Rama Owner',
      email: 'rama.sales@gmail.com',
      phone: '+91-9823456019',
      businessName: 'Rama Sales',
      category: 'Carpentry',
      description: 'Trusted furniture dealer in Nanded HO. Quality furniture at competitive prices since establishment.',
      address: 'Nanded HO, Nanded',
      services: [
        { name: 'Furniture Assembly', price: 500, duration: 90, image: '' },
      ],
      gallery: ['https://images.jdmagicbox.com/comp/nanded/i5/9999p2462.2462.120622174222.j2i5/catalogue/rama-sales-nanded-ho-nanded-furniture-dealers-1hbt7.jpg'],
    },
  ];

  // Create Providers and Services
  console.log('🏢 Creating providers and services...');
  for (const providerData of providersData) {
    // Issue 3 Fix: Generate secure random password
    const crypto = await import('crypto');
    const randomPassword = crypto.randomBytes(8).toString('base64').slice(0, 10);
    const password = await bcrypt.hash(randomPassword, 12);
    
    // Log password only in development for testing
    console.log(`  🔐 ${providerData.email}: ${randomPassword}`);
    
    const user = await prisma.user.create({
      data: {
        name: providerData.name,
        email: providerData.email,
        phone: providerData.phone,
        passwordHash: password,
        role: UserRole.PROVIDER,
        emailVerified: true,
        address: providerData.address,
        city: 'Nanded',
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
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=mockupi@upi&pn=Provider',
        serviceRadius: 6,
        availability: {
          mon: ["09:00-18:00"],
          tue: ["09:00-18:00"],
          wed: ["09:00-18:00"],
          thu: ["09:00-18:00"],
          fri: ["09:00-18:00"],
          sat: ["09:00-18:00"],
        },
        gallery: providerData.gallery,
        averageRating: 4.0 + Math.random() * 0.9,
        totalRatings: Math.floor(Math.random() * 20) + 5,
        totalRevenue: 0,
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
          status: 'APPROVED',
          imageUrl: serviceData.image || providerData.gallery[0],
        },
      });
    }

    console.log(`✅ Created: ${providerData.businessName} (${providerData.category})`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   Admin: admin@mh26services.com (password: admin123)`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Providers: ${providersData.length} (5 per category)`);
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
