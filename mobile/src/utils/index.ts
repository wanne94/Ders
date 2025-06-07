// Utility functions for API calls and common operations
import axios, { AxiosResponse } from 'axios';

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// API utility class
export class ApiClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.get(
        `${this.baseURL}${endpoint}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.post(
        `${this.baseURL}${endpoint}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.put(
        `${this.baseURL}${endpoint}`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.delete(
        `${this.baseURL}${endpoint}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

// Storage utilities for React Native (using AsyncStorage would be better, but keeping simple for now)
export const storage = {
  get: (key: string): string | null => {
    // In React Native, you would use AsyncStorage here
    // For now, returning null as placeholder
    return null;
  },
  
  set: (key: string, value: string): void => {
    // In React Native, you would use AsyncStorage here
    // Placeholder implementation
  },
  
  remove: (key: string): void => {
    // In React Native, you would use AsyncStorage here
    // Placeholder implementation
  },
  
  clear: (): void => {
    // In React Native, you would use AsyncStorage here
    // Placeholder implementation
  }
};

// Export image utilities
export * from './imageUtils'; 