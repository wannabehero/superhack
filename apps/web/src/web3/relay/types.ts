interface Sponsor {
  address?: string;
  mainBalance?: RelayBalance;
  balances?: RelayBalance[];
}

interface Token {
  id: string;
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RelayBalance {
  id: string;
  totalSpentAmount: string;
  totalValidRequestedWithdrawAmount: string;
  totalDepositedAmount: string;
  totalWithdrawnAmount: string;
  amountInExecution: string;
  token: Token;
  isMain: boolean;
  updatedAt: string;
  createdAt: string;
  remainingBalance: string;
}

export interface RelayBalanceResponse {
  sponsor: Sponsor;
  message: string;
}
