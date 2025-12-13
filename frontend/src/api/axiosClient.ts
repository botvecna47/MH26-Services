/**
 * Axios Client Configuration
 * Base URL and interceptors for JWT token management
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || '/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Attach JWT token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token means user is not authenticated
          // This is expected for public routes, so suppress console error
          const silentError = new Error('Unauthorized');
          (silentError as any).response = error.response;
          (silentError as any).config = error.config;
          (silentError as any).isAxiosError = true;
          (silentError as any).toJSON = () => ({ message: 'Unauthorized' });
          return Promise.reject(silentError);
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Don't redirect here - let the component handle it
        // This prevents infinite redirect loops
        return Promise.reject(refreshError);
      }
    }

    // Suppress console errors for expected 401s (unauthenticated requests)
    if (error.response?.status === 401) {
      // Check if this is an expected 401 (no token in storage)
      const hasToken = localStorage.getItem('accessToken');
      if (!hasToken) {
        // Expected 401 - user is not authenticated, suppress console error
        // The error will still be rejected for components to handle
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

