import moment from 'moment';
import { RewardLootConstant } from './models/reward-based.model';
import { Currency } from './services/users/users.interfaces';
import { ParamCheckConfig, ParamsToCheck } from './models/api.model';
import { StoresConfig } from './models/stores/stores.model';
import { delay, of, switchMap } from 'rxjs';

export enum SceneNames {
  welcome,
  firstHero,
  firstBattle,
  finalAuth,
}

export enum TrainingSuf {
  ai = 'AI',
  user = 'User',
}

export enum HeroesSelectNames {
  userCollection = 'userCollection',
  aiCollection = 'aiCollection',
  heroesMatcherCollection = 'heroesMatcherCollection',
  dailyBossCollection = 'dailyBossCollection',
  firstBattleCollection = 'firstBattleCollection',
}

export const API_ENDPOINTS = {
  gift: 'giftTrip',
  dailyBoss: 'dailyBoss',
  daily: 'dailyReward',
  users: 'users',
  deposits: 'deposits',
  tables: 'tables',
};

// **************** paramsCheckerInterceptor ****************

export const enum PARAMS_TO_CHECK_REACTION {
  empty,
  replace,
  throwError,
  log,
  sendFixRequest,
}

export const PARAMS_TO_CHECK: Record<ParamsToCheck, ParamCheckConfig> = {
  userId: {
    reaction: PARAMS_TO_CHECK_REACTION.replace,
    violation: ['undefined'],
    fixer: req => {
      const newReq = req.clone({
        params: req.params.set('userId', 32),
      });

      return of(6000).pipe(
        delay(6000),
        switchMap(() => of(newReq)),
      );
    },
  },
  dsaContractId: {
    reaction: PARAMS_TO_CHECK_REACTION.log,
    violation: ['undefined', 'null', '0', '-1'],
  },
} as const;

export const enum TABLE_NAMES {
  taverna_hero_table = 'TavernaHeroesTable',
  test = 'TEST',
}

export const CURRENCY_NAMES = {
  gold: 'gold',
  silver: 'silver',
  copper: 'copper',
} as const;

export const DATE_FORMAT = 'MM/DD/YYYY';
export const BATTLE_SPEED = 500;
export const DEFENCE_REDUCTION = 0.4;
export const USER_TOKEN = 'user';
export const MATCHER_TOKEN = 'matcher_token';
export const TODAY = moment().format(DATE_FORMAT);
export const GIFT_STORE_NPC_AMOUNT = 10;
export const STEP_DEFAULT_ORDER = 100;
export const LOGIN_ERROR = 'Login or password is wrong. Try again.';
export const MAX_REWARD_TIME = 24;

export const BASIC_CURRENCY: Currency = {
  gold: 300,
  silver: 1000,
  copper: 15000,
};

export const GAME_BOARD_FIELD = {
  rows: 7,
  columns: 10,
};

export const SNACKBAR_CONFIG = {
  horizontalPosition: 'end',
  verticalPosition: 'top',
  duration: 5000,
} as const;

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
  shortInformation: 'short-information',
  tavernaHeroesBar: 'heroes-bar',
  tavernaSynergyOverview: 'synergy-overview',
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
  root: '/',
};

export const ALL_EFFECTS = {
  burning: 'Burning',
  freezing: 'Freezing',
  healthRestore: 'Recovery',
  bleeding: 'Bleeding',
  poison: 'Poison',
  attackBuff: 'Attack Bonus',
  attackBreak: 'Rusty Sword',
  defBuff: 'Defense Bonus',
  defDestroy: 'Armor corrosion',
  defBreak: 'Armor Break',
  root: 'Root',
} as const;

export const ALL_MECHANICS = {
  activates: 'Activates',
  extends: 'Extends',
};

export const effectsDescriptions: (effects: Effects) => Record<EffectsValues, string> = (
  effects: Effects,
) => ({
  //Buffs
  [effects.healthRestore]: 'Restores 5% health every turn.',
  //Debuffs
  [effects.burning]: 'Deals damage to the enemy equal to 10% of their health every turn.',
  [effects.bleeding]: 'Deals damage to the enemy equal to 5% of their health every turn.',
  [effects.poison]: 'Deals damage to the enemy equal to 7.5% of their health every turn.',
  //Mobility
  [effects.freezing]:
    'Freezes the hero and allows him to move only 1 cell per turn. The hero also loses 20% of health each turn.',
  [effects.root]: 'Binds the hero with roots, making it is impossible to move.',
  //Attack
  [effects.attackBuff]: 'Increases the hero attack by 50%.',
  [effects.attackBreak]: 'Reduces hero attack by 50%.',
  //Deff
  [effects.defBuff]: 'Increases the hero defense by 50%.',
  [effects.defBreak]: 'Reduces the hero defense by 50%.',
  [effects.defDestroy]: 'Defense decreases by 50 points per turn.',
});

export const mechanicsDescriptions: (effects: Mechanics) => Record<MechanicsValues, string> = (
  mechanics: Mechanics,
) => ({
  [mechanics.activates]: `If a skill activates effects, it means the hero receives buffs or debuffs from the effect, but the effect's timer doesn't decrease. Only active effects, such as Attack Bonus, can be activated.`,
  [mechanics.extends]: `If a skill extends effects, it means that the effect's timer increases.`,
});

export type Effects = typeof ALL_EFFECTS;
export type EffectsKey = keyof Effects;
export type EffectsValues = Effects[EffectsKey];

export type Mechanics = typeof ALL_MECHANICS;
export type MechanicsKey = keyof Mechanics;
export type MechanicsValues = Mechanics[MechanicsKey];

export type MobilityEffects = Extract<
  EffectsValues,
  typeof ALL_EFFECTS.root | typeof ALL_EFFECTS.freezing
>;

export const ALL_EFFECTS_MULTIPLIERS: Record<EffectsValues, number> = {
  [ALL_EFFECTS.healthRestore]: 0.05,
  [ALL_EFFECTS.burning]: 0.1,
  [ALL_EFFECTS.freezing]: 0.2,
  [ALL_EFFECTS.root]: 0,
  [ALL_EFFECTS.defDestroy]: -150,
  [ALL_EFFECTS.poison]: 0.075,
  [ALL_EFFECTS.bleeding]: 0.05,
  [ALL_EFFECTS.defBreak]: 0.5,
  [ALL_EFFECTS.attackBreak]: 0.5,
  [ALL_EFFECTS.attackBuff]: 1.5,
  [ALL_EFFECTS.defBuff]: 1.5,
} as const;

export const ALL_MOBILITY_EFFECTS_MULTIPLIERS: Record<MobilityEffects, number> = {
  [ALL_EFFECTS.freezing]: 1,
  [ALL_EFFECTS.root]: 0,
} as const;

export const REWARD: RewardLootConstant = {
  copper: { min: 10000, max: 40000 },
  gold: { min: 25, max: 50 },
  shards: { min: 1, max: 10 },
  silver: { min: 50, max: 250 },
};

export const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export const SELECT_SEARCH_PREFIX = 'SelectSearch';

export const DATA_SOURCES = {
  dataInputs: 'field',
  heroTypes: 'heroTypes',
  heroRarity: 'heroRarity',
} as const;

export const BASIC_STORES_CONFIG: StoresConfig = {
  bordered: true,
  withBackground: true,
};

export const SortDirectionMap = {
  asc: 'asc',
  desc: 'desc',
} as const;
