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

export const HeroesSelectInitialState: HeroesSelectState = {
  [HeroesSelectNames.ai]: aiAdapter.getInitialState(),
  [HeroesSelectNames.dailyBoss]: dailyBossAdapter.getInitialState(),
  [HeroesSelectNames.user]: userAdapter.getInitialState(),
  [HeroesSelectNames.firstBattle]: firstBattleAdapter.getInitialState(),
};

export function chooseHeroesAdapter(name: HeroesSelectNames) {
  return {
    [HeroesSelectNames.ai]: aiAdapter,
    [HeroesSelectNames.dailyBoss]: dailyBossAdapter,
    [HeroesSelectNames.user]: userAdapter,
    [HeroesSelectNames.firstBattle]: firstBattleAdapter,
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
      selectHeroState: (name: HeroesSelectNames, itemName: HeroesSelectStateEntity) =>
        makeSelectHeroState(selectBranch, name, itemName),
      selectHeroesCollection: (name: HeroesSelectNames) =>
        makeSelectHeroesCollection(selectBranch, name),
    };
  },
});

export const { selectHeroState, selectHeroesCollection } = HeroesSelectFeature;
