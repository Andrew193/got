export interface Currency {
  gold: number,
  silver: number,
  cooper: number
}

export interface Online {
  onlineTime: number,
  claimedRewards: string[],
  lastLoyaltyBonus: string
}

export interface User {
  id: string,
  login: string | null | undefined,
  password: string | null | undefined,
  currency: Currency,
  online: Online,
  createdAt: number,
}
