import { createSelector, MemoizedSelector } from '@ngrx/store';
import { DisplayReward } from '../../services/reward/reward.service';
import { DisplayRewardNames } from '../store.interfaces';

export type SelectContexts = MemoizedSelector<object, Record<DisplayRewardNames, DisplayReward[]>>;

const cardStateCache = new Map<string, MemoizedSelector<object, DisplayReward>>();
const allFlippedCache = new Map<string, MemoizedSelector<object, boolean>>();
const cardCollectionCache = new Map<string, MemoizedSelector<object, DisplayReward[]>>();

export function makeSelectCardState(
  selectContexts: SelectContexts,
  name: DisplayRewardNames,
  index: number,
): MemoizedSelector<object, DisplayReward> {
  const key = `${name}:${index}`;
  let memo = cardStateCache.get(key);

  if (!memo) {
    memo = createSelector(selectContexts, ctx => ctx?.[name]?.[index]);
    cardStateCache.set(key, memo);
  }

  return memo;
}

export function makeSelectAllCardsFlipped(
  selectContexts: SelectContexts,
  name: DisplayRewardNames,
  ignoreEmpty: boolean,
): MemoizedSelector<object, boolean> {
  const key = name;
  let memo = allFlippedCache.get(key);

  if (!memo) {
    memo = createSelector(selectContexts, ctx => {
      const collection = ctx[name];

      if (!collection.length && ignoreEmpty) return false;

      return collection.every(card => card.flipped);
    });
    allFlippedCache.set(key, memo);
  }

  return memo;
}

export function makeSelectCardCollection(
  selectContexts: SelectContexts,
  name: DisplayRewardNames,
): MemoizedSelector<object, DisplayReward[]> {
  const key = name;
  let memo = cardCollectionCache.get(key);

  if (!memo) {
    memo = createSelector(selectContexts, ctx => ctx[name] ?? []);
    cardCollectionCache.set(key, memo);
  }

  return memo;
}
