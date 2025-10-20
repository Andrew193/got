import { createActionGroup, props } from '@ngrx/store';
import { HeroesSelectStateEntity, StoreNames } from '../store.interfaces';
import { HeroesSelectNames } from '../../constants';

export const HeroesSelectActions = createActionGroup({
  source: StoreNames.heroesSelect,
  events: {
    setHeroesSelectState: props<{
      name: HeroesSelectNames;
      data: HeroesSelectStateEntity[];
    }>(),
    removeHeroFromCollection: props<{
      name: HeroesSelectNames;
      itemName: HeroesSelectStateEntity;
    }>(),
    addHeroToCollection: props<{
      name: HeroesSelectNames;
      itemName: HeroesSelectStateEntity;
    }>(),
    resetHeroCollection: props<{ name: HeroesSelectNames }>(),
  },
});
