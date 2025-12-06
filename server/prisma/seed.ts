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

// Service definitions with proper images for Nanded
const SERVICE_DATA = {
  Plumbing: [
    { 
      title: 'Pipe Repair & Installation', 
      description: 'Expert pipe repair, replacement, and installation services. Fix leaks, blockages, and broken pipes with professional tools and techniques.',
      price: 800,
      durationMin: 120,
      imageUrl: 'https://loremflickr.com/800/600/plumber,pipe?lock=1'
    },
    { 
      title: 'Water Tank Cleaning', 
      description: 'Professional water tank cleaning and sanitization. Remove algae, sediment, and bacteria for clean, safe drinking water.',
      price: 1500,
      durationMin: 180,
      imageUrl: 'https://loremflickr.com/800/600/watertank,cleaning?lock=2'
    },
    { 
      title: 'Bathroom Fitting & Installation', 
      description: 'Complete bathroom fitting services including taps, showers, toilets, and fixtures. Professional installation with warranty.',
      price: 2500,
      durationMin: 240,
      imageUrl: 'https://loremflickr.com/800/600/bathroom,plumbing?lock=3'
    },
    { 
      title: 'Emergency Plumbing Service', 
      description: '24/7 emergency plumbing services. Quick response for burst pipes, severe leaks, and urgent repairs in Nanded.',
      price: 1200,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/plumber,emergency?lock=4'
    },
    { 
      title: 'Drain Cleaning & Unclogging', 
      description: 'Professional drain cleaning services using advanced equipment. Clear blocked drains, sinks, and sewer lines effectively.',
      price: 1000,
      durationMin: 90,
      imageUrl: 'https://loremflickr.com/800/600/drain,cleaning?lock=5'
    },
  ],
  Electrical: [
    { 
      title: 'Electrical Wiring & Installation', 
      description: 'Complete electrical wiring for homes and offices. Safe, code-compliant installations with quality materials.',
      price: 2000,
      durationMin: 300,
      imageUrl: 'https://loremflickr.com/800/600/electrician,wiring?lock=6'
    },
    { 
      title: 'Electrical Repairs', 
      description: 'Expert electrical repair services. Fix faulty switches, sockets, circuit breakers, and electrical appliances.',
      price: 600,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/electrician,repair?lock=7'
    },
    { 
      title: 'Fan & Light Installation', 
      description: 'Professional installation of ceiling fans, lights, chandeliers, and electrical fixtures. Safe and reliable service.',
      price: 500,
      durationMin: 90,
      imageUrl: 'https://loremflickr.com/800/600/ceilingfan,install?lock=8'
    },
    { 
      title: 'MCB & Fuse Box Repair', 
      description: 'MCB panel installation, repair, and maintenance. Fix tripping issues and upgrade electrical panels safely.',
      price: 1500,
      durationMin: 120,
      imageUrl: 'https://loremflickr.com/800/600/fusebox,electrician?lock=9'
    },
    { 
      title: 'Home Electrical Safety Check', 
      description: 'Comprehensive electrical safety inspection. Identify hazards, check wiring, and ensure electrical safety compliance.',
      price: 800,
      durationMin: 120,
      imageUrl: 'https://loremflickr.com/800/600/electrician,inspection?lock=10'
    },
  ],
  Cleaning: [
    { 
      title: 'Home Deep Cleaning', 
      description: 'Complete deep cleaning service for homes. Kitchen, bathroom, bedroom cleaning with eco-friendly products.',
      price: 2000,
      durationMin: 240,
      imageUrl: 'https://loremflickr.com/800/600/cleaning,home?lock=11'
    },
    { 
      title: 'Office Cleaning Service', 
      description: 'Professional office cleaning including desks, floors, windows, and restrooms. Regular or one-time service available.',
      price: 2500,
      durationMin: 300,
      imageUrl: 'https://loremflickr.com/800/600/cleaning,office?lock=12'
    },
    { 
      title: 'Carpet & Sofa Cleaning', 
      description: 'Deep cleaning for carpets, rugs, and sofas. Remove stains, odors, and allergens with professional equipment.',
      price: 1500,
      durationMin: 180,
      imageUrl: 'https://loremflickr.com/800/600/carpet,cleaning?lock=13'
    },
    { 
      title: 'Kitchen Deep Cleaning', 
      description: 'Thorough kitchen cleaning including appliances, cabinets, countertops, and exhaust. Sanitized and spotless.',
      price: 1200,
      durationMin: 150,
      imageUrl: 'https://loremflickr.com/800/600/kitchen,cleaning?lock=14'
    },
    { 
      title: 'Bathroom Sanitization', 
      description: 'Complete bathroom cleaning and sanitization. Remove mold, stains, and ensure hygiene with professional products.',
      price: 800,
      durationMin: 90,
      imageUrl: 'https://loremflickr.com/800/600/bathroom,cleaning?lock=15'
    },
  ],
  Salon: [
    { 
      title: 'Haircut & Styling', 
      description: 'Professional haircut and styling services for men and women. Latest trends and techniques by experienced stylists.',
      price: 300,
      durationMin: 45,
      imageUrl: 'https://loremflickr.com/800/600/haircut,salon?lock=16'
    },
    { 
      title: 'Hair Color & Highlights', 
      description: 'Expert hair coloring and highlighting services. Use premium products for vibrant, long-lasting color.',
      price: 1500,
      durationMin: 180,
      imageUrl: 'https://loremflickr.com/800/600/haircolor,salon?lock=17'
    },
    { 
      title: 'Facial & Skin Care', 
      description: 'Rejuvenating facial treatments for glowing skin. Deep cleansing, exfoliation, and moisturizing therapy.',
      price: 800,
      durationMin: 90,
      imageUrl: 'https://loremflickr.com/800/600/facial,spa?lock=18'
    },
    { 
      title: 'Bridal Makeup & Hair', 
      description: 'Complete bridal makeup and hairstyling packages. Traditional and modern looks for your special day.',
      price: 5000,
      durationMin: 300,
      imageUrl: 'https://loremflickr.com/800/600/bridal,makeup?lock=19'
    },
    { 
      title: 'Hair Spa & Treatment', 
      description: 'Relaxing hair spa and treatment services. Repair damaged hair, reduce frizz, and add shine.',
      price: 1000,
      durationMin: 120,
      imageUrl: 'https://loremflickr.com/800/600/hairspa,salon?lock=20'
    },
  ],
  Tutoring: [
    { 
      title: 'Mathematics Tutoring', 
      description: 'Expert math tutoring for all classes. Clear concepts, solve problems, and improve grades with personalized attention.',
      price: 500,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/math,teacher?lock=21'
    },
    { 
      title: 'Science Classes', 
      description: 'Physics, Chemistry, and Biology tutoring. Concept clarity, practical knowledge, and exam preparation.',
      price: 600,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/science,chemistry?lock=22'
    },
    { 
      title: 'English Language Classes', 
      description: 'English speaking, writing, and grammar classes. Improve communication skills and language proficiency.',
      price: 400,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/english,teacher?lock=23'
    },
    { 
      title: 'Computer & Programming', 
      description: 'Computer basics, programming languages, and software training. Learn coding, web development, and IT skills.',
      price: 800,
      durationMin: 90,
      imageUrl: 'https://loremflickr.com/800/600/coding,computer?lock=24'
    },
    { 
      title: 'Exam Preparation Classes', 
      description: 'Competitive exam preparation including JEE, NEET, and board exams. Expert guidance and practice tests.',
      price: 1000,
      durationMin: 120,
      imageUrl: 'https://loremflickr.com/800/600/exam,student?lock=25'
    },
  ],
  Fitness: [
    { 
      title: 'Personal Training', 
      description: 'One-on-one personal training sessions. Customized workout plans, nutrition guidance, and fitness goals.',
      price: 800,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/fitness,trainer?lock=26'
    },
    { 
      title: 'Yoga Classes', 
      description: 'Traditional yoga classes for flexibility, strength, and mental wellness. Beginner to advanced levels available.',
      price: 500,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/yoga,pose?lock=27'
    },
    { 
      title: 'Gym Membership', 
      description: 'Full gym access with modern equipment. Cardio, strength training, and group fitness classes included.',
      price: 2000,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/gym,weights?lock=28'
    },
    { 
      title: 'Weight Loss Program', 
      description: 'Structured weight loss program with diet plans and exercise routines. Achieve your fitness goals effectively.',
      price: 3000,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/diet,food?lock=29'
    },
    { 
      title: 'Zumba & Dance Fitness', 
      description: 'Fun and energetic Zumba and dance fitness classes. Burn calories while enjoying music and movement.',
      price: 400,
      durationMin: 60,
      imageUrl: 'https://loremflickr.com/800/600/zumba,dance?lock=30'
    },
  ],
  Catering: [
    { 
      title: 'Daily Tiffin Service', 
      description: 'Fresh, home-cooked daily tiffin service. Nutritious meals delivered to your doorstep in Nanded.',
      price: 2000,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/tiffinservice,food?lock=31'
    },
    { 
      title: 'Party Catering Service', 
      description: 'Complete party catering for weddings, birthdays, and events. Delicious food, professional service.',
      price: 15000,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/catering,buffet?lock=32'
    },
    { 
      title: 'Student Tiffin Service', 
      description: 'Affordable tiffin service for students. Healthy, balanced meals perfect for college and hostel students.',
      price: 1500,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/lunchbox,food?lock=33'
    },
    { 
      title: 'Office Lunch Service', 
      description: 'Corporate lunch catering for offices. Bulk orders with variety, delivered fresh to your workplace.',
      price: 3000,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/officelunch,food?lock=34'
    },
    { 
      title: 'Traditional Maharashtrian Thali', 
      description: 'Authentic Maharashtrian thali service. Traditional recipes with dal, rice, vegetables, and roti.',
      price: 2500,
      durationMin: 0,
      imageUrl: 'https://loremflickr.com/800/600/indianthali,food?lock=35'
    },
  ],
};

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

const REVIEW_DATA = {
  Plumbing: [
    "Fixed the leak quickly. Very professional.",
    "Arrived on time and did a clean job.",
    "Price was a bit high but work was quality.",
    "Very knowledgeable plumber. Solved our drainage issue.",
    "Emergency service was a lifesaver! Thanks.",
    "Changed the taps efficiently. Good behavior.",
  ],
  Electrical: [
    "Solved the short circuit issue immediately.",
    "Installed fans perfectly. Precise work.",
    "Very safe and professional electrician.",
    "Checked all wiring thoroughly. Recommended.",
    "Good service for the price.",
    "Fixed the tripping MCB. Very skilled.",
  ],
  Cleaning: [
    "House looks brand new! Amazing deep cleaning.",
    "Very thorough and polite staff.",
    "Removed all stains from the sofa. Great job.",
    "Kitchen cleaning was spotless.",
    "Punctual and efficient team.",
    "Best cleaning service in Nanded.",
  ],
  Salon: [
    "Great haircut! Exactly what I wanted.",
    "Very relaxing facial. Good ambiance.",
    "Professional stylists and clean equipment.",
    "Loved the hair color. Highly recommended.",
    "Hygienic and safe salon services.",
    "Good value for money.",
  ],
  Tutoring: [
    "My son's math grades improved significantly.",
    "Excellent teaching method. Very patient.",
    "Helped me prepare for JEE. Great guidance.",
    "Clear concepts and regular tests.",
    "Very supportive teacher.",
    "Best English classes in town.",
  ],
  Fitness: [
    "Lost 5kg in 2 months! Great trainer.",
    "Gym equipment is top notch.",
    "Yoga classes are very relaxing.",
    "Personal attention helped me reach my goals.",
    "Good environment for workout.",
    "Trainer is very motivating.",
  ],
  Catering: [
    "Food was delicious! Guests loved it.",
    "On time delivery and hot food.",
    "Tiffin service is like home cooked food.",
    "Great variety in the menu.",
    "Hygienic and tasty catering.",
    "Best puran poli in Nanded!",
  ],
};

const GENERIC_REVIEWS = [
  "Great experience, would hire again.",
  "Professional and polite behavior.",
  "Five star service!",
  "Reasonable rates for Nanded.",
  "Very satisfied with the work.",
  "Prompt response and good service.",
];

const BIO_TEMPLATES = [
  "Expert {category} services provided by verified professionals. We ensure quality and safety in every job.",
  "Serving Nanded for over 5 years. {businessName} is your trusted partner for all {category} needs.",
  "Specialized in residential and commercial {category} solutions. Customer satisfaction is our priority.",
  "Professional, punctual, and reliable {category} service provider. We use modern tools and techniques.",
  "Your local {category} experts. Quick response and affordable rates guaranteed.",
  "Dedicated to providing top-notch {category} services. We take pride in our workmanship.",
];

// Helper to get random gallery images for a category
function getGalleryImages(category: string, count: number = 3): string[] {
  const images = [];
  const startLock = Math.floor(Math.random() * 1000) + 100; // Random start to ensure variety across providers
  const keywords = {
    Plumbing: 'plumber,repair',
    Electrical: 'electrician,wiring',
    Cleaning: 'cleaning,mop',
    Salon: 'salon,haircut',
    Tutoring: 'tutor,classroom',
    Fitness: 'gym,workout',
    Catering: 'catering,food'
  }[category] || 'service,work';
  
  for (let i = 0; i < count; i++) {
    images.push(`https://loremflickr.com/800/600/${keywords.split(',').join(',')}?lock=${startLock + i}`);
  }
  return images;
}

const GALLERY_IMAGES = {} as any; // Kept for type safety if needed, though unused now

async function main() {
  console.log('🌱 Starting seed...');
  console.log('📝 Credentials will be created:');
  console.log('   Admin: admin@mh26services.com / admin123');
  console.log('   Providers: provider1@example.com to provider35@example.com / provider123');
  console.log('   Customers: customer1@example.com to customer5@example.com / customer123');

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
      
// Real person avatars (Unsplash)
const USER_AVATARS = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', // Man 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', // Woman 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', // Man 2
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', // Woman 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', // Man 3
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop', // Woman 3
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop', // Man 4
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', // Woman 4 (Indian)
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop', // Man 5
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', // Woman 5
];

function getRandomAvatar() {
  return USER_AVATARS[Math.floor(Math.random() * USER_AVATARS.length)];
}

      // Create user for provider
      const user = await prisma.user.upsert({
        where: { email: `provider${providerIndex}@example.com` },
        update: {
          avatarUrl: getRandomAvatar(),
        },
        create: {
          name: providerData.owner,
          email: `provider${providerIndex}@example.com`,
          phone: providerData.phone,
          passwordHash: password,
          role: 'PROVIDER',
          emailVerified: true,
          phoneVerified: true,
          avatarUrl: getRandomAvatar(),
        },
      });

      // Create provider
      const provider = await prisma.provider.upsert({
        where: { userId: user.id },
        update: {
          gallery: getGalleryImages(category),
        },
        create: {
          userId: user.id,
          businessName: providerData.name,
          description: BIO_TEMPLATES[Math.floor(Math.random() * BIO_TEMPLATES.length)]
            .replace('{category}', category)
            .replace('{businessName}', providerData.name),
          primaryCategory: category,
          address: `${Math.floor(Math.random() * 100)} Main Street, Nanded`,
          city: 'Nanded',
          state: 'Maharashtra',
          pincode: '431601',
          lat: 19.15 + (Math.random() * 0.05),
          lng: 77.31 + (Math.random() * 0.05),
          averageRating: 0, // Will be updated by reviews
          totalRatings: 0,
          status: 'APPROVED',
          phoneVisible: true,
          gallery: getGalleryImages(category),
        },
      });

      // Delete existing services for this provider (to avoid duplicates on re-seed)
      await prisma.service.deleteMany({
        where: { providerId: provider.id },
      });

      // Create multiple services for each provider with proper images
      const categoryServices = SERVICE_DATA[category as keyof typeof SERVICE_DATA];
      const servicesPerProvider = Math.min(3, categoryServices.length); // 3 services per provider
      
      // Get provider index within category (0-4)
      const providerIndexInCategory = (providerIndex - 1) % 5;
      
      for (let i = 0; i < servicesPerProvider; i++) {
        // Select different services for each provider in the category
        const serviceIndex = (providerIndexInCategory * servicesPerProvider + i) % categoryServices.length;
        const selectedService = categoryServices[serviceIndex];
        
        // Create service without custom ID - let Prisma generate UUID
        await prisma.service.create({
          data: {
            providerId: provider.id,
            title: selectedService.title,
            description: selectedService.description,
            price: selectedService.price,
            durationMin: selectedService.durationMin,
            imageUrl: selectedService.imageUrl,
          },
        });
      }

      // Create 1 document
      await prisma.providerDocument.create({
        data: {
          providerId: provider.id,
          type: 'aadhar',
          url: `/uploads/documents/${provider.id}/aadhar.pdf`, // Local storage path
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
        address: `${Math.floor(Math.random() * 100)} Customer Address, ${['Shivaji Nagar', 'Work', 'Taroda Naka', 'Vazirabad'][Math.floor(Math.random() * 4)]}`,
        city: 'Nanded',
        pincode: '431601',
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

  // Create Reviews
  console.log('📝 Creating reviews...');
  for (const provider of providers) {
    const reviewCount = Math.floor(Math.random() * 5) + 1; // 1-5 reviews per provider
    let totalRating = 0;

    for (let i = 0; i < reviewCount; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars mostly
      
      const categoryReviews = REVIEW_DATA[provider.primaryCategory as keyof typeof REVIEW_DATA] || [];
      const allReviews = [...categoryReviews, ...GENERIC_REVIEWS];
      const selectedComment = allReviews[Math.floor(Math.random() * allReviews.length)];

      await prisma.review.create({
        data: {
          providerId: provider.id,
          userId: customer.id,
          rating,
          comment: selectedComment,
        },
      });
      totalRating += rating;
    }

    // Update provider rating
    await prisma.provider.update({
      where: { id: provider.id },
      data: {
        totalRatings: reviewCount,
        averageRating: totalRating / reviewCount,
      },
    });
  }
  console.log('✅ Created reviews and updated provider ratings');

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

