export const UNLOCK_THRESHOLD = 100;
export const BOSS_SHARD_REWARD = 20;
export const POST_UNLOCK_SHARD_REWARD = 1;

export const makeBanquetBattleId = (
  heroName: string,
  screenIndex: number,
  battleIndex: number,
): string => `banquet-${heroName}-s${screenIndex}-b${battleIndex}`;
