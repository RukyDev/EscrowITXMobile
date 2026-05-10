import { apiClient } from './axios';
import { DOCUMENT_ENDPOINTS, USER_ENDPOINTS, KYC_ENDPOINTS } from './endpoints';

export enum DocumentUploadStatus {
    None = 0,
    Uploaded = 1,
    AllApproved = 2,
    AllDeclined = 3,
    GovernmentIDDeclined = 4,
    POADeclined = 5,
    SelfieDeclined = 6,
    underReview = 7,
    NINFaild = 8,
    BVNFaild = 9,
}

export interface KYCPayload {
    governmentId?: { uri: string; name: string; type: string };
    selfie?: { uri: string; name: string; type: string };
    proofOfAddress?: { uri: string; name: string; type: string };
    bvn: string;
    nin: string;
    nationality: string;
    dateOfBirth: string; // ISO string
    address: string;
    gender: number;
    occupation: number;
}

export interface UserProfilePayload {
    nationality: string;
    dateOfBirth: string; // ISO string
    residentialAddress: string;
    gender: number;
    occupation: number;
}

export const documentApi = {
    async getStatus(): Promise<DocumentUploadStatus> {
        const res = await apiClient.get(USER_ENDPOINTS.getKYCStatus);
        return res as any as DocumentUploadStatus;
    },

    /** Save personal info (Tab 1) to the backend before launching Prembly */
    async updateUserProfile(payload: UserProfilePayload): Promise<void> {
        return await apiClient.post(USER_ENDPOINTS.updateUserProfile, payload);
    },

    /** Call Prembly to start a KYC session; returns the session payload */
    async initiateKycSession(): Promise<{ session_id: string }> {
        // The axios interceptor already throws on failure and returns data.payload directly
        const res: any = await apiClient.post(KYC_ENDPOINTS.initiateKycSession, {});
        return res;
    },

    /** Load the current Prembly KYC status for the user */
    async getUserKycStatus(): Promise<'Pending' | 'Verified' | 'Rejected' | null> {
        // Interceptor already unwraps data.payload — res IS the status value
        const res: any = await apiClient.get(USER_ENDPOINTS.getUserKycStatus);
        return res ?? null;
    },

    async uploadKYC(payload: KYCPayload): Promise<void> {
        const formData = new FormData();

        if (payload.governmentId) {
            formData.append('governmentId', {
                uri: payload.governmentId.uri,
                name: payload.governmentId.name,
                type: payload.governmentId.type,
            } as any);
        }

        if (payload.selfie) {
            formData.append('selfie', {
                uri: payload.selfie.uri,
                name: payload.selfie.name,
                type: payload.selfie.type,
            } as any);
        }

        if (payload.proofOfAddress) {
            formData.append('proofOfAddress', {
                uri: payload.proofOfAddress.uri,
                name: payload.proofOfAddress.name,
                type: payload.proofOfAddress.type,
            } as any);
        }

        formData.append('bvn', payload.bvn);
        formData.append('nin', payload.nin);
        formData.append('UserProfile.Nationality', payload.nationality);
        formData.append('UserProfile.DateOfBirth', payload.dateOfBirth);
        formData.append('UserProfile.ResidentailAddress', payload.address);
        formData.append('UserProfile.Gender', payload.gender.toString());
        formData.append('UserProfile.Occupation', payload.occupation.toString());

        return await apiClient.post(DOCUMENT_ENDPOINTS.uploadKYC, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
