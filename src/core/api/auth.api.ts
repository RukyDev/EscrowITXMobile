import { apiClient } from './axios';
import { AUTH_ENDPOINTS, SESSION_ENDPOINTS, ACCOUNT_ENDPOINTS } from './endpoints';

interface LoginRequest {
  userNameOrEmailAddress: string;
  password: string;
  rememberClient: boolean;
}

interface LoginResponse {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  userId: number;
}

export interface SessionUser {
  id: number;
  name: string;
  surname: string;
  userName: string;
  emailAddress: string;
  fullName?: string;
  nationality?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: number;
  occupation?: number;
  residentialAddress?: string;
  isVerified?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  middleName?: string;
  surname: string;
  userName: string;
  emailAddress: string;
  password: string;
  phoneNumber: string;
  captchaResponse?: string;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    return await apiClient.post(AUTH_ENDPOINTS.login, payload);
  },

  async getSession() {
    const response = await apiClient.get(SESSION_ENDPOINTS.currentUser);
    return response;
  },

  async register(payload: RegisterRequest): Promise<void> {
    return await apiClient.post(ACCOUNT_ENDPOINTS.register, payload);
  },

  async forgotPassword(emailAddress: string): Promise<void> {
    return await apiClient.post(ACCOUNT_ENDPOINTS.forgotPassword, { emailAddress });
  },
};
