/**
 * Image URL Utility
 * Normalizes image URLs to work with both local storage and external URLs
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

/**
 * Normalize image URL
 * If URL starts with /uploads, prefix with backend URL
 * Otherwise return as-is (for external URLs like CDN, etc.)
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  // If it's already a full URL (http/https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it starts with /uploads, it's a local file - prefix with backend URL
  if (url.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${url}`;
  }

  // If it starts with /, it might be a relative path - prefix with backend
  if (url.startsWith('/')) {
    return `${BACKEND_BASE_URL}${url}`;
  }

  // Otherwise return as-is (might be a data URL or other format)
  return url;
}

