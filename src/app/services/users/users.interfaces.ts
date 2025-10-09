import { IdEntity } from '../../models/common.model';

export interface Currency {
  gold: number;
  silver: number;
  copper: number;
}

export interface DepositCurrency extends Currency, IdEntity {
  duration: number;
  depositDay: number;
}

export interface Online {
  onlineTime: number;
  claimedRewards: string[];
  lastLoyaltyBonus: string;
}

export interface User {
  id: string;
  login: string | null | undefined;
  password: string | null | undefined;
  currency: Currency;
  online: Online;
  createdAt: number;
  depositId: string;
}
