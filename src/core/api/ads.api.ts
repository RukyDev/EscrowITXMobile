import { apiClient } from './axios';
import { ADS_ENDPOINTS, ESCROW_ENDPOINTS } from './endpoints';

export interface Ad {
    adID: number;           // Backend returns adID
    id: number;             // For compatibility
    userName: string;       // Backend returns userName
    traderName: string;     // For compatibility
    traderInitials: string;
    traderAvatar?: string;
    rating: number;
    tradeCount: number;
    adType: string;         // Backend returns "Buy" or "Sell"
    rate: number;
    volume: number;
    minLimit: number;       // Backend returns minLimit
    maxAmount: number;
    tradeTerms: string;
    allowPartSales: boolean;
    adsStatus: string;      // Backend returns "open" etc
    status: number;         // For compatibility
    currencyId: number;
    accountID: number;
    isVerified?: boolean;
    paymentMethod?: string;
    totalCompletedEscrowCount: number;
    minAmount: number;      // Compatibility
    currency?: string;
}

export interface Currency {
    currencyName: string;
    currencyCode: string;
    id: number;
}

export interface ExternalRate {
    currencyId: number;
    currencyName: string;
    rate: number;
    comapany: string;
    transType: number; // 0 = Buy, 1 = Sell
}

export interface CalculateFeeResult {
    tradersProfit: number;
    escrowItxProfit: number;
}

export interface CreateAdPayload {
    accountID: number;
    currencyId: number;
    rate: number;
    volume: number;
    tradeTerms: string;
    allowPartSales: boolean;
}

export interface UpdateAdPayload {
    id: number;
    rate: number;
    volume: number;
    tradeTerms: string;
    allowPartSales: boolean;
}

export const adsApi = {
    async getAllAds(): Promise<Ad[]> {
        const data = await apiClient.get(ADS_ENDPOINTS.getAll) as any;
        // Map backend fields to frontend expectations if needed, 
        // but it's safer to just provide what backend gives and update the UI.
        return (data || []).map((item: any) => ({
            ...item,
            id: item.adID,
            traderName: item.userName,
            traderInitials: (item.userName || 'TR').slice(0, 2).toUpperCase(),
            tradeCount: item.totalCompletedEscrowCount || 0,
            rating: 100, // Default to 100% for now
            status: item.adsStatus?.toLowerCase().trim() === 'open' ? 1 : 0,
            minAmount: item.minLimit || 0
        }));
    },

    async getCurrencies(): Promise<Currency[]> {
        return await apiClient.get('/api/services/app/CurrencyService/GetCurrency');
    },

    async getExternalRates(): Promise<ExternalRate[]> {
        return await apiClient.get('/api/services/app/DashboardServices/GetExternalRates');
    },

    async calculateFee(volume: number, rate: number): Promise<CalculateFeeResult> {
        return await apiClient.post(`${ESCROW_ENDPOINTS.calculateFee}?volumetobuy=${volume}&userrate=${rate}`, {});
    },

    async createBuyAd(payload: CreateAdPayload): Promise<void> {
        return await apiClient.post(ADS_ENDPOINTS.createBuy, payload);
    },

    async createSellAd(payload: CreateAdPayload): Promise<void> {
        return await apiClient.post(ADS_ENDPOINTS.createSell, payload);
    },

    async updateAd(payload: UpdateAdPayload): Promise<void> {
        return await apiClient.put(ADS_ENDPOINTS.update, payload);
    },

    async deleteAd(adId: number): Promise<void> {
        return await apiClient.post(`${ADS_ENDPOINTS.delete}?adId=${adId}`);
    },
    async getAllPersonalBuyAds(): Promise<Ad[]> {
        const data = await apiClient.get(ADS_ENDPOINTS.getAllPersonalBuy) as any;
        return (data || []).map((item: any) => ({
            ...item,
            id: item.adID,
            traderName: item.userName,
            traderInitials: (item.userName || 'TR').slice(0, 2).toUpperCase(),
            tradeCount: item.totalCompletedEscrowCount || 0,
            rating: 100,
            status: item.adsStatus?.toLowerCase().trim() === 'open' ? 1 : 0,
            minAmount: item.minLimit || 0
        }));
    },
    async getAllPersonalSellAds(): Promise<Ad[]> {
        const data = await apiClient.get(ADS_ENDPOINTS.getAllPersonalSell) as any;
        return (data || []).map((item: any) => ({
            ...item,
            id: item.adID,
            traderName: item.userName,
            traderInitials: (item.userName || 'TR').slice(0, 2).toUpperCase(),
            tradeCount: item.totalCompletedEscrowCount || 0,
            rating: 100,
            status: item.adsStatus?.toLowerCase().trim() === 'open' ? 1 : 0,
            minAmount: item.minLimit || 0
        }));
    },
};
