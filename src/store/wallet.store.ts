import { create } from 'zustand';
import { walletApi, WalletBalance, Bank } from '../core/api/wallet.api';

interface WalletState {
    balance: WalletBalance[];
    isLoading: boolean;
    fetchBalance: () => Promise<void>;
    fetchBanks: () => Promise<void>;
    fetchActivities: () => Promise<void>;
    banks: Bank[];
    activities: any[];
}

export const useWalletStore = create<WalletState>((set) => ({
    balance: [],
    banks: [],
    activities: [],
    isLoading: false,

    fetchBalance: async () => {
        set({ isLoading: true });
        try {
            const result = await walletApi.getBalance();
            set({ balance: Array.isArray(result) ? result : [], isLoading: false });
        } catch (error) {
            set({ balance: [], isLoading: false });
        }
    },

    fetchBanks: async () => {
        try {
            const res = await walletApi.getBanks();

            let banksList = [];
            if (Array.isArray(res)) {
                banksList = res;
            } else if (res && typeof res === 'object') {
                // Try to find the first array in the object (e.g. res.data, res.banks, res.items)
                const firstArray = Object.values(res).find(v => Array.isArray(v));
                if (firstArray) {
                    banksList = firstArray as any[];
                } else {
                    // Try to see if the object itself is a map of banks
                    banksList = Object.values(res).filter(v =>
                        typeof v === 'object' && v !== null && ('uuid' in v || 'name' in (v as any))
                    );
                }
            }

            set({ banks: banksList });
        } catch (error) {
        }
    },

    fetchActivities: async () => {
        try {
            const activities = await walletApi.getActivityHistory();
            set({ activities: Array.isArray(activities) ? activities : [] });
        } catch (error) {
        }
    },
}));
