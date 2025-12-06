
import { PrismaClient, UserRole, ProviderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const providersData = [
  // --- PLUMBING ---
  {
    businessName: "Sameer Plumbers",
    category: "Plumbing",
    city: "Nanded",
    address: "Shivaji Nagar, Nanded - 431602",
    description: "Expert plumbing services for residential and commercial needs. Known for timely service and knowledgeable staff.",
    galleryImages: ["https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "General Plumbing Repair", price: 200, duration: 60, description: "Fixing leaks, taps, and minor pipe issues (Visiting Charge).", serviceImageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop" },
      { title: "Bathroom Fitting Installation", price: 800, duration: 120, description: "Installation of new bathroom fittings and sanitary ware.", serviceImageUrl: "https://images.unsplash.com/photo-1632759823623-144598463660?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Ambika Traders & Services",
    category: "Plumbing",
    city: "Nanded",
    address: "Canal Road, Wadi Budruk, Nanded",
    description: "Top-notch plumbing materials and services. Highly rated for quality products and work.",
    galleryImages: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Wash Basin Installation", price: 500, duration: 60, description: "Installation of wash basin and connection.", serviceImageUrl: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=600&auto=format&fit=crop" },
      { title: "Water Tank Cleaning", price: 600, duration: 90, description: "Hygienic cleaning of overhead water tanks (up to 1000L).", serviceImageUrl: "https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Sk Plumber",
    category: "Plumbing",
    city: "Nanded",
    address: "Vipul Nagar, Nanded",
    description: "Experienced plumber serving Nanded since 2001. Specializes in leakage detection.",
    galleryImages: ["https://images.unsplash.com/photo-1621905476059-5f81285a50f4?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Leakage Detection & Fix", price: 350, duration: 60, description: "Advanced leakage detection and quick repair.", serviceImageUrl: "https://images.unsplash.com/photo-1619626778403-24706e2d24fd?q=80&w=600&auto=format&fit=crop" },
      { title: "Drain Cleaning", price: 300, duration: 45, description: "Unclogging drains and pipes efficiently.", serviceImageUrl: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=600&auto=format&fit=crop" }
    ]
  },

  // --- ELECTRICAL ---
  {
    businessName: "Fr Electricals",
    category: "Electrical",
    city: "Nanded",
    address: "Near ITI Corner, Shivaji Nagar, Nanded - 431602",
    description: "Quality service and prompt appointments for all electrical needs.",
    galleryImages: ["https://images.unsplash.com/photo-1621905476059-5f81285a50f4?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Switchboard Repair", price: 150, duration: 45, description: "Repairing faulty switches and sockets.", serviceImageUrl: "https://images.unsplash.com/photo-1558402529-d2638a7023e9?q=80&w=600&auto=format&fit=crop" },
      { title: "Fan Installation", price: 200, duration: 30, description: "Ceiling and wall fan installation.", serviceImageUrl: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Tirupati Electronics",
    category: "Electrical",
    city: "Nanded",
    address: "Anand Nagar Chowk, Nanded - 431601",
    description: "Reliable electrician for household needs.",
    galleryImages: ["https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Inverter Installation", price: 500, duration: 90, description: "Setup of inverter and battery systems.", serviceImageUrl: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=600&auto=format&fit=crop" },
      { title: "House Wiring (Per Point)", price: 150, duration: 60, description: "Professional wiring per point charge.", serviceImageUrl: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Shri Electricals",
    category: "Electrical",
    city: "Nanded",
    address: "Vazirabad, Nanded",
    description: "Well-regarded electrical service provider in Nanded.",
    galleryImages: ["https://images.unsplash.com/photo-1563311277-226c66601267?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "MCB Replacement", price: 250, duration: 30, description: "Replacing faulty MCBs and fuses.", serviceImageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&auto=format&fit=crop" }
    ]
  },

  // --- BEAUTY & SALON ---
  {
    businessName: "Sybarite Salon & Academy",
    category: "Salon",
    city: "Nanded",
    address: "Rukmani Complex, VIP Road, Visava Nagar, Nanded - 431602",
    description: "Premium unisex salon with international hygiene standards and expert stylists.",
    galleryImages: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Haircut & Styling (Men)", price: 250, duration: 45, description: "Professional haircut and styling.", serviceImageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop" },
      { title: "Haircut & Styling (Women)", price: 500, duration: 60, description: "Advanced haircut and blow dry.", serviceImageUrl: "https://images.unsplash.com/photo-1522336572468-971c5438a435?q=80&w=600&auto=format&fit=crop" },
      { title: "Bridal Makeup", price: 8000, duration: 180, description: "Complete bridal makeup package.", serviceImageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Glamazone Unisex Salon",
    category: "Salon",
    city: "Nanded",
    address: "Bhagyanagar Corner, Nanded - 431601",
    description: "Specializing in hairstyles, hair removal, and facials since 2013.",
    galleryImages: ["https://images.unsplash.com/photo-1521590832169-7dad1a9b708c?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Fruit Facial", price: 800, duration: 60, description: "Natural fruit facial for glowing skin.", serviceImageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop" },
      { title: "Hair Spa", price: 900, duration: 60, description: "Deep conditioning hair treatment.", serviceImageUrl: "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Krupa Beauty Parlour",
    category: "Salon",
    city: "Nanded",
    address: "Shivaji Nagar, Nanded",
    description: "Warm and inviting atmosphere for ladies.",
    galleryImages: ["https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Eyebrow Threading", price: 50, duration: 15, description: "Precise threading.", serviceImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop" },
      { title: "Waxing (Full Arms)", price: 200, duration: 30, description: "Smooth waxing service.", serviceImageUrl: "https://images.unsplash.com/photo-1621644827828-568b24843bba?q=80&w=600&auto=format&fit=crop" }
    ]
  },

  // --- TIFFIN SERVICES ---
  {
    businessName: "Annapurna Tiffin Centre",
    category: "Tiffin",
    city: "Nanded",
    address: "Shivaji Nagar, Nanded",
    description: "Homely and hygienic tiffin service.",
    galleryImages: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Monthly Lunch (Standard)", price: 2200, duration: 30, description: "Daily veg lunch delivery for a month (6 Chapatis, Rice, Dal, Bhaji).", serviceImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Ashirwad Bhojnalay",
    category: "Tiffin",
    city: "Nanded",
    address: "Near Bus Stand, Nanded",
    description: "Affordable meals.",
    galleryImages: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Single Meal", price: 90, duration: 30, description: "One-time full meal.", serviceImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Maheshwari Mess",
    category: "Tiffin",
    city: "Nanded",
    address: "Anand Nagar, Nanded",
    description: "Pure vegetarian mess popular among students.",
    galleryImages: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Student Monthly Mess", price: 1800, duration: 30, description: "Unlimited lunch and dinner for students.", serviceImageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" }
    ]
  },

  // --- CLEANING ---
  {
    businessName: "Sidh Home Cleaning",
    category: "Cleaning",
    city: "Nanded",
    address: "Nanded City",
    description: "Professional residential housekeeping.",
    galleryImages: ["https://images.unsplash.com/photo-1581578731117-10d52143b0d8?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Full Home Deep Cleaning (2BHK)", price: 2500, duration: 240, description: "Complete deep cleaning of 2BHK flat including bathroom and kitchen.", serviceImageUrl: "https://images.unsplash.com/photo-1527515637-62da2a021300?q=80&w=600&auto=format&fit=crop" },
      { title: "Sofa Cleaning (5 Seater)", price: 600, duration: 90, description: "Shampoo cleaning and drying.", serviceImageUrl: "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Vishal Cleaning Service",
    category: "Cleaning",
    city: "Nanded",
    address: "Cidco, Nanded",
    description: "Reliable cleaning service.",
    galleryImages: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Kitchen Deep Cleaning", price: 1000, duration: 120, description: "Degreasing and cleaning of kitchen.", serviceImageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop" }
    ]
  },

  // --- GYM & FITNESS ---
  {
    businessName: "Muscle Factory Gym",
    category: "Fitness",
    city: "Nanded",
    address: "Shivaji Nagar, Nanded",
    description: "Hardcore gym for bodybuilding.",
    galleryImages: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Monthly Membership", price: 800, duration: 60, description: "General gym access.", serviceImageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Fitness Ladder",
    category: "Fitness",
    city: "Nanded",
    address: "Khadakpura, Nanded",
    description: "Premium gym with cardio section.",
    galleryImages: ["https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Quarterly Membership", price: 3000, duration: 60, description: "3 Months package with cardio.", serviceImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop" }
    ]
  },

  // --- COACHING ---
  {
    businessName: "IIB Career Institute",
    category: "Tutoring",
    city: "Nanded",
    address: "Shyam Nagar, Nanded",
    description: "Top Institute for NEET.",
    galleryImages: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "NEET Course (Yearly)", price: 85000, duration: 120, description: "Complete NEET preparation.", serviceImageUrl: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    businessName: "Unique Banking Academy",
    category: "Tutoring",
    city: "Nanded",
    address: "Vishnu Nagar, Nanded",
    description: "For Bank Exams.",
    galleryImages: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop"],
    services: [
      { title: "Banking Batch", price: 8000, duration: 90, description: "6 Months coaching for IBPS/SBI.", serviceImageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop" }
    ]
  }
];

async function main() {
  console.log('🌱 Starting seeding with REAL data...');

  // 1. Clean up existing data to remove "invalid" providers
  console.log('Cleaning up old data...');
  try {
    await prisma.review.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.provider.deleteMany({});
    // Optionally delete users with PROVIDER role to ensure clean slate
    await prisma.user.deleteMany({ where: { role: UserRole.PROVIDER } });
  } catch (error) {
    console.warn('Error during cleanup (might be empty tables):', error);
  }

  for (const pData of providersData) {
    const email = `provider.${pData.businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@example.com`;
    
    // Check if user exists (should not, after cleanup, but good practice)
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          name: pData.businessName,
          email,
          passwordHash: hashedPassword,
          role: UserRole.PROVIDER,
          phone: `91${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Dummy phone
          emailVerified: true,
          phoneVerified: true,
        }
      });
      console.log(`Created user: ${user.email}`);
    }

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        userId: user.id,
        businessName: pData.businessName,
        primaryCategory: pData.category,
        city: pData.city,
        address: pData.address,
        description: pData.description,
        status: ProviderStatus.APPROVED,
        gallery: pData.galleryImages,
        averageRating: 4 + Math.random(), // Random rating between 4 and 5
        totalRatings: Math.floor(Math.random() * 50) + 1,
        pincode: "431601",
      }
    });
    console.log(`Created provider: ${provider.businessName}`);

    // Create Services
    for (const sData of pData.services) {
      await prisma.service.create({
        data: {
          providerId: provider.id,
          title: sData.title,
          description: sData.description,
          price: sData.price,
          durationMin: sData.duration,
          imageUrl: sData.serviceImageUrl
        }
      });
      console.log(`  -> Created service: ${sData.title}`);
    }
  }

  console.log('✅ Seeding completed with REAL data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
