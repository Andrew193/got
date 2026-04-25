import { createFeature, createReducer, on } from '@ngrx/store';
import { HeroProgressState, StoreNames } from '../store.interfaces';
import { HeroProgressActions } from '../actions/hero-progress.actions';

export const HeroProgressInitialState: HeroProgressState = {
  progress: null,
  loaded: false,
  error: null,
};

export const HeroProgressFeature = createFeature({
  name: StoreNames.heroProgress,
  reducer: createReducer(
    HeroProgressInitialState,
    on(HeroProgressActions.loadProgressSuccess, (_state, { data }) => ({
      progress: data,
      loaded: true,
      error: null,
    })),
    on(HeroProgressActions.loadProgressFailure, (state, { error }) => ({
      ...state,
      loaded: false,
      error,
    })),
    on(HeroProgressActions.unlockHeroSuccess, (state, { data }) => ({
      ...state,
      progress: data,
    })),
    on(HeroProgressActions.updateHeroSuccess, (state, { data }) => ({
      ...state,
      progress: data,
    })),
  ),
});
