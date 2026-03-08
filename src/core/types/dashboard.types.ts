export interface WalletSummary {
  nairaBalance: number
  changePercent: number
}

export interface AdsSummary {
  totalActive: number
  buyAds: number
  sellAds: number
}

export interface EscrowSummary {
  inEscrowCount: number
  pendingCount: number
}

export interface ExchangeVolumeItem {
  monthLabel: string
  buyVolume: number
  sellVolume: number
  buyVolumePercent: number
  sellVolumePercent: number
}

export interface RecentTransaction {
  id: number
  type: 'Buy' | 'Sell'
  amountGbp: number
  amountNgn: number
  counterparty: string
  status: string
  transactionDate: string
  timeAgo: string
}

export interface DashboardResponse {
  userFirstName: string
  walletSummary: WalletSummary
  adsSummary: AdsSummary
  escrowSummary: EscrowSummary
  exchangeVolume: ExchangeVolumeItem[]
  recentTransactions: RecentTransaction[]
}

// export interface ExchangeVolume {
//   monthLabel: string;
//   buyVolume: number;
//   sellVolume: number;
//   buyVolumePercent: number;
//   sellVolumePercent: number;
// }

// export interface RecentTransaction {
//   id: number;
//   type: string;
//   amountGbp: number;
//   amountNgn: number;
//   counterparty: string;
//   status: string;
//   transactionDate: string;
//   timeAgo: string;
// }

// export interface DashboardData {
//   userFirstName: string;
//   walletSummary: {
//     nairaBalance: number;
//     changePercent: number;
//   };
//   adsSummary: {
//     totalActive: number;
//     buyAds: number;
//     sellAds: number;
//   };
//   escrowSummary: {
//     inEscrowCount: number;
//     pendingCount: number;
//   };
//   exchangeVolume: ExchangeVolume[];
//   recentTransactions: RecentTransaction[];
// }