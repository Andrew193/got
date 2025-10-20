import { createSelector, MemoizedSelector } from '@ngrx/store';
import { HeroesSelectNames } from '../../constants';
import { HeroesSelectState, HeroesSelectStateEntity } from '../store.interfaces';
import { chooseHeroesAdapter } from '../reducers/heroes-select.reducer';

export type SelectContexts = MemoizedSelector<object, HeroesSelectState>;

const heroesCollectionCache = new Map<
  HeroesSelectNames,
  MemoizedSelector<object, HeroesSelectStateEntity[]>
>();
const heroesStateCache = new Map<string, MemoizedSelector<object, boolean>>();

export function makeSelectHeroesCollection(
  selectContexts: SelectContexts,
  name: HeroesSelectNames,
) {
  let memo = heroesCollectionCache.get(name);

  if (!memo) {
    const adapter = chooseHeroesAdapter(name);
    const adapterSelectors = adapter.getSelectors(createSelector(selectContexts, ctx => ctx[name]));

    memo = adapterSelectors.selectAll;
    heroesCollectionCache.set(name, memo);
  }

  return memo;
}

export function makeSelectHeroState(
  selectContexts: SelectContexts,
  name: HeroesSelectNames,
  itemName: HeroesSelectStateEntity,
) {
  const key = `${name}:${itemName}`;
  let memo = heroesStateCache.get(key);

  if (!memo) {
    const adapter = chooseHeroesAdapter(name);
    const adapterSelectors = adapter.getSelectors(createSelector(selectContexts, ctx => ctx[name]));

    memo = createSelector(adapterSelectors.selectAll, state => state.includes(itemName));
    heroesStateCache.set(key, memo);
  }

  return memo;
}
