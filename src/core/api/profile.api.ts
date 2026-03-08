import { apiClient } from './axios';
import { USER_ENDPOINTS } from './endpoints';

export interface EditProfilePayload {
    id: number;
    userName: string;
    name: string;
    surname: string;
    emailAddress: string;
    isActive: boolean;
    fullName: string;
    lastLoginTime: string;
    creationTime: string;
    roleNames: string[];
    nationality: string;
    dateOfBirth: string;
    residentialAddress: string;
    phoneNumber: string;
    status: string;
    isVerified: boolean;
    gender: number;
    occupation: number;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export const profileApi = {
    async updateProfile(payload: Partial<EditProfilePayload>): Promise<any> {
        return await apiClient.post(USER_ENDPOINTS.editInfo, payload);
    },

    async changePassword(payload: ChangePasswordPayload): Promise<any> {
        const resp: any = await apiClient.post(USER_ENDPOINTS.changePassword, payload);
        if (resp && resp.statusCode === 400) {
            throw new Error(resp.message || 'Failed to change password');
        }
        return resp;
    }
};
