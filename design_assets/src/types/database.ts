// Database Models - These would translate directly to Prisma schema

export interface User {
  id: string;
  email: string;
  password?: string; // Never sent to frontend
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'customer' | 'provider' | 'admin';
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Customer extends User {
  addresses: Address[];
  preferences: CustomerPreferences;
  loyaltyPoints: number;
}

export interface Provider extends User {
  businessName: string;
  businessDescription: string;
  serviceCategories: string[];
  businessAddress: Address;
  businessImages: string[];
  documents: ProviderDocument[];
  availability: ProviderAvailability[];
  ratings: {
    average: number;
    totalReviews: number;
  };
  earnings: {
    total: number;
    thisMonth: number;
    pending: number;
  };
  isApproved: boolean;
  approvedAt?: string;
  rejectionReason?: string;
  bankDetails?: BankDetails;
}

export interface Admin extends User {
  permissions: AdminPermission[];
  lastActive: string;
}

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'business' | 'other';
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'per_item';
  duration: number; // in minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  services: Service[];
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  address: Address;
  requirements?: string;
  estimatedDuration: number;
  estimatedPrice: number;
  actualPrice?: number;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  customer: Customer;
  provider: Provider;
  service: Service;
  reviews?: Review[];
  messages?: Message[];
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'disputed';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number; // 1-5
  comment?: string;
  photos?: string[];
  isAnonymous: boolean;
  createdAt: string;
  
  // Relations
  customer: Customer;
  provider: Provider;
  booking: Booking;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  
  // Relations
  sender: User;
  receiver: User;
  booking: Booking;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any; // Additional data for the notification
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'payment_received'
  | 'payment_failed'
  | 'review_received'
  | 'message_received'
  | 'system_announcement';

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  platformFee: number;
  providerAmount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';

export interface CustomerPreferences {
  preferredContactMethod: 'phone' | 'email' | 'both';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  defaultPaymentMethod?: PaymentMethod;
}

export interface ProviderDocument {
  id: string;
  providerId: string;
  type: 'id_proof' | 'address_proof' | 'business_license' | 'insurance';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isAvailable: boolean;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  isVerified: boolean;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyBookings: { month: string; count: number }[];
  topServices: { service: string; count: number }[];
  revenueGrowth: number;
  userGrowth: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'customer' | 'provider' | 'admin';
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userType: 'customer' | 'provider';
  businessName?: string; // For providers
  serviceCategories?: string[]; // For providers
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  userType: 'customer' | 'provider' | 'admin';
  iat: number;
  exp: number;
}