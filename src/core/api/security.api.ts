import { apiClient } from './axios';
import { SECURITY_ENDPOINTS } from './endpoints';

export interface SetUpPinPayload {
    newPin: string;
    confirmPin: string;
}

export interface ChangePinPayload {
    oldPin: string;
    newPin: string;
    confirmPin: string;
}

export interface ResetPinPayload {
    token: string;
    newPin: string;
    confirmPin: string;
}

export const securityApi = {
    async hasPin(): Promise<boolean> {
        return await apiClient.post(SECURITY_ENDPOINTS.hasPin, {});
    },

    async setUpPin(payload: SetUpPinPayload): Promise<void> {
        return await apiClient.post(SECURITY_ENDPOINTS.setUpPin, payload);
    },

    async changePin(payload: ChangePinPayload): Promise<void> {
        return await apiClient.post(SECURITY_ENDPOINTS.changePin, payload);
    },

    async resetPin(payload: ResetPinPayload): Promise<void> {
        return await apiClient.post(SECURITY_ENDPOINTS.resetPin, payload);
    },

    async initiateReset(): Promise<any> {
        return await apiClient.post(SECURITY_ENDPOINTS.initiateReset, {});
    },

    async validatePin(pin: string): Promise<boolean> {
        const res = await apiClient.post(`${SECURITY_ENDPOINTS.validatePin}?pin=${pin}`) as any;
        return res === true;
    },
};
