import { Effect } from './models/effect.model';
import { User } from './services/users/users.interfaces';
import { BasicLocalStorage } from './services/localStorage/local-storage.service';
import { EffectsValues } from './constants';

const makeFakeEffect = (type: EffectsValues, turns: number): Effect =>
  ({
    type,
    duration: turns,
    restore: type === 'Восстановление',
    m: 10,
  }) as Effect;

export function getFakeEffectMap() {
  return {
    ['Горение']: (turns: number) => makeFakeEffect('Горение', turns),
    ['Заморозка']: (turns: number) => makeFakeEffect('Заморозка', turns),
    ['Восстановление']: (turns: number) => makeFakeEffect('Восстановление', turns),
    ['Разлом брони']: (turns: number) => makeFakeEffect('Разлом брони', turns),
    ['Кровотечение']: (turns: number) => makeFakeEffect('Кровотечение', turns),
    ['Отравление']: (turns: number) => makeFakeEffect('Отравление', turns),
    ['Бонус атаки']: (turns: number) => makeFakeEffect('Бонус атаки', turns),
    ['Бонус защиты']: (turns: number) => makeFakeEffect('Бонус защиты', turns),
    ['Заржавелый Меч']: (turns: number) => makeFakeEffect('Заржавелый Меч', turns),
    ['Коррозия брони']: (turns: number) => makeFakeEffect('Коррозия брони', turns),
    ['Корень']: (turns: number) => makeFakeEffect('Корень', turns),
  } as Record<EffectsValues, (turns: number) => Effect>;
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
