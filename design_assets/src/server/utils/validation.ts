// Server-side validation utilities
import validator from 'validator';

// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email.trim());
};

// Password validation - at least 8 chars, 1 upper, 1 lower, 1 number
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone validation (Indian format)
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digits and check
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Indian phone number patterns
  const phoneRegex = /^(\+91)?[6789]\d{9}$/;
  return phoneRegex.test(cleanPhone);
};

// Name validation
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmedName);
};

// Indian pincode validation
export const validatePincode = (pincode: string): boolean => {
  if (!pincode || typeof pincode !== 'string') return false;
  
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
};

// Business name validation
export const validateBusinessName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  return trimmedName.length >= 3 && trimmedName.length <= 100;
};

// Price validation
export const validatePrice = (price: any): boolean => {
  const numPrice = Number(price);
  return !isNaN(numPrice) && numPrice > 0 && numPrice <= 100000; // Max 1 lakh
};

// Rating validation (1-5)
export const validateRating = (rating: any): boolean => {
  const numRating = Number(rating);
  return !isNaN(numRating) && numRating >= 1 && numRating <= 5 && Number.isInteger(numRating);
};

// Date validation (not in past for bookings)
export const validateFutureDate = (date: string): boolean => {
  if (!date) return false;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

// Time validation (HH:MM format)
export const validateTime = (time: string): boolean => {
  if (!time || typeof time !== 'string') return false;
  
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// File upload validation
export const validateFileUpload = (file: any, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}) => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  // Size validation (in bytes)
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`File size must be less than ${(options.maxSize / (1024 * 1024)).toFixed(1)}MB`);
  }
  
  // MIME type validation
  if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }
  
  // Extension validation
  if (options.allowedExtensions) {
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize text input
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return validator.escape(text.trim());
};

// Validate object ID (for database IDs)
export const validateObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // For CUID (Prisma default)
  return /^c[a-z0-9]{24}$/.test(id);
};

// Validate pagination parameters
export const validatePagination = (page: any, limit: any) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  return {
    page: Math.max(1, pageNum),
    limit: Math.min(Math.max(1, limitNum), 100), // Max 100 items per page
  };
};

// Validate search query
export const validateSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== 'string') return false;
  
  const trimmedQuery = query.trim();
  return trimmedQuery.length >= 2 && trimmedQuery.length <= 100;
};

// Validate booking data
export const validateBookingData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.serviceId || !validateObjectId(data.serviceId)) {
    errors.push('Valid service ID is required');
  }
  
  if (!data.providerId || !validateObjectId(data.providerId)) {
    errors.push('Valid provider ID is required');
  }
  
  if (!data.addressId || !validateObjectId(data.addressId)) {
    errors.push('Valid address ID is required');
  }
  
  if (!data.scheduledDate || !validateFutureDate(data.scheduledDate)) {
    errors.push('Valid future date is required');
  }
  
  if (!data.scheduledTime || !validateTime(data.scheduledTime)) {
    errors.push('Valid time is required');
  }
  
  if (!data.estimatedPrice || !validatePrice(data.estimatedPrice)) {
    errors.push('Valid estimated price is required');
  }
  
  if (!data.estimatedDuration || isNaN(Number(data.estimatedDuration)) || Number(data.estimatedDuration) <= 0) {
    errors.push('Valid estimated duration is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate address data
export const validateAddressData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.street || data.street.trim().length < 5) {
    errors.push('Street address must be at least 5 characters');
  }
  
  if (!data.area || data.area.trim().length < 2) {
    errors.push('Area must be at least 2 characters');
  }
  
  if (!data.city || !validateName(data.city)) {
    errors.push('Valid city name is required');
  }
  
  if (!data.state || !validateName(data.state)) {
    errors.push('Valid state name is required');
  }
  
  if (!data.pincode || !validatePincode(data.pincode)) {
    errors.push('Valid Indian pincode is required');
  }
  
  if (!data.type || !['HOME', 'WORK', 'BUSINESS', 'OTHER'].includes(data.type)) {
    errors.push('Valid address type is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate review data
export const validateReviewData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.rating || !validateRating(data.rating)) {
    errors.push('Valid rating (1-5) is required');
  }
  
  if (data.comment && (typeof data.comment !== 'string' || data.comment.trim().length > 500)) {
    errors.push('Comment must be less than 500 characters');
  }
  
  if (!data.bookingId || !validateObjectId(data.bookingId)) {
    errors.push('Valid booking ID is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate service data
export const validateServiceData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 3 || data.name.trim().length > 100) {
    errors.push('Service name must be 3-100 characters');
  }
  
  if (!data.categoryId || !validateObjectId(data.categoryId)) {
    errors.push('Valid category ID is required');
  }
  
  if (!data.description || data.description.trim().length < 10 || data.description.trim().length > 500) {
    errors.push('Description must be 10-500 characters');
  }
  
  if (!data.basePrice || !validatePrice(data.basePrice)) {
    errors.push('Valid base price is required');
  }
  
  if (!data.priceType || !['FIXED', 'HOURLY', 'PER_ITEM'].includes(data.priceType)) {
    errors.push('Valid price type is required');
  }
  
  if (!data.duration || isNaN(Number(data.duration)) || Number(data.duration) <= 0) {
    errors.push('Valid duration in minutes is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validatePincode,
  validateBusinessName,
  validatePrice,
  validateRating,
  validateFutureDate,
  validateTime,
  validateFileUpload,
  sanitizeText,
  validateObjectId,
  validatePagination,
  validateSearchQuery,
  validateBookingData,
  validateAddressData,
  validateReviewData,
  validateServiceData,
};