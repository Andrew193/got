import { createSelector, MemoizedSelector } from '@ngrx/store';
import { DisplayReward } from '../../services/reward/reward.service';
import { DisplayRewardNames, DisplayRewardState } from '../store.interfaces';
import { chooseDisplayRewardAdapter } from '../reducers/display-reward.reducer';

export type SelectContexts = MemoizedSelector<object, DisplayRewardState>;

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
    const adapter = chooseDisplayRewardAdapter(name);
    const selectAll = adapter.getSelectors(
      createSelector(selectContexts, ctx => ctx[name]),
    ).selectAll;

    memo = createSelector(selectAll, ctx => ctx[index]);
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
    const adapter = chooseDisplayRewardAdapter(name);
    const selectAll = adapter.getSelectors(
      createSelector(selectContexts, ctx => ctx[name]),
    ).selectAll;

    memo = createSelector(selectAll, collection => {
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
    const adapter = chooseDisplayRewardAdapter(name);

    memo = adapter.getSelectors(createSelector(selectContexts, ctx => ctx[name])).selectAll;

    cardCollectionCache.set(key, memo);
  }

  return memo;
}
