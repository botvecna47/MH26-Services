// Enhanced validation utilities for production use
import React from 'react';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, data?: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationRule[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  errorMap: Record<string, string>;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s\-\(\)]{10,}$/,
  indianPhone: /^(\+91|91)?[6-9]\d{9}$/,
  pincode: /^\d{6}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  accountNumber: /^\d{9,18}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^\d+$/,
  decimal: /^\d*\.?\d+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
  businessName: /^[a-zA-Z0-9\s&.-]+$/,
  address: /^[a-zA-Z0-9\s,.-]+$/
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  indianPhone: 'Please enter a valid Indian phone number',
  pincode: 'Please enter a valid 6-digit pincode',
  ifsc: 'Please enter a valid IFSC code',
  accountNumber: 'Please enter a valid account number',
  password: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  strongPassword: 'Password must be at least 12 characters with uppercase, lowercase, number and special character',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must not exceed ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must not exceed ${max}`,
  url: 'Please enter a valid URL',
  alphabetic: 'Only letters and spaces are allowed',
  numeric: 'Only numbers are allowed',
  alphanumeric: 'Only letters and numbers are allowed',
  businessName: 'Business name can only contain letters, numbers, spaces, &, ., and -',
  address: 'Address can only contain letters, numbers, spaces, commas, periods, and hyphens'
};

// Validation function
export function validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: ValidationError[] = [];
  const errorMap: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const ruleArray = Array.isArray(rules) ? rules : [rules];

    for (const rule of ruleArray) {
      const error = validateField(field, value, rule, data);
      if (error) {
        errors.push(error);
        if (!errorMap[field]) {
          errorMap[field] = error.message;
        }
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorMap
  };
}

function validateField(field: string, value: any, rule: ValidationRule, data?: any): ValidationError | null {
  // Required validation
  if (rule.required && (value === null || value === undefined || value === '')) {
    return {
      field,
      message: rule.message || VALIDATION_MESSAGES.required
    };
  }

  // Skip other validations if value is empty and not required
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // String length validations
  if (typeof value === 'string') {
    if (rule.min && value.length < rule.min) {
      return {
        field,
        message: rule.message || VALIDATION_MESSAGES.minLength(rule.min)
      };
    }

    if (rule.max && value.length > rule.max) {
      return {
        field,
        message: rule.message || VALIDATION_MESSAGES.maxLength(rule.max)
      };
    }
  }

  // Numeric range validations
  if (typeof value === 'number') {
    if (rule.min && value < rule.min) {
      return {
        field,
        message: rule.message || VALIDATION_MESSAGES.min(rule.min)
      };
    }

    if (rule.max && value > rule.max) {
      return {
        field,
        message: rule.message || VALIDATION_MESSAGES.max(rule.max)
      };
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return {
      field,
      message: rule.message || 'Invalid format'
    };
  }

  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value, data);
    if (result !== true) {
      return {
        field,
        message: typeof result === 'string' ? result : rule.message || 'Invalid value'
      };
    }
  }

  return null;
}

// Pre-defined validation schemas
export const USER_VALIDATION_SCHEMAS = {
  registration: {
    firstName: [
      { required: true },
      { min: 2, max: 50 },
      { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
    ],
    lastName: [
      { required: true },
      { min: 2, max: 50 },
      { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
    ],
    email: [
      { required: true },
      { pattern: VALIDATION_PATTERNS.email, message: VALIDATION_MESSAGES.email }
    ],
    phone: [
      { required: true },
      { pattern: VALIDATION_PATTERNS.indianPhone, message: VALIDATION_MESSAGES.indianPhone }
    ],
    password: [
      { required: true },
      { pattern: VALIDATION_PATTERNS.password, message: VALIDATION_MESSAGES.password }
    ],
    confirmPassword: [
      { required: true },
      { 
        custom: (value: any, data: any) => value === data?.password,
        message: 'Passwords do not match'
      }
    ]
  },

  login: {
    email: [
      { required: true },
      { pattern: VALIDATION_PATTERNS.email, message: VALIDATION_MESSAGES.email }
    ],
    password: [
      { required: true },
      { min: 1, message: 'Password is required' }
    ]
  },

  profile: {
    firstName: [
      { required: true },
      { min: 2, max: 50 },
      { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
    ],
    lastName: [
      { required: true },
      { min: 2, max: 50 },
      { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
    ],
    phone: [
      { pattern: VALIDATION_PATTERNS.indianPhone, message: VALIDATION_MESSAGES.indianPhone }
    ]
  }
};

export const PROVIDER_VALIDATION_SCHEMAS = {
  application: {
    businessName: [
      { required: true },
      { min: 3, max: 100 },
      { pattern: VALIDATION_PATTERNS.businessName, message: VALIDATION_MESSAGES.businessName }
    ],
    businessDescription: [
      { required: true },
      { min: 50, max: 1000 }
    ],
    serviceCategories: [
      { required: true },
      { 
        custom: (value: any) => Array.isArray(value) && value.length > 0,
        message: 'Please select at least one service category'
      }
    ]
  },

  bankDetails: {
    accountNumber: [
      { required: true },
      { pattern: VALIDATION_PATTERNS.accountNumber, message: VALIDATION_MESSAGES.accountNumber }
    ],
    ifscCode: [
      { required: true },
      { pattern: VALIDATION_PATTERNS.ifsc, message: VALIDATION_MESSAGES.ifsc }
    ],
    accountHolderName: [
      { required: true },
      { min: 3, max: 100 },
      { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
    ],
    bankName: [
      { required: true },
      { min: 3, max: 100 }
    ]
  }
};

export const BOOKING_VALIDATION_SCHEMAS = {
  booking: {
    serviceId: [
      { required: true, message: 'Please select a service' }
    ],
    providerId: [
      { required: true, message: 'Please select a provider' }
    ],
    scheduledDate: [
      { required: true, message: 'Please select a date' },
      {
        custom: (value: any) => {
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        message: 'Date cannot be in the past'
      }
    ],
    scheduledTime: [
      { required: true, message: 'Please select a time' }
    ],
    address: [
      { required: true, message: 'Please provide an address' }
    ]
  }
};

export const ADDRESS_VALIDATION_SCHEMA = {
  street: [
    { required: true },
    { min: 5, max: 200 },
    { pattern: VALIDATION_PATTERNS.address, message: VALIDATION_MESSAGES.address }
  ],
  area: [
    { required: true },
    { min: 2, max: 100 }
  ],
  city: [
    { required: true },
    { min: 2, max: 50 },
    { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
  ],
  state: [
    { required: true },
    { min: 2, max: 50 },
    { pattern: VALIDATION_PATTERNS.alphabetic, message: VALIDATION_MESSAGES.alphabetic }
  ],
  pincode: [
    { required: true },
    { pattern: VALIDATION_PATTERNS.pincode, message: VALIDATION_MESSAGES.pincode }
  ]
};

// Utility functions
export function validateEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email);
}

export function validatePhone(phone: string): boolean {
  return VALIDATION_PATTERNS.indianPhone.test(phone);
}

export function validatePassword(password: string): { isValid: boolean; strength: 'weak' | 'medium' | 'strong'; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) suggestions.push('Use 12+ characters for better security');

  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else suggestions.push('Include numbers');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else suggestions.push('Include special characters (@$!%*?&)');

  let strength: 'weak' | 'medium' | 'strong';
  if (score < 3) strength = 'weak';
  else if (score < 5) strength = 'medium';
  else strength = 'strong';

  return {
    isValid: score >= 4,
    strength,
    suggestions
  };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/script/gi, '') // Remove script tags
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
}

export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): { isValid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes, allowedExtensions } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension .${extension} is not allowed`
      };
    }
  }

  return { isValid: true };
}

// Specific validation functions for forms
export function validateLoginForm(data: any): ValidationResult {
  return validate(data, USER_VALIDATION_SCHEMAS.login);
}

export function validateRegisterForm(data: any): ValidationResult {
  const schema = {
    ...USER_VALIDATION_SCHEMAS.registration,
    confirmPassword: [
      { required: true },
      { 
        custom: (value: string) => value === data.password,
        message: 'Passwords do not match'
      }
    ]
  };
  return validate(data, schema);
}

export function validateProfileForm(data: any): ValidationResult {
  return validate(data, USER_VALIDATION_SCHEMAS.profile);
}

export function validateProviderApplicationForm(data: any): ValidationResult {
  return validate(data, PROVIDER_VALIDATION_SCHEMAS.application);
}

export function validateBankDetailsForm(data: any): ValidationResult {
  return validate(data, PROVIDER_VALIDATION_SCHEMAS.bankDetails);
}

export function validateBookingForm(data: any): ValidationResult {
  return validate(data, BOOKING_VALIDATION_SCHEMAS.booking);
}

export function validateAddressForm(data: any): ValidationResult {
  return validate(data, ADDRESS_VALIDATION_SCHEMA);
}

// Real-time validation hook
export function useValidation(schema: ValidationSchema) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateFieldValue = React.useCallback((field: string, value: any) => {
    const rules = schema[field];
    if (!rules) return null;

    const ruleArray = Array.isArray(rules) ? rules : [rules];
    for (const rule of ruleArray) {
      const error = validateField(field, value, rule);
      if (error) {
        return error.message;
      }
    }
    return null;
  }, [schema]);

  const setFieldTouched = React.useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldError = React.useCallback((field: string, error: string | null) => {
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error };
      } else {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  const validateAll = React.useCallback((data: Record<string, any>) => {
    const result = validate(data, schema);
    setErrors(result.errorMap);
    return result;
  }, [schema]);

  const clearErrors = React.useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField: validateFieldValue,
    setFieldTouched,
    setFieldError,
    validateAll,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}