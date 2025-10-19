import { createSelector, MemoizedSelector } from '@ngrx/store';
import { HeroesSelectStateContexts } from '../store.interfaces';
import { HeroesSelectNames } from '../../constants';
import { RewardValues } from '../../models/reward-based.model';
import { HeroesNamesCodes } from '../../models/unit.model';

export type SelectContexts = MemoizedSelector<object, HeroesSelectStateContexts>;

const heroesCollectionCache = new Map<
  HeroesSelectNames,
  MemoizedSelector<object, (RewardValues | HeroesNamesCodes)[]>
>();
const heroesStateCache = new Map<string, MemoizedSelector<object, boolean>>();

export function makeSelectHeroesCollection(
  selectContexts: SelectContexts,
  name: HeroesSelectNames,
) {
  let memo = heroesCollectionCache.get(name);

  if (!memo) {
    memo = createSelector(selectContexts, ctx => ctx[name]);
    heroesCollectionCache.set(name, memo);
  }

  return memo;
}

export function makeSelectHeroState(
  selectContexts: SelectContexts,
  name: HeroesSelectNames,
  itemName: RewardValues | HeroesNamesCodes,
) {
  const key = `${name}:${itemName}`;
  let memo = heroesStateCache.get(key);

  if (!memo) {
    memo = createSelector(selectContexts, ctx => ctx[name].includes(itemName));
    heroesStateCache.set(key, memo);
  }

  return memo;
}
