import moment from 'moment';
import { RewardLootConstant } from './models/reward-based.model';

export const DATE_FORMAT = 'MM/DD/YYYY';
export const BATTLE_SPEED = 500;
export const USER_TOKEN = 'user';
export const TODAY = moment().format(DATE_FORMAT);
export const GIFT_STORE_NPC_AMOUNT = 10;

export const getDiagonals = (checkDiagonals: boolean) => {
  return checkDiagonals
    ? [
        { di: -1, dj: 0 }, // Up
        { di: 1, dj: 0 }, // Down
        { di: 0, dj: -1 }, // Left
        { di: 0, dj: 1 }, // Right
        { di: -1, dj: -1 }, // Up-Left
        { di: -1, dj: 1 }, // Up-Right
        { di: 1, dj: -1 }, // Down-Left
        { di: 1, dj: 1 }, // Down-Right
      ]
    : [
        { di: -1, dj: 0 }, // Up
        { di: 1, dj: 0 }, // Down
        { di: 0, dj: -1 }, // Left
        { di: 0, dj: 1 }, // Right
      ];
};

export const frontRoutes = {
  base: '',
  taverna: 'taverna',
  preview: 'preview',
  battleField: 'test-b',
  training: 'training',
  trainingBattle: 'training-battle',
  dailyBoss: 'daily-boss',
  ironBank: 'iron-bank',
  dailyBossBattle: 'fight',
  login: 'login',
  summonTree: 'summon-tree',
  giftStore: 'gift-lands',
};

export const ALL_EFFECTS = {
  burning: 'Горение',
  freezing: 'Заморозка',
  healthRestore: 'Восстановление',
  bleeding: 'Кровотечение',
  poison: 'Отравление',
  attackBuff: 'Бонус атаки',
  attackBreak: 'Заржавелый Меч',
  defBuff: 'Бонус защиты',
  defDestroy: 'Коррозия брони',
  defBreak: 'Разлом брони',
  root: 'Корень',
} as const;

export type Effects = typeof ALL_EFFECTS;
export type EffectsKey = keyof Effects;
export type EffectsValues = Effects[EffectsKey];

export const ALL_EFFECTS_MULTIPLIERS: Record<EffectsValues, number> = {
  [ALL_EFFECTS.healthRestore]: 0.05,
  [ALL_EFFECTS.burning]: 0.1,
  [ALL_EFFECTS.freezing]: 1,
  [ALL_EFFECTS.root]: 0,
  [ALL_EFFECTS.defDestroy]: -50,
  [ALL_EFFECTS.poison]: 0.075,
  [ALL_EFFECTS.bleeding]: 0.05,
  [ALL_EFFECTS.defBreak]: 0.5,
  [ALL_EFFECTS.attackBreak]: 0.5,
  [ALL_EFFECTS.attackBuff]: 1.5,
  [ALL_EFFECTS.defBuff]: 1.5,
} as const;

export const REWARD: RewardLootConstant = {
  cooper: { min: 10000, max: 40000 },
  gold: { min: 20, max: 50 },
  shards: { min: 1, max: 10 },
  silver: { min: 50, max: 250 },
};
