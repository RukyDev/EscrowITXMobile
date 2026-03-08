export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    OTP: { email: string };
    ForgotPassword: undefined;
    ForgotPasswordSent: undefined;
};

export type HomeStackParamList = {
    Dashboard: undefined;
    Notifications: undefined;
};

export type MarketStackParamList = {
    Marketplace: undefined;
    PersonalAds: undefined;
    BuyFromTrader: { adId: number; traderName: string; rate: number; minGbp: number; maxGbp: number; paymentMethod: string };
    SellToTrader: { adId: number; traderName: string; rate: number; minGbp: number; maxGbp: number };
    CreateBuyAd: undefined;
    CreateSellAd: undefined;
    EditAd: { ad: any };
    AdSuccess: { type: 'buy' | 'sell' };
    EscrowCreated: { orderId: string; amountLocked: number; gbpAmount: number };
};

export type EscrowStackParamList = {
    EscrowList: undefined;
    EscrowDetail: { escrowId: number };
    PinConfirm: { escrowId: number; gbpAmount: number; counterparty: string };
    EscrowSuccess: { gbpAmount: number; amountReleased: number; escrowRef: string };
    Dispute: { escrowId: number; escrowRef: string };
    DisputeSubmitted: { disputeRef: string; escrowRef: string };
};

export type WalletStackParamList = {
    WalletHome: undefined;
    Deposit: undefined;
    Withdraw: undefined;
    WithdrawPin: { amount: number; bankLabel: string };
    WithdrawSuccess: { amount: number };
};

export type ProfileStackParamList = {
    ProfileHome: undefined;
    EditProfile: undefined;
    Security: undefined;
    ChangePassword: undefined;
};
