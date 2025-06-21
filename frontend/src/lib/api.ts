import { useAuth } from '@clerk/nextjs';

export interface ApiConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(config: ApiConfig = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers = { ...this.defaultHeaders };
    
    if (this.getToken) {
      try {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      
      const error: ApiError = new Error(errorData.detail || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      
      if (response.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      
      throw error;
    }
    
    return response.json();
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const headers = await this.getHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });
    
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'DELETE',
      headers,
    });
    
    return this.handleResponse<T>(response);
  }
}

// Hook para usar el API client con autenticación de Clerk
export function useApiClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  
  const client = new ApiClient();
  
  if (isLoaded && isSignedIn) {
    client.setTokenGetter(getToken);
  }
  
  return client;
}