/**
 * Image URL Utility
 * Normalizes image URLs to work with both local storage and external URLs
 */

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

/**
 * Normalize image URL
 * If URL starts with /uploads, prefix with backend URL
 * Handles old S3 URLs by converting them to local paths if possible
 * Otherwise return as-is (for external URLs like S3, CDN, etc.)
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '';
  }

  // If it's already a full URL (http/https), check if it's a broken S3 URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Check if it's an old S3 URL that might not work
    // If S3 is not configured, these URLs will fail
    // For now, return as-is and let the image component handle the error
    // In the future, we could extract the key and convert to local path
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

