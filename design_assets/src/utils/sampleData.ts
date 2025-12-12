export interface SampleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
  avatar?: string;
  businessName?: string;
  phone?: string;
  joinDate: string;
}

export interface SampleProvider {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  verified: boolean;
  available: boolean;
  pricing: string;
}

export interface SampleTransaction {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  service: string;
  amount: number;
  status: 'completed' | 'active' | 'pending' | 'cancelled';
  date: string;
  dateRaw: Date;
}

// Sample Users
export const sampleUsers: SampleUser[] = [
  {
    id: 'user-1',
    email: 'devansh.patel@example.com',
    firstName: 'Devansh',
    lastName: 'Patel',
    role: 'user',
    phone: '+91 98765 43210',
    joinDate: 'March 2024'
  },
  {
    id: 'user-2',
    email: 'ayesha.k@example.com',
    firstName: 'Ayesha',
    lastName: 'Khan',
    role: 'user',
    phone: '+91 98765 43211',
    joinDate: 'April 2024'
  },
  {
    id: 'user-3',
    email: 'rohit.deshmukh@example.com',
    firstName: 'Rohit',
    lastName: 'Deshmukh',
    role: 'user',
    phone: '+91 98765 43212',
    joinDate: 'May 2024'
  },
  {
    id: 'user-4',
    email: 'priya.sharma@example.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'user',
    phone: '+91 98765 43213',
    joinDate: 'June 2024'
  },
  {
    id: 'user-5',
    email: 'ankit.verma@example.com',
    firstName: 'Ankit',
    lastName: 'Verma',
    role: 'user',
    phone: '+91 98765 43214',
    joinDate: 'July 2024'
  }
];

// Sample Providers - Real Nanded MH26 Service Providers
// Data sourced from local business directories (mock Google Maps API)
export const sampleProviders: SampleProvider[] = [
  {
    id: 'provider-1',
    userId: 'provider-user-1',
    businessName: 'QuickFix Plumbing Services',
    category: 'Plumbing',
    description: 'Professional plumbing services for residential and commercial properties. 24/7 emergency service available. Specialized in pipe repairs, bathroom fittings, and water leakage solutions.',
    rating: 4.8,
    reviewCount: 142,
    completedJobs: 387,
    responseTime: '< 30 min',
    location: 'Shri Guru Gobind Singh Ji Nagar, Nanded',
    verified: true,
    available: true,
    pricing: '₹500 - ₹2000'
  },
  {
    id: 'provider-2',
    userId: 'provider-user-2',
    businessName: 'Sai Maharashtrian Tiffin Service',
    category: 'Tiffin Service',
    description: 'Authentic homemade Maharashtrian meals delivered fresh daily. Customizable meal plans available. Pure vegetarian options with traditional recipes passed through generations.',
    rating: 4.9,
    reviewCount: 256,
    completedJobs: 1243,
    responseTime: '< 1 hour',
    location: 'Vazirabad, Nanded',
    verified: true,
    available: true,
    pricing: '₹150 - ₹300/day'
  },
  {
    id: 'provider-3',
    userId: 'provider-user-3',
    businessName: 'PowerFit Gym & Training',
    category: 'Fitness Training',
    description: 'Personal training and group fitness classes. Specialized in weight loss, muscle building, and functional training programs. Certified trainers with modern equipment.',
    rating: 4.7,
    reviewCount: 89,
    completedJobs: 156,
    responseTime: '< 2 hours',
    location: 'Taroda Road, Nanded',
    verified: true,
    available: true,
    pricing: '₹2000 - ₹5000/month'
  },
  {
    id: 'provider-4',
    userId: 'provider-user-4',
    businessName: 'Sachkhand Heritage Tours',
    category: 'Tourism',
    description: 'Guided tours of Nanded historical sites including Takht Sachkhand Sri Hazur Sahib. Customized packages for groups, families, and pilgrims. Expert local guides with multilingual support.',
    rating: 4.6,
    reviewCount: 74,
    completedJobs: 203,
    responseTime: '< 4 hours',
    location: 'Near Gurudwara Sahib, Nanded',
    verified: false,
    available: true,
    pricing: '₹800 - ₹3000/tour'
  },
  {
    id: 'provider-5',
    userId: 'provider-user-5',
    businessName: 'Bright Spark Electricals',
    category: 'Electrical',
    description: 'Licensed electricians for installations, repairs, and maintenance. Solar panel installation specialists. Available for residential, commercial, and industrial electrical work.',
    rating: 4.5,
    reviewCount: 118,
    completedJobs: 294,
    responseTime: '< 45 min',
    location: 'Ganesh Nagar, Nanded',
    verified: true,
    available: true,
    pricing: '₹400 - ₹1800'
  },
  {
    id: 'provider-6',
    userId: 'provider-user-6',
    businessName: 'SparkleClean Home Services',
    category: 'Cleaning',
    description: 'Professional home and office cleaning services. Deep cleaning, sanitization, and regular maintenance packages available. Eco-friendly products and trained staff.',
    rating: 4.4,
    reviewCount: 95,
    completedJobs: 218,
    responseTime: '< 3 hours',
    location: 'Shivaji Nagar, Nanded',
    verified: true,
    available: true,
    pricing: '₹800 - ₹2500'
  },
  {
    id: 'provider-7',
    userId: 'provider-user-7',
    businessName: 'Elegance Beauty Salon & Spa',
    category: 'Salon & Beauty',
    description: 'Full-service beauty salon offering haircuts, styling, spa treatments, and bridal makeup. Unisex salon with experienced beauticians and modern facilities.',
    rating: 4.6,
    reviewCount: 167,
    completedJobs: 542,
    responseTime: '< 2 hours',
    location: 'Station Road, Nanded',
    verified: true,
    available: true,
    pricing: '₹300 - ₹5000'
  }
];

// Sample Transactions
export const sampleTransactions: SampleTransaction[] = [
  {
    id: 'txn-1',
    orderId: '#48213',
    customerId: 'user-1',
    customerName: 'Devansh Patel',
    providerId: 'provider-1',
    providerName: 'QuickFix Plumbing',
    service: 'Bathroom pipe repair',
    amount: 850,
    status: 'completed',
    date: 'Nov 10, 2024',
    dateRaw: new Date('2024-11-10')
  },
  {
    id: 'txn-2',
    orderId: '#48214',
    customerId: 'user-2',
    customerName: 'Ayesha Khan',
    providerId: 'provider-2',
    providerName: 'Maharashtrian Tiffin Express',
    service: 'Monthly tiffin subscription',
    amount: 4500,
    status: 'active',
    date: 'Nov 8, 2024',
    dateRaw: new Date('2024-11-08')
  },
  {
    id: 'txn-3',
    orderId: '#48215',
    customerId: 'user-3',
    customerName: 'Rohit Deshmukh',
    providerId: 'provider-3',
    providerName: 'Studio One Fitness',
    service: '3-month training program',
    amount: 12000,
    status: 'active',
    date: 'Nov 5, 2024',
    dateRaw: new Date('2024-11-05')
  },
  {
    id: 'txn-4',
    orderId: '#48216',
    customerId: 'user-4',
    customerName: 'Priya Sharma',
    providerId: 'provider-4',
    providerName: 'Nanded Heritage Tours',
    service: 'Temple tour package',
    amount: 1200,
    status: 'completed',
    date: 'Nov 3, 2024',
    dateRaw: new Date('2024-11-03')
  },
  {
    id: 'txn-5',
    orderId: '#48217',
    customerId: 'user-5',
    customerName: 'Ankit Verma',
    providerId: 'provider-5',
    providerName: 'Bright Spark Electricals',
    service: 'Ceiling fan installation',
    amount: 650,
    status: 'pending',
    date: 'Nov 11, 2024',
    dateRaw: new Date('2024-11-11')
  }
];

// Helper functions
export function getProviderById(id: string): SampleProvider | undefined {
  return sampleProviders.find(p => p.id === id);
}

export function getUserById(id: string): SampleUser | undefined {
  return sampleUsers.find(u => u.id === id);
}

export function getTransactionsByUserId(userId: string): SampleTransaction[] {
  return sampleTransactions.filter(t => t.customerId === userId);
}

export function getTransactionsByProviderId(providerId: string): SampleTransaction[] {
  return sampleTransactions.filter(t => t.providerId === providerId);
}
