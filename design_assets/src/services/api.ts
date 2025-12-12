// API Service Layer - Mock implementation that simulates real backend calls
import { 
  User, Customer, Provider, Admin, Booking, Service, ServiceCategory, 
  Review, Message, Notification, Payment, ApiResponse, PaginatedResponse,
  LoginCredentials, RegisterData, AuthTokens, AnalyticsData, Address
} from '../types/database';

// Enhanced Mock Data with Real Provider Information
let mockProviders: Provider[] = [
  {
    id: 'provider-1',
    email: 'provider@mh26.com',
    firstName: 'Rajesh',
    lastName: 'Patil',
    phone: '+91-9876543212',
    userType: 'provider',
    isVerified: true,
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
    businessName: 'Rajesh Home Tiffin Service',
    businessDescription: 'Authentic Maharashtrian home-cooked meals prepared fresh daily with quality ingredients. Specializing in traditional Nanded-style cuisine.',
    serviceCategories: ['tiffin-services'],
    businessAddress: {
      id: 'addr-1',
      userId: 'provider-1',
      type: 'business',
      street: 'Shop No. 12, Gandhi Market',
      area: 'Shivaji Nagar',
      city: 'Nanded',
      state: 'Maharashtra',
      pincode: '431601',
      landmark: 'Near City Bus Stand',
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    businessImages: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    ],
    documents: [],
    availability: [],
    ratings: {
      average: 4.8,
      totalReviews: 127,
    },
    earnings: {
      total: 145000,
      thisMonth: 18500,
      pending: 3200,
    },
    isApproved: true,
    approvedAt: new Date('2024-01-20').toISOString(),
  },
];

let mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Monthly Tiffin Service',
    category: {
      id: 'cat-1',
      name: 'Tiffin Services',
      slug: 'tiffin-services',
      description: 'Home-cooked meals delivered fresh',
      icon: '🍱',
      isActive: true,
      services: [],
    },
    description: 'Fresh, home-cooked vegetarian meals delivered daily to your doorstep',
    basePrice: 3500,
    priceType: 'fixed',
    duration: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-2',
    name: 'Electrical Repair & Installation',
    category: {
      id: 'cat-2',
      name: 'Electrical Services',
      slug: 'electrical-services',
      description: 'Professional electrical repairs and installations',
      icon: '⚡',
      isActive: true,
      services: [],
    },
    description: 'Expert electrical repair, wiring, and appliance installation services',
    basePrice: 300,
    priceType: 'hourly',
    duration: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'service-3',
    name: 'Plumbing Services',
    category: {
      id: 'cat-3',
      name: 'Plumbing Services',
      slug: 'plumbing-services',
      description: 'Expert plumbing solutions',
      icon: '🔧',
      isActive: true,
      services: [],
    },
    description: 'Professional plumbing repairs, installations, and maintenance',
    basePrice: 250,
    priceType: 'hourly',
    duration: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockReviews: Review[] = [
  {
    id: 'review-1',
    bookingId: 'booking-1',
    customerId: 'customer-1',
    providerId: 'provider-1',
    rating: 5,
    comment: 'Excellent service! The food quality is amazing and delivery is always on time.',
    createdAt: new Date('2024-11-15').toISOString(),
    customer: {
      id: 'customer-1',
      firstName: 'Priya',
      lastName: 'Sharma',
      profileImage: undefined,
    } as any,
  },
  {
    id: 'review-2',
    bookingId: 'booking-2',
    customerId: 'customer-2',
    providerId: 'provider-1',
    rating: 4,
    comment: 'Great taste and good portion sizes. Highly recommend for authentic Maharashtrian food.',
    createdAt: new Date('2024-11-20').toISOString(),
    customer: {
      id: 'customer-2',
      firstName: 'Amit',
      lastName: 'Deshmukh',
      profileImage: undefined,
    } as any,
  },
];

// Mock data storage with demo users for testing
let mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@mh26.com',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+91-9876543210',
    userType: 'admin',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'customer-1',
    email: 'customer@mh26.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    phone: '+91-9876543211',
    userType: 'customer',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'provider-1',
    email: 'provider@mh26.com',
    firstName: 'Rajesh',
    lastName: 'Patil',
    phone: '+91-9876543212',
    userType: 'provider',
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockBookings: Booking[] = [];
let mockNotifications: Notification[] = [];
let mockMessages: Message[] = [];

// Utility functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => Math.random().toString(36).substr(2, 9);

const createToken = (user: User): AuthTokens => {
  const payload = {
    userId: user.id,
    email: user.email,
    userType: user.userType,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  // In real app: use jsonwebtoken library
  const token = btoa(JSON.stringify(payload));
  
  return {
    accessToken: `Bearer ${token}`,
    refreshToken: `refresh_${token}`,
    expiresIn: 7 * 24 * 60 * 60
  };
};

const validateToken = (token: string): User | null => {
  try {
    if (!token.startsWith('Bearer ')) return null;
    const payload = JSON.parse(atob(token.replace('Bearer ', '')));
    const user = mockUsers.find(u => u.id === payload.userId);
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return user || null;
  } catch {
    return null;
  }
};

// Auth API
export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    await delay(800); // Simulate network delay
    
    // Demo login - accepts demo@mh26.com with password demo123 for any user type
    if (credentials.email === 'demo@mh26.com' && credentials.password === 'demo123') {
      const user = mockUsers.find(u => u.userType === credentials.userType);
      if (user) {
        const tokens = createToken(user);
        user.lastLogin = new Date().toISOString();
        return {
          success: true,
          data: { user, tokens }
        };
      }
    }
    
    // Normal login flow
    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      u.userType === credentials.userType
    );
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials. Use demo@mh26.com / demo123 for testing.'
      };
    }
    
    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is deactivated'
      };
    }
    
    const tokens = createToken(user);
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    return {
      success: true,
      data: { user, tokens }
    };
  }
  
  static async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    await delay(1500);
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }
    
    const newUser: User = {
      id: generateId(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      userType: data.userType,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    const tokens = createToken(newUser);
    
    return {
      success: true,
      data: { user: newUser, tokens }
    };
  }
  
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    await delay(500);
    
    // In real app: validate refresh token and generate new access token
    return {
      success: true,
      data: {
        accessToken: `Bearer ${btoa(JSON.stringify({ refreshed: true }))}`,
        refreshToken: refreshToken,
        expiresIn: 7 * 24 * 60 * 60
      }
    };
  }
  
  static async logout(token: string): Promise<ApiResponse<void>> {
    await delay(300);
    
    // In real app: invalidate token on server
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
  
  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    await delay(1000);
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return {
        success: false,
        error: 'No account found with this email'
      };
    }
    
    return {
      success: true,
      message: 'Password reset link sent to your email'
    };
  }
}

// User API
export class UserAPI {
  static async getProfile(token: string): Promise<ApiResponse<User>> {
    await delay(500);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    return {
      success: true,
      data: user
    };
  }
  
  static async updateProfile(token: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    await delay(800);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    // Update user data
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    
    return {
      success: true,
      data: user
    };
  }
  
  static async changePassword(token: string, oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    await delay(1000);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    // In real app: verify old password and hash new password
    return {
      success: true,
      message: 'Password updated successfully'
    };
  }
}

// Booking API
export class BookingAPI {
  static async createBooking(token: string, bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
    await delay(1200);
    
    const user = validateToken(token);
    if (!user || user.userType !== 'customer') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
    
    const newBooking: Booking = {
      id: generateId(),
      customerId: user.id,
      providerId: bookingData.providerId!,
      serviceId: bookingData.serviceId!,
      status: 'pending',
      scheduledDate: bookingData.scheduledDate!,
      scheduledTime: bookingData.scheduledTime!,
      address: bookingData.address!,
      requirements: bookingData.requirements,
      estimatedDuration: bookingData.estimatedDuration!,
      estimatedPrice: bookingData.estimatedPrice!,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: user as Customer,
      provider: {} as Provider, // Would be populated from DB
      service: {} as Service, // Would be populated from DB
    };
    
    mockBookings.push(newBooking);
    
    // Create notification for provider
    const notification: Notification = {
      id: generateId(),
      userId: bookingData.providerId!,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for ${new Date(bookingData.scheduledDate!).toLocaleDateString()}`,
      data: { bookingId: newBooking.id },
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    mockNotifications.push(notification);
    
    return {
      success: true,
      data: newBooking
    };
  }
  
  static async getBookings(token: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    await delay(600);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    let userBookings = mockBookings.filter(booking => 
      user.userType === 'customer' ? booking.customerId === user.id :
      user.userType === 'provider' ? booking.providerId === user.id :
      true // admin sees all
    );
    
    if (filters?.status) {
      userBookings = userBookings.filter(b => b.status === filters.status);
    }
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const total = userBookings.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedBookings = userBookings.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedBookings,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  }
  
  static async updateBookingStatus(token: string, bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    await delay(800);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }
    
    // Check permissions
    if (user.userType === 'customer' && booking.customerId !== user.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
    
    if (user.userType === 'provider' && booking.providerId !== user.id) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
    
    booking.status = status as any;
    booking.updatedAt = new Date().toISOString();
    
    if (status === 'completed') {
      booking.completedAt = new Date().toISOString();
    }
    
    if (status === 'cancelled') {
      booking.cancelledAt = new Date().toISOString();
    }
    
    return {
      success: true,
      data: booking
    };
  }
}

// Service API
export class ServiceAPI {
  static async getServices(filters?: {
    category?: string;
    search?: string;
    location?: string;
  }): Promise<ApiResponse<Service[]>> {
    await delay(400);
    
    // Mock services data
    const mockServices: Service[] = [
      {
        id: 'service-1',
        name: 'Home Tiffin Service',
        category: {
          id: 'cat-1',
          name: 'Tiffin Services',
          slug: 'tiffin-services',
          description: 'Home-cooked meals delivered fresh',
          icon: '🍱',
          isActive: true,
          services: []
        },
        description: 'Fresh, home-cooked meals delivered daily',
        basePrice: 150,
        priceType: 'fixed',
        duration: 30,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'service-2',
        name: 'Electrical Repair',
        category: {
          id: 'cat-2',
          name: 'Electrical Services',
          slug: 'electrical-services',
          description: 'Professional electrical repairs and installations',
          icon: '⚡',
          isActive: true,
          services: []
        },
        description: 'Professional electrical repair and installation services',
        basePrice: 200,
        priceType: 'hourly',
        duration: 60,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more mock services...
    ];
    
    let filteredServices = mockServices;
    
    if (filters?.category) {
      filteredServices = filteredServices.filter(s => 
        s.category.slug === filters.category
      );
    }
    
    if (filters?.search) {
      filteredServices = filteredServices.filter(s =>
        s.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        s.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: filteredServices
    };
  }
  
  static async getServiceCategories(): Promise<ApiResponse<ServiceCategory[]>> {
    await delay(300);
    
    const categories: ServiceCategory[] = [
      {
        id: 'cat-1',
        name: 'Tiffin Services',
        slug: 'tiffin-services',
        description: 'Home-cooked meals delivered fresh',
        icon: '🍱',
        isActive: true,
        services: []
      },
      {
        id: 'cat-2',
        name: 'Electrical Services',
        slug: 'electrical-services',
        description: 'Professional electrical repairs and installations',
        icon: '⚡',
        isActive: true,
        services: []
      },
      {
        id: 'cat-3',
        name: 'Plumbing Services',
        slug: 'plumbing-services',
        description: 'Expert plumbing solutions for your home',
        icon: '🔧',
        isActive: true,
        services: []
      },
      {
        id: 'cat-4',
        name: 'Tourism Guide',
        slug: 'tourism-guide',
        description: 'Local tourism and travel guide services',
        icon: '🗺️',
        isActive: true,
        services: []
      }
    ];
    
    return {
      success: true,
      data: categories
    };
  }
}

// Provider API
export class ProviderAPI {
  static async getProviders(filters?: {
    category?: string;
    search?: string;
    location?: string;
    rating?: number;
  }): Promise<ApiResponse<Provider[]>> {
    await delay(600);
    
    let filteredProviders = [...mockProviders];
    
    if (filters?.category) {
      filteredProviders = filteredProviders.filter(p => 
        p.serviceCategories.includes(filters.category!)
      );
    }
    
    if (filters?.search) {
      filteredProviders = filteredProviders.filter(p =>
        p.businessName.toLowerCase().includes(filters.search!.toLowerCase()) ||
        p.businessDescription.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    if (filters?.rating) {
      filteredProviders = filteredProviders.filter(p => 
        p.ratings.average >= filters.rating!
      );
    }
    
    return {
      success: true,
      data: filteredProviders
    };
  }
  
  static async getProvider(id: string): Promise<ApiResponse<Provider>> {
    await delay(500);
    
    const provider = mockProviders.find(p => p.id === id);
    if (!provider) {
      return {
        success: false,
        error: 'Provider not found'
      };
    }
    
    return {
      success: true,
      data: provider
    };
  }
  
  static async getFeatured(): Promise<ApiResponse<Provider[]>> {
    await delay(400);
    
    // Return top-rated providers
    const featured = mockProviders
      .filter(p => p.isApproved && p.isActive)
      .sort((a, b) => b.ratings.average - a.ratings.average)
      .slice(0, 4);
    
    return {
      success: true,
      data: featured
    };
  }
  
  static async applyAsProvider(token: string, applicationData: any): Promise<ApiResponse<void>> {
    await delay(1500);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    // In real app: save application data and set status to pending
    return {
      success: true,
      message: 'Provider application submitted successfully. We will review and get back to you within 2-3 business days.'
    };
  }
}

// Review API
export class ReviewAPI {
  static async getByProvider(providerId: string): Promise<ApiResponse<Review[]>> {
    await delay(400);
    
    const reviews = mockReviews.filter(r => r.providerId === providerId);
    
    return {
      success: true,
      data: reviews
    };
  }
  
  static async create(token: string, reviewData: Partial<Review>): Promise<ApiResponse<Review>> {
    await delay(800);
    
    const user = validateToken(token);
    if (!user || user.userType !== 'customer') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
    
    const newReview: Review = {
      id: generateId(),
      bookingId: reviewData.bookingId!,
      customerId: user.id,
      providerId: reviewData.providerId!,
      rating: reviewData.rating!,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      customer: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      } as any,
    };
    
    mockReviews.push(newReview);
    
    return {
      success: true,
      data: newReview
    };
  }
}

// Notification API
export class NotificationAPI {
  static async getNotifications(token: string): Promise<ApiResponse<Notification[]>> {
    await delay(400);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    const userNotifications = mockNotifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return {
      success: true,
      data: userNotifications
    };
  }
  
  static async markAsRead(token: string, notificationId: string): Promise<ApiResponse<void>> {
    await delay(200);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    const notification = mockNotifications.find(n => 
      n.id === notificationId && n.userId === user.id
    );
    
    if (notification) {
      notification.isRead = true;
    }
    
    return {
      success: true,
      message: 'Notification marked as read'
    };
  }
  
  static async markAllAsRead(token: string): Promise<ApiResponse<void>> {
    await delay(300);
    
    const user = validateToken(token);
    if (!user) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    mockNotifications
      .filter(n => n.userId === user.id)
      .forEach(n => n.isRead = true);
    
    return {
      success: true,
      message: 'All notifications marked as read'
    };
  }
}

// Admin API
export class AdminAPI {
  static async getAnalytics(token: string): Promise<ApiResponse<AnalyticsData>> {
    await delay(800);
    
    const user = validateToken(token);
    if (!user || user.userType !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
    
    const analytics: AnalyticsData = {
      totalUsers: mockUsers.length,
      totalProviders: mockUsers.filter(u => u.userType === 'provider').length,
      totalCustomers: mockUsers.filter(u => u.userType === 'customer').length,
      totalBookings: mockBookings.length,
      totalRevenue: 45000,
      monthlyBookings: [
        { month: 'Jan', count: 45 },
        { month: 'Feb', count: 52 },
        { month: 'Mar', count: 48 },
        { month: 'Apr', count: 61 },
        { month: 'May', count: 55 },
        { month: 'Jun', count: 67 },
      ],
      topServices: [
        { service: 'Tiffin Services', count: 89 },
        { service: 'Electrical Services', count: 76 },
        { service: 'Plumbing Services', count: 54 },
        { service: 'Tourism Guide', count: 32 },
      ],
      revenueGrowth: 12.5,
      userGrowth: 8.3,
    };
    
    return {
      success: true,
      data: analytics
    };
  }
  
  static async getAllUsers(token: string, filters?: {
    userType?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    await delay(600);
    
    const user = validateToken(token);
    if (!user || user.userType !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }
    
    let filteredUsers = mockUsers;
    
    if (filters?.userType) {
      filteredUsers = filteredUsers.filter(u => u.userType === filters.userType);
    }
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  }
}

// Export all APIs
export const API = {
  Auth: AuthAPI,
  User: UserAPI,
  Booking: BookingAPI,
  Service: ServiceAPI,
  Provider: ProviderAPI,
  Review: ReviewAPI,
  Notification: NotificationAPI,
  Admin: AdminAPI,
};

export default API;