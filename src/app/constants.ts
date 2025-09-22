import moment from 'moment';
import { RewardLootConstant } from './models/reward-based.model';
import { User } from './services/users/users.interfaces';

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

export const REWARD: RewardLootConstant = {
  cooper: { min: 10000, max: 40000 },
  gold: { min: 20, max: 50 },
  shards: { min: 1, max: 10 },
  silver: { min: 50, max: 250 },
};

export const fakeUser: User = {
  createdAt: 0,
  currency: {
    gold: 10,
    silver: 100,
    cooper: 1000,
  },
  id: '1',
  login: 'rest',
  online: {
    onlineTime: 0,
    claimedRewards: [],
    lastLoyaltyBonus: '',
  },
  password: 'fake',
} as const;
