import { apiClient } from './axios';
import { WALLET_ENDPOINTS, SECURITY_ENDPOINTS } from './endpoints';

export interface DepositResult {
    accountNumber: string;
    accountName: string;
    bankName: string;
    fullName: string;
}

export interface WalletBalance {
    userId: number;
    currency: string;
    availableBalance: number;
    ledgerBalance: number;
    escrowBalance: number;
    accountNumber: string;
    accountName: string | null;
    bankName: string | null;
    id: number;
}

export interface Bank {
    name: string;
    sortCode: string;
    uuid: string;
}

export interface BankAccountValidationResult {
    accountName: string;
    accountNumber: string;
    bankName: string;
    payload?: {
        accountName: string | null;
        isValid: boolean;
    };
}

export interface AddBeneficiaryPayload {
    accountName: string;
    accountNumber: string;
    bankName: string;
    sortCode?: string;
    iban?: string;
}

export interface WalletActivity {
    walletId: number;
    currency: string;
    amount: number;
    bankCharges: number;
    total: number;
    status: string;
    transactionType: string;
    transactionDate: string;
}

export interface WithdrawPayload {
    bankUuid: string;
    accountNumber: string;
    amount: number;
    accountName: string;
    narration?: string;
    pin?: string;
}

export const walletApi = {
    async getBalance(): Promise<WalletBalance[]> {
        return await apiClient.get(WALLET_ENDPOINTS.getBalance);
    },

    async deposit(): Promise<DepositResult> {
        return await apiClient.post(WALLET_ENDPOINTS.deposit, {});
    },

    async getActivityHistory(): Promise<WalletActivity[]> {
        return await apiClient.get(WALLET_ENDPOINTS.getActivityHistory);
    },

    async getBanks(): Promise<Bank[]> {
        return await apiClient.get(WALLET_ENDPOINTS.getBanks);
    },

    async validateAccount(bankUuid: string, accountNumber: string, amount: number): Promise<BankAccountValidationResult> {
        return await apiClient.post(`${WALLET_ENDPOINTS.validateBankAccount}?bankuuid=${bankUuid}&accountNumber=${accountNumber}&amount=${amount}`);
    },

    async addBeneficiary(payload: AddBeneficiaryPayload): Promise<void> {
        return await apiClient.post(WALLET_ENDPOINTS.addBeneficiary, payload);
    },

    async withdraw(payload: WithdrawPayload): Promise<any> {
        return await apiClient.post(WALLET_ENDPOINTS.withdraw, payload);
    },

    async getBeneficiaryWallets(): Promise<WalletBalance[]> {
        return await apiClient.get(WALLET_ENDPOINTS.getBeneficiaryWallets);
    },

    async validatePin(pin: string): Promise<boolean> {
        // Interceptor already unwraps the response
        const res = await apiClient.post(`${SECURITY_ENDPOINTS.validatePin}?pin=${pin}`) as any;
        return res === true;
    },
};
