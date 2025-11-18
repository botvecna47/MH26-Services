/**
 * Zod Validation Schemas
 * Used for request validation
 */
import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string()
      .regex(/^[6-9]\d{9}$/, 'Phone number must be 10 digits starting with 6-9')
      .length(10, 'Phone number must be exactly 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['CUSTOMER', 'PROVIDER', 'ADMIN']).default('CUSTOMER'),
    // OTP is not required in initial registration - it will be sent via email
  }),
});

export const verifyRegistrationOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

// Provider Schemas
export const createProviderSchema = z.object({
  body: z.object({
    businessName: z.string().min(3, 'Business name must be at least 3 characters'),
    description: z.string().optional(),
    primaryCategory: z.string().min(1, 'Primary category is required'),
    secondaryCategory: z.string().optional(),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().default('Maharashtra'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    lat: z.number().optional(),
    lng: z.number().optional(),
    phoneVisible: z.boolean().default(true),
  }),
});

// Booking Schemas
export const createBookingSchema = z.object({
  body: z.object({
    providerId: z.string().uuid('Invalid provider ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    scheduledAt: z.string().datetime('Invalid date format'),
    totalAmount: z.number().positive('Amount must be positive'),
    address: z.string().min(10, 'Address must be at least 10 characters').optional(),
    requirements: z.string().optional(),
  }),
});

export const rejectBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED']),
  }),
});

export const updateProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid provider ID'),
  }),
  body: z.object({
    businessName: z.string().min(3).optional(),
    description: z.string().optional(),
    primaryCategory: z.string().optional(),
    address: z.string().min(10).optional(),
    city: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    phoneVisible: z.boolean().optional(),
  }),
});

// Service Schemas
export const createServiceSchema = z.object({
  body: z.object({
    providerId: z.string().uuid(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    durationMin: z.number().int().positive('Duration must be positive'),
  }),
});

// Booking Schemas
export const createBookingSchema = z.object({
  body: z.object({
    providerId: z.string().uuid('Invalid provider ID'),
    serviceId: z.string().uuid('Invalid service ID'),
    scheduledAt: z.string().datetime('Invalid date format'),
    address: z.string().min(10, 'Address is required'),
    requirements: z.string().optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED']),
  }),
});

// Review Schema
export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid().optional(),
    providerId: z.string().uuid('Provider ID is required'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z.string().optional(),
  }),
});

// Report Schema
export const createReportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid provider ID'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Reason is required'),
    details: z.string().min(20, 'Details must be at least 20 characters'),
  }),
});

// Message Schema
export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().optional(),
    receiverId: z.string().uuid('Invalid receiver ID format').min(1, 'Receiver ID is required'),
    text: z.string().min(1, 'Message text is required'),
    attachments: z.any().optional(),
  }),
});

