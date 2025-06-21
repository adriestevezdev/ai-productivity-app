'use client';

import { useAuth } from '@clerk/nextjs';
import axios, { AxiosInstance } from 'axios';
import { useEffect, useRef } from 'react';

export function useApi() {
  const { getToken } = useAuth();
  const apiRef = useRef<AxiosInstance | null>(null);

  useEffect(() => {
    // Create axios instance with interceptor
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    api.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });

    // Add response interceptor
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = '/sign-in';
        }
        return Promise.reject(error);
      }
    );

    apiRef.current = api;
  }, [getToken]);

  return apiRef.current || axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  });
}