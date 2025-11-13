import { HeroesSelectState, HeroesSelectStateEntity, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { HeroesSelectNames } from '../../constants';
import { createEntityAdapter } from '@ngrx/entity';
import { HeroesSelectActions } from '../actions/heroes-select.actions';
import {
  makeSelectHeroesCollection,
  makeSelectHeroState,
} from '../selectors/heroes-select.selectors';

function selectId(model: HeroesSelectStateEntity) {
  return model;
}

const aiAdapter = createEntityAdapter<HeroesSelectStateEntity>({
  selectId,
});
const dailyBossAdapter = createEntityAdapter<HeroesSelectStateEntity>({
  selectId,
});
const userAdapter = createEntityAdapter<HeroesSelectStateEntity>({
  selectId,
});
const firstBattleAdapter = createEntityAdapter<HeroesSelectStateEntity>({
  selectId,
});
const heroesMatcherAdapter = createEntityAdapter<HeroesSelectStateEntity>({
  selectId,
});

export const HeroesSelectInitialState: HeroesSelectState = {
  [HeroesSelectNames.aiCollection]: aiAdapter.getInitialState(),
  [HeroesSelectNames.dailyBossCollection]: dailyBossAdapter.getInitialState(),
  [HeroesSelectNames.userCollection]: userAdapter.getInitialState(),
  [HeroesSelectNames.firstBattleCollection]: firstBattleAdapter.getInitialState(),
  [HeroesSelectNames.heroesMatcherCollection]: heroesMatcherAdapter.getInitialState(),
};

export function chooseHeroesAdapter(name: HeroesSelectNames) {
  return {
    [HeroesSelectNames.aiCollection]: aiAdapter,
    [HeroesSelectNames.dailyBossCollection]: dailyBossAdapter,
    [HeroesSelectNames.userCollection]: userAdapter,
    [HeroesSelectNames.firstBattleCollection]: firstBattleAdapter,
    [HeroesSelectNames.heroesMatcherCollection]: heroesMatcherAdapter,
  }[name];
}

export const HeroesSelectFeature = createFeature({
  name: StoreNames.heroesSelect,
  reducer: createReducer(
    HeroesSelectInitialState,
    on(HeroesSelectActions.setHeroesSelectState, (state, action) => {
      const adapter = chooseHeroesAdapter(action.name);

      return { ...state, [action.name]: adapter.setAll(action.data, state[action.name]) };
    }),
    on(HeroesSelectActions.removeHeroFromCollection, (state, action) => {
      const adapter = chooseHeroesAdapter(action.name);

      return { ...state, [action.name]: adapter.removeOne(action.itemName, state[action.name]) };
    }),
    on(HeroesSelectActions.addHeroToCollection, (state, action) => {
      const adapter = chooseHeroesAdapter(action.name);

      return { ...state, [action.name]: adapter.addOne(action.itemName, state[action.name]) };
    }),
    on(HeroesSelectActions.resetHeroCollection, (state, action) => {
      const adapter = chooseHeroesAdapter(action.name);

      return { ...state, [action.name]: adapter.removeAll(state[action.name]) };
    }),
  ),
  extraSelectors: baseSelectors => {
    const selectBranch = baseSelectors.selectHeroesSelectState;

    return {
      selectHeroState: (collectionName: HeroesSelectNames, itemName: HeroesSelectStateEntity) =>
        makeSelectHeroState(selectBranch, collectionName, itemName),
      selectHeroesCollection: (name: HeroesSelectNames) =>
        makeSelectHeroesCollection(selectBranch, name),
    };
  },
});

export const { selectHeroState, selectHeroesCollection } = HeroesSelectFeature;
