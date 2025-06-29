"use client";

import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '@/lib/api-client';

export interface UserContext {
  work_description: string;
  short_term_focus: string[];
  long_term_goals: string[];
  other_context: string[];
}

const STORAGE_KEY = 'user_context';

export function usePersistedUserContext() {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  // Load from localStorage immediately
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('[UserContext] Loading from localStorage:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[UserContext] Parsed from localStorage:', parsed);
        setUserContext(parsed);
      }
    } catch (err) {
      console.warn('Failed to load user context from localStorage:', err);
    }
  }, []);

  // Fetch from API and sync with localStorage
  const fetchUserContext = useCallback(async () => {
    console.log('[UserContext] Starting API fetch...');
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.get('/api/user-context');
      console.log('[UserContext] API response:', data);
      
      if (data) {
        console.log('[UserContext] Setting context from API:', data);
        setUserContext(data);
        
        // Persist to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          console.log('[UserContext] Saved to localStorage successfully');
        } catch (err) {
          console.warn('Failed to save user context to localStorage:', err);
        }
      } else {
        // No user context found - this is expected for new users
        console.log('[UserContext] No data returned from API, clearing context');
        setUserContext(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err: any) {
      console.log('[UserContext] API error:', err);
      // Handle 404 specifically - user context doesn't exist yet
      if (err?.status === 404) {
        console.log('[UserContext] 404 error - user context does not exist yet');
        setUserContext(null);
        localStorage.removeItem(STORAGE_KEY);
        setIsLoading(false);
        return;
      }
      
      console.error('Error fetching user context:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user context');
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  // Save user context to both API and localStorage
  const saveUserContext = useCallback(async (context: UserContext) => {
    setError(null);
    
    try {
      const data = await apiClient.post('/api/user-context', context);
      
      if (data) {
        setUserContext(data);
        
        // Persist to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
          console.warn('Failed to save user context to localStorage:', err);
        }
        
        return data;
      } else {
        throw new Error('Failed to save user context');
      }
    } catch (err) {
      console.error('Error saving user context:', err);
      setError(err instanceof Error ? err.message : 'Failed to save user context');
      throw err;
    }
  }, [apiClient]);

  // Initialize - fetch from API on mount
  useEffect(() => {
    fetchUserContext();
  }, [fetchUserContext]);

  return {
    userContext,
    isLoading,
    error,
    saveUserContext,
    refetchUserContext: fetchUserContext,
  };
}