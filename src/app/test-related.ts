import { Effect } from './models/effect.model';
import { User } from './services/users/users.interfaces';
import { BasicLocalStorage } from './services/localStorage/local-storage.service';
import { ALL_EFFECTS, EffectsValues } from './constants';

const makeFakeEffect = (type: EffectsValues, turns: number): Effect =>
  ({
    type,
    duration: turns,
    restore: type === ALL_EFFECTS.healthRestore,
    m: 10,
  }) as Effect;

export function getFakeEffectMap() {
  return {
    [ALL_EFFECTS.burning]: (turns: number) => makeFakeEffect(ALL_EFFECTS.burning, turns),
    [ALL_EFFECTS.freezing]: (turns: number) => makeFakeEffect(ALL_EFFECTS.freezing, turns),
    [ALL_EFFECTS.healthRestore]: (turns: number) =>
      makeFakeEffect(ALL_EFFECTS.healthRestore, turns),
    [ALL_EFFECTS.defBreak]: (turns: number) => makeFakeEffect(ALL_EFFECTS.defBreak, turns),
    [ALL_EFFECTS.bleeding]: (turns: number) => makeFakeEffect(ALL_EFFECTS.bleeding, turns),
    [ALL_EFFECTS.poison]: (turns: number) => makeFakeEffect(ALL_EFFECTS.poison, turns),
    [ALL_EFFECTS.attackBuff]: (turns: number) => makeFakeEffect(ALL_EFFECTS.attackBuff, turns),
    [ALL_EFFECTS.defBuff]: (turns: number) => makeFakeEffect(ALL_EFFECTS.defBuff, turns),
    [ALL_EFFECTS.attackBreak]: (turns: number) => makeFakeEffect(ALL_EFFECTS.attackBreak, turns),
    [ALL_EFFECTS.defDestroy]: (turns: number) => makeFakeEffect(ALL_EFFECTS.defDestroy, turns),
    [ALL_EFFECTS.root]: (turns: number) => makeFakeEffect(ALL_EFFECTS.root, turns),
  } satisfies Record<EffectsValues, (turns: number) => Effect>;
}

export function getEffectFake(effectsMap: ReturnType<typeof getFakeEffectMap>) {
  function getEffect(effectType: EffectsValues, turns?: number, count?: 0): Effect;
  function getEffect(effectType: EffectsValues, turns: number, count: number): Effect[];
  function getEffect(effectType: EffectsValues, turns = 2, count = 0) {
    if (count > 0) {
      return Array.from({ length: count }, () => effectsMap[effectType](turns));
    }

    return effectsMap[effectType](turns);
  }

  return getEffect;
}

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

export class FakeLocalStorage extends BasicLocalStorage {
  store: Map<string, string | Record<string, any>> = new Map<string, string | Record<string, any>>([
    ['localOnlineBuffer', '600'],
    [this.names.user, fakeUser],
  ]);

  getItem(key: string) {
    return this.store.get(key) || '';
  }

  setItem(key: string, value: string | Record<string, any>) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }
}
