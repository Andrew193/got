import { Rarity } from '../models/units-related/unit.model';
import { Currency } from '../services/users/users.interfaces';

export const RARITY_XP_MULTIPLIERS: Record<Rarity, number> = {
  [Rarity.COMMON]: 0.0001,
  [Rarity.RARE]: 0.00025,
  [Rarity.EPIC]: 0.0005,
  [Rarity.LEGENDARY]: 0.001,
} as const;

export const LEVEL_UP_BASE_REWARD: Currency = {
  copper: 100000,
  silver: 1000,
  gold: 250,
} as const;

export const LEVEL_REWARD_SCALE = 0.05;

export const MILESTONE_SHARD_AMOUNT = 25;

export const MILESTONE_SHARD_RECIPIENTS_COUNT = 3;

export const MAX_PLAYER_LEVEL = 60;

/**
 * XP_TABLE[i] = cumulative XP required to reach level (i + 1).
 * XP_TABLE[0] = 0  (level 1 starts at 0 XP)
 * XP_TABLE[59] ≈ 1 200 000 (level 60)
 *
 * Step formula: Math.floor(100 * Math.pow(n - 1, 1.8))  where n = level index (1-based)
 * Step(1) ≈ 100, Step(59) ≈ 50 000 — slow progressive curve.
 */
function buildXpTable(): readonly number[] {
  const table: number[] = [0];

  for (let n = 2; n <= MAX_PLAYER_LEVEL; n++) {
    const step = Math.floor(100 * Math.pow(n - 1, 1.8));

    table.push(table[n - 2] + step);
  }

  return table as readonly number[];
}

export const XP_TABLE: readonly number[] = buildXpTable();

/**
 * Returns the player level (1–60) for a given cumulative XP value.
 * Returns the highest level N such that XP_TABLE[N-1] <= xp.
 */
export function computeLevel(xp: number): number {
  let level = 1;

  for (let i = 1; i < MAX_PLAYER_LEVEL; i++) {
    if (xp >= XP_TABLE[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  return level;
}

/**
 * Returns the currency reward for reaching a given level.
 * Scales linearly: reward(level) = floor(base * (1 + (level - 1) * LEVEL_REWARD_SCALE))
 */
export function computeLevelUpReward(level: number): Currency {
  const multiplier = 1 + (level - 1) * LEVEL_REWARD_SCALE;

  return {
    copper: Math.floor(LEVEL_UP_BASE_REWARD.copper * multiplier),
    silver: Math.floor(LEVEL_UP_BASE_REWARD.silver * multiplier),
    gold: Math.floor(LEVEL_UP_BASE_REWARD.gold * multiplier),
  };
}
