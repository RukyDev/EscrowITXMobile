import axios from 'axios';
import { API_BASE_URL as ENV_BASE } from '@env';

const API_BASE_URL = ENV_BASE || 'https://web.escrowitx.com/';
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
// if (!API_BASE_URL && __DEV__ === false) {
//   Alert.alert('Configuration Error', 'API_BASE_URL is not defined in this build.');
// }

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

    // Check for success flags (old ABP 'success' or new 'isSuccessful')
    if (data && (data.success === false || data.isSuccessful === false)) {
      const errorMsg = data.message || data.error?.message || 'Request failed';
      throw new Error(errorMsg);
    }

    // New structure uses 'payload' for the data
    if (data && data.payload !== undefined) {
      return data.payload;
    }

    // Legacy ABP uses 'result'
    const result = data?.result !== undefined ? data.result : data;

    // If result contains a payload, use it (new BaseResponse pattern)
    if (result && typeof result === 'object' && result.payload !== undefined) {
      return result.payload;
    }

    // Handle generic 'data' field used by some APIs
    if (result && typeof result === 'object' && result.data !== undefined) {
      return result.data;
    }

    return result;
  },
  async (error) => {
    const status = error?.response?.status;
    const errorData = error?.response?.data;

    // Check for error message from backend
    if (errorData && (errorData.message || errorData.error?.message)) {
      error.message = errorData.message || errorData.error?.message;
    } else if (status === 401) {
      error.message = 'Invalid email or password';
    }

    // 🔴 TOKEN EXPIRED / UNAUTHORIZED
    if (status === 401) {
      const isLoginRequest = error.config?.url?.includes('Authenticate');
      if (!isLoginRequest) {
        await tokenService.clear();
        const logout = useAuthStore.getState().logout;
        logout();
      }
    }
    return Promise.reject(error);
  }
);