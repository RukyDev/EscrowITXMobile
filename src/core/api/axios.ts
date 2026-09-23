import axios from 'axios';
import { API_BASE_URL as ENV_BASE } from '@env';

const API_BASE_URL = ENV_BASE || 'https://web.escrowitx.com/';
import { tokenService } from '../storage/token.service';
import { useAuthStore } from '../../store/auth.store';

import { Alert } from 'react-native';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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

    // Check nested BaseResponse IsSuccessful flag before unwrapping payload
    if (result && typeof result === 'object' && result.isSuccessful === false) {
      const errorMsg = result.message || 'Request failed';
      throw new Error(errorMsg);
    }

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

    // Check for error message from backend. ABP wraps thrown UserFriendlyExceptions as
    // { error: { message: "Login Failed", details: "<specific reason>" } } — details (when
    // present) is the actual human-readable reason and must be preferred over the generic
    // message, otherwise every failed login looks like "Login Failed".
    const backendMessage = errorData?.error?.details || errorData?.error?.message || errorData?.message;
    if (backendMessage) {
      error.message = backendMessage;
    } else if (status === 401) {
      error.message = 'Invalid email or password';
    } else if (!error?.response) {
      error.message = 'Unable to reach the server. Please check your connection and try again.';
    } else {
      // No structured error body from the server (e.g. a raw HTTP-level rejection) —
      // never surface axios's default "Request failed with status code X" to the user.
      error.message = 'Something went wrong. Please try again.';
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