import { Effect } from './models/effect.model';
import { User } from './services/users/users.interfaces';
import {
  BasicLocalStorage,
  BasicLocalStorageNamesKeys,
} from './services/localStorage/local-storage.service';
import { ALL_EFFECTS, EffectsValues } from './constants';
import { Injectable } from '@angular/core';
import { ApiService } from './services/abstract/api/api.service';
import { IdEntity } from './models/common.model';
import { Observable } from 'rxjs';
import { PutPostMetaOf } from './models/api.model';

//Effects

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

//User

export const fakeUser: User = {
  createdAt: 0,
  currency: {
    gold: 10,
    silver: 100,
    copper: 1000,
  },
  id: '1',
  login: 'rest',
  online: {
    onlineTime: 0,
    claimedRewards: [],
    lastLoyaltyBonus: '',
  },
  password: 'fake',
  depositId: 'deposit',
} as const;

//Local Storage

export class FakeLocalStorage extends BasicLocalStorage {
  store: Map<string, string | Record<string, any>> = new Map<string, string | Record<string, any>>([
    ['localOnlineBuffer', '600'],
    [BasicLocalStorage.names.user, fakeUser],
  ]);

  getItem(key: BasicLocalStorageNamesKeys) {
    return this.store.get(key) || '';
  }

  setItem(key: BasicLocalStorageNamesKeys, value: string | Record<string, any>) {
    this.store.set(key, value);
  }

  removeItem(key: BasicLocalStorageNamesKeys) {
    this.store.delete(key);
  }
}

//Test api service

@Injectable()
export class TestApiService<T> extends ApiService<T> {
  public save(entity: IdEntity, meta: PutPostMetaOf<T>): Observable<T | T[]> {
    return this.putPostCover(entity, meta) as any;
  }
}

//Test MatDialogRef

export const FakeMatDialogRef = {
  close: () => {
    console.log('Mat Dialog Closed');
  },
};

//Test MatBottomSheetRef

export const FakeMatBottomSheetRef = {
  dismiss: (result?: any) => {
    console.log('Mat Bottom Closed');
  },
};
