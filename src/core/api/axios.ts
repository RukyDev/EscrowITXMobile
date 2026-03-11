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

    if (data && data.success === false) {
      throw new Error(data.error?.message || 'Request failed');
    }

    const result = data?.result !== undefined ? data.result : data;

    // Handle nested collections or payloads
    if (result && typeof result === 'object') {
      if (result.payload !== undefined) return result.payload;
      if (result.data !== undefined) return result.data;
    }

    return result;
  },
  async (error) => {
    const status = error?.response?.status;

    // 🔴 TOKEN EXPIRED / UNAUTHORIZED
    if (status === 401) {
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