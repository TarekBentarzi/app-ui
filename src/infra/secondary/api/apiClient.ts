import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PRODUCTION_API_URL = 'https://api-alpha-opal.vercel.app';

const getApiBaseUrl = () => {
  // Priority 1: Use env variable if explicitly set and not localhost
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')) {
    console.log(`[API] Using EXPO_PUBLIC_API_URL: ${process.env.EXPO_PUBLIC_API_URL}`);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priority 2: In production build (APK), use production URL
  // __DEV__ is false in release builds, true in development
  if (!__DEV__) {
    console.log(`[API] Production mode detected, using: ${PRODUCTION_API_URL}`);
    return PRODUCTION_API_URL;
  }

  // Priority 3: Development mode - detect environment
  console.log('[API] Development mode detected');

  // Web environment check
  if (Platform.OS === 'web') {
    console.log('[API] Web platform, using localhost:3000');
    return 'http://localhost:3000';
  }

  // Mobile development: Extract IP from Expo's hostUri
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    console.log(`[API] Mobile dev - detected IP from hostUri: ${host}`);
    return `http://${host}:3000`;
  }
  
  // Fallback for dev mode
  console.warn('[API] Could not detect IP from hostUri, using fallback IP');
  return 'http://192.168.1.127:3000';
};

let authToken: string | null = null;

// Use a getter for API_BASE_URL to ensure it's always fresh
export const apiClient = {
  getBaseUrl: () => {
    const url = getApiBaseUrl();
    return url;
  },

  setToken: (token: string | null) => {
    authToken = token;
  },

  getHeaders: () => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  },

  get: async (endpoint: string) => {
    const url = `${apiClient.getBaseUrl()}${endpoint}`;
    console.log(`[API] GET ${url}`);
    try {
      const response = await fetch(url, {
        headers: apiClient.getHeaders(),
      });
      console.log(`[API] GET ${url} - Status: ${response.status}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`[API] GET ${url} - Error:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    const url = `${apiClient.getBaseUrl()}${endpoint}`;
    console.log(`[API] POST ${url}`, data);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: apiClient.getHeaders(),
        body: JSON.stringify(data),
      });
      console.log(`[API] POST ${url} - Status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] POST ${url} - Error body:`, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`[API] POST ${url} - Error:`, error);
      throw error;
    }
  },

  patch: async (endpoint: string, data: any) => {
    const url = `${apiClient.getBaseUrl()}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: apiClient.getHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`[API] PATCH ${url} - Error:`, error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    const url = `${apiClient.getBaseUrl()}${endpoint}`;
    console.log(`[API] PUT ${url}`, data);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: apiClient.getHeaders(),
        body: JSON.stringify(data),
      });
      console.log(`[API] PUT ${url} - Status: ${response.status}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    } catch (error) {
      console.error(`[API] PUT ${url} - Error:`, error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    const url = `${apiClient.getBaseUrl()}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: apiClient.getHeaders(),
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
    } catch (error) {
      console.error(`[API] DELETE ${url} - Error:`, error);
      throw error;
    }
  },
};
