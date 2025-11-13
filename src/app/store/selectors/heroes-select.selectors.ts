import { createSelector, MemoizedSelector } from '@ngrx/store';
import { HeroesSelectNames } from '../../constants';
import { HeroesSelectState, HeroesSelectStateEntity } from '../store.interfaces';
import { heroesSelectAdapter } from '../reducers/heroes-select.reducer';
import { getUnitKey } from '../reducers/units-configurator.reducer';
import { RewardValues } from '../../models/reward-based.model';
import { HeroesNamesCodes } from '../../models/units-related/unit.model';

export type SelectContexts = MemoizedSelector<object, HeroesSelectState>;

const heroesCollectionCache = new Map<
  HeroesSelectNames,
  MemoizedSelector<object, HeroesSelectStateEntity[]>
>();
const heroesStateCache = new Map<string, MemoizedSelector<object, boolean>>();

export function makeSelectHeroesCollection(
  selectContexts: SelectContexts,
  collection: HeroesSelectNames,
) {
  let memo = heroesCollectionCache.get(collection);

  if (!memo) {
    const selectionsSelector = heroesSelectAdapter.getSelectors(
      createSelector(selectContexts, ctx => ctx.selections),
    );

    memo = createSelector(selectionsSelector.selectAll, ctx => ctx);

    heroesCollectionCache.set(collection, memo);
  }

  return memo;
}

export function makeSelectHeroState(
  selectContexts: SelectContexts,
  config: { name: RewardValues | HeroesNamesCodes; collection: HeroesSelectNames },
) {
  const key = getUnitKey(config);
  let memo = heroesStateCache.get(key);

  if (!memo) {
    const adapterSelectors = heroesSelectAdapter.getSelectors(
      createSelector(selectContexts, ctx => ctx.selections),
    );

    memo = createSelector(adapterSelectors.selectAll, state => {
      return !!state.find(_ => _.name === config.name && _.collection === config.collection);
    });
    heroesStateCache.set(key, memo);
  }

  return memo;
}
