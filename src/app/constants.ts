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
  defBreak: 'Разлом брони',
  bleeding: 'Кровотечение',
  poison: 'Отравление',
  attackBuff: 'Бонус атаки',
  defBuff: 'Бонус защиты',
  attackBreak: 'Заржавелый Меч',
  defDestroy: 'Коррозия брони',
  root: 'Корень',
} as const;

export type Effects = typeof ALL_EFFECTS;
export type EffectsKey = keyof Effects;
export type EffectsValues = Effects[EffectsKey];

export const REWARD: RewardLootConstant = {
  cooper: { min: 10000, max: 40000 },
  gold: { min: 20, max: 50 },
  shards: { min: 1, max: 10 },
  silver: { min: 50, max: 250 },
};
