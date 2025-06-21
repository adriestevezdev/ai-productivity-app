import axios from 'axios';
import { auth } from '@clerk/nextjs/server';

// For client-side requests
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests on client side
if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use(async (config) => {
    try {
      // Get token from Clerk on client side
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  });
}

// For server-side requests (in Server Components or API routes)
export async function getAuthenticatedApiClient() {
  const { getToken } = auth();
  const token = await getToken();
  
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to sign-in if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);