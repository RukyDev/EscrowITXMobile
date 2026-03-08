import { API_AUTH_PATH as ENV_AUTH, API_APP_PATH as ENV_APP } from '@env';

const API_AUTH_PATH = ENV_AUTH || 'api/TokenAuth';
const API_APP_PATH = ENV_APP || 'api/services/app';

export const AUTH_ENDPOINTS = {
  login: `${API_AUTH_PATH}/Authenticate`,
};

export const SESSION_ENDPOINTS = {
  currentUser: `${API_APP_PATH}/Session/GetCurrentLoginInformations`,
  getExternalRates: `${API_APP_PATH}/DashboardServices/GetExternalRates`,
};

export const ACCOUNT_ENDPOINTS = {
  register: `${API_APP_PATH}/Account/Register`,
  forgotPassword: `${API_APP_PATH}/Account/SendPasswordResetCode`,
  verifyEmailCode: `${API_APP_PATH}/Account/VerifyEmailCode`,
  resendConfirmation: `${API_APP_PATH}/Account/ResendConfirmationCode`,
  resetPassword: `${API_APP_PATH}/Account/ResetPassword`,
};

export const ADS_ENDPOINTS = {
  getAll: `${API_APP_PATH}/AdsService/GetAllAdsForEscrow`,
  createBuy: `${API_APP_PATH}/AdsService/CreateBuyAds`,
  createSell: `${API_APP_PATH}/AdsService/CreateSellAds`,
  update: `${API_APP_PATH}/AdsService/UpdateAds`,
  delete: `${API_APP_PATH}/AdsService/HardDeleteAds`,
  getAllPersonalBuy: `${API_APP_PATH}/AdsService/GetAllPerseonalBuyAds`,
  getAllPersonalSell: `${API_APP_PATH}/AdsService/GetAllPersonalSellAds`,
};

export const ESCROW_ENDPOINTS = {
  buy: `${API_APP_PATH}/EscrowTransactionService/Buy`,
  sell: `${API_APP_PATH}/EscrowTransactionService/Sell`,
  calculateFee: `${API_APP_PATH}/EscrowTransactionService/CalculateBuyEscrowFee`,
  getByUser: `${API_APP_PATH}/EscrowTransactionService/GetEscrowByUserID`,
  release: `${API_APP_PATH}/EscrowTransactionService/ReleaseEscrowTransaction`,
  getHistory: `${API_APP_PATH}/EscrowTransactionService/GetEscrowTransaction`,
};

export const DISPUTE_ENDPOINTS = {
  create: `${API_APP_PATH}/Dispute/CreateDispute`,
  upload: `${API_APP_PATH}/Dispute/UploadDocuments`,
};

export const WALLET_ENDPOINTS = {
  deposit: `${API_APP_PATH}/WalletService/DepositFunds`,
  withdraw: `${API_APP_PATH}/WalletService/Withdraw`,
  validateBankAccount: `${API_APP_PATH}/WalletService/ValidateBankAccountWithPaga`,
  getBalance: `${API_APP_PATH}/WalletService/GetWalletBalance`,
  getBanks: `${API_APP_PATH}/WalletService/GetBanks`,
  addBeneficiary: `${API_APP_PATH}/WalletService/AddBeneficiaryWallet`,
  getBeneficiaryWallets: `${API_APP_PATH}/WalletService/GetBeneficiaryWalletByUserID`,
  getActivityHistory: `${API_APP_PATH}/WalletService/GetWalletActivityHistory`,
};

export const CURRENCY_ENDPOINTS = {
  getCurrencies: `${API_APP_PATH}/CurrencyService/GetCurrency`,
};

export const SECURITY_ENDPOINTS = {
  validatePin: `${API_APP_PATH}/SecurityPin/ValidatePin`,
  hasPin: `${API_APP_PATH}/SecurityPin/HasPin`,
  setUpPin: `${API_APP_PATH}/SecurityPin/SetUpPin`,
  changePin: `${API_APP_PATH}/SecurityPin/ChangePin`,
  resetPin: `${API_APP_PATH}/SecurityPin/ResetPin`,
  initiateReset: `${API_APP_PATH}/SecurityPin/InitiatePinReset`,
};

export const USER_ENDPOINTS = {
  editInfo: `${API_APP_PATH}/User/EditInfo`,
  changePassword: `${API_APP_PATH}/User/ChangePassword`,
};

