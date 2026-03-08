import { Platform } from 'react-native';
import { apiClient } from './axios';
import { ESCROW_ENDPOINTS, DISPUTE_ENDPOINTS } from './endpoints';

export enum TransStatus {
    Pending = 1,
    In_Escrow = 2,
    OnHold = 3,
    Completed = 4,
    Cancled = 5,
    SellerDebited = 6,
    Part_In_Escrow = 7,
    BuyerDebited = 8,
    BuyerPinExpired = 9,
    SellerPinExpired = 10,
    Disputed = 11
}

export interface WalletDto {
    id: number;
    currency: string;
    availableBalance: number;
    ledgerBalance: number;
    escrowBalance: number;
    accountNumber: string;
    accountName: string;
    bankName: string;
}

export interface GetEscrowDto {
    id: number;
    adId: number;
    buyerName: string;
    sellerName: string;
    adsCurrency: string;
    volume: number;
    volumeSold: number;
    rate: number;
    amountEquivalent: number;
    transactionStatus: TransStatus;
    transactionDate: string;
    excrowType: number; // 0 = Buy, 1 = Sell
    wallet: WalletDto;
    rating: number;
}

export interface EscrowBuySellPayload {
    adID: number;
    volumToBuy: number; // note: API uses 'volumToBuy' (typo in API)
    rate: number;
    accountId: number;
}

export interface EscrowFeeResult {
    escrowFee: number;
    nairaEquivalent: number;
    totalPayable: number;
}

export interface EscrowCreatedResult {
    escrowReference: string;
    amountLocked: number;
    gbpAmount: number;
    status: string;
}

export interface ReleaseResult {
    id: number;
    code: number;
    isSuccssful: boolean;
    message: string;
}

export const escrowApi = {
    async buyEscrow(payload: EscrowBuySellPayload): Promise<EscrowCreatedResult> {
        return await apiClient.post(ESCROW_ENDPOINTS.buy, payload);
    },

    async sellEscrow(payload: EscrowBuySellPayload): Promise<EscrowCreatedResult> {
        return await apiClient.post(ESCROW_ENDPOINTS.sell, payload);
    },

    async calculateFee(volumeToBuy: number, userRate: number): Promise<EscrowFeeResult> {
        return await apiClient.post(
            `${ESCROW_ENDPOINTS.calculateFee}?volumeToBuy=${volumeToBuy}&userRate=${userRate}`,
        );
    },

    async getByUser(): Promise<GetEscrowDto[]> {
        return await apiClient.get(ESCROW_ENDPOINTS.getByUser);
    },

    async getHistory(): Promise<any[]> {
        return await apiClient.get(ESCROW_ENDPOINTS.getHistory);
    },

    async release(escrowTransactionId: number, securitycode: number): Promise<ReleaseResult> {
        return await apiClient.post(ESCROW_ENDPOINTS.release, {
            escrowTransactionId,
            securitycode
        });
    },

    async createDispute(escrowTransactionId: number, reason: string): Promise<any> {
        return await apiClient.post(DISPUTE_ENDPOINTS.create, {
            escrowTransactionId,
            reason
        });
    },

    async uploadDisputeDoc(disputeId: number, fileUri: string, fileName: string, fileType: string): Promise<any> {
        const formData = new FormData();
        // ABP usually expects a specifically named field for files, common is 'file' or 'files'
        // Given the curl: -H 'Content-Type: multipart/form-data'
        formData.append('File', {
            uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
            type: fileType || 'image/jpeg',
            name: fileName || 'evidence.jpg',
        } as any);

        return await apiClient.post(`${DISPUTE_ENDPOINTS.upload}?DisputeID=${disputeId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};
