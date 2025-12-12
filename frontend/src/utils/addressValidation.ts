/**
 * Address Validation Utility
 * Validates addresses for booking services
 */

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

/**
 * Validate address for booking
 * Checks for minimum required information
 */
export function validateAddress(address: string): AddressValidationResult {
  const errors: string[] = [];
  const trimmedAddress = address.trim();

  // Minimum length check
  if (trimmedAddress.length < 10) {
    errors.push('Address must be at least 10 characters long');
  }

  // Check for required components
  const hasStreet = /\d+\s+[a-zA-Z]/.test(trimmedAddress) || /street|road|lane|avenue|nagar|colony/i.test(trimmedAddress);
  const hasArea = /area|locality|sector|ward|zone/i.test(trimmedAddress);

  // Only show street/area warnings if address is reasonably long
  // Don't be too strict for short addresses (user might still be typing)
  if (trimmedAddress.length > 15 && !hasStreet) {
    errors.push('Address should include street name or house number');
  }

  if (trimmedAddress.length > 30 && !hasArea) {
    errors.push('Address should include area/locality name');
  }

  // Check for invalid patterns
  if (/^[^a-zA-Z0-9]+$/.test(trimmedAddress)) {
    errors.push('Address contains only special characters');
  }

  // Check for suspicious patterns (too many numbers, too few letters)
  const letterCount = (trimmedAddress.match(/[a-zA-Z]/g) || []).length;

  
  if (letterCount < 5 && trimmedAddress.length > 10) {
    errors.push('Address should contain more descriptive text');
  }

  // Check for common invalid inputs
  const invalidPatterns = [
    /^(test|demo|sample|example|asdf|qwerty)/i,
    /^[0-9]+$/,
    /^[a-z]+$/i,
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(trimmedAddress)) {
      errors.push('Address appears to be invalid or incomplete');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  return address
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract address components
 */
export function extractAddressComponents(address: string): {
  street?: string;
  area?: string;
  city?: string;
  pincode?: string;
} {
  const components: any = {};
  const trimmed = address.trim();

  // Extract pincode
  const pincodeMatch = trimmed.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    components.pincode = pincodeMatch[1];
  }

  // Extract city (Nanded)
  if (/nanded/i.test(trimmed)) {
    components.city = 'Nanded';
  }

  // Extract area (look for common area indicators)
  const areaMatch = trimmed.match(/(?:near|at|in|area|locality|sector|ward|zone)\s+([a-zA-Z\s]+)/i);
  if (areaMatch) {
    components.area = areaMatch[1].trim();
  }

  return components;
}

