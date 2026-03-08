import axios from 'axios';
import { API_BASE_URL as ENV_BASE } from '@env';

const API_BASE_URL = ENV_BASE || 'https://escrowitx.runasp.net/';
import { tokenService } from '../storage/token.service';
import { useAuthStore } from '../../store/auth.store';

import { Alert } from 'react-native';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API_BASE_URL initialized as:', API_BASE_URL);
// If API_BASE_URL is undefined in standalone, this helps find out
if (!API_BASE_URL && __DEV__ === false) {
  Alert.alert('Configuration Error', 'API_BASE_URL is not defined in this build.');
}

// Attach JWT
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenService.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap ABP response
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;
    const url = response.config.url;
    console.log(`[API ${response.config.method?.toUpperCase()}] ${url}:`, data);

    if (data && data.success === false) {
      throw new Error(data.error?.message || 'Request failed');
    }

    const result = data?.result !== undefined ? data.result : data;

    // Handle nested collections: if result is { code, message, data: [] }
    if (result && typeof result === 'object' && result.data !== undefined) {
      console.log(`[Interceptor] Found nested data in ${url}:`, result.data);
      return result.data;
    }

    return result;
  },
  async (error) => {
    const status = error?.response?.status;

    // 🔴 TOKEN EXPIRED / UNAUTHORIZED
    if (status === 401) {
      console.log('Unauthorized error detected, clearing token and logging out');
      await tokenService.clear();

      const logout = useAuthStore.getState().logout;
      logout();
    }

    if (__DEV__ === false && status !== 401) {
      Alert.alert('Connection Error', `Status: ${status}\nMessage: ${error.message}\nURL: ${error.config?.url}`);
    }
    return Promise.reject(error);
  }
);