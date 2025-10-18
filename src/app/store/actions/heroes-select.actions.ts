import { createActionGroup, props } from '@ngrx/store';
import { StoreNames } from '../store.interfaces';
import { RewardValues } from '../../models/reward-based.model';
import { HeroesNamesCodes } from '../../models/unit.model';
import { HeroesSelectNames } from '../../constants';

export const HeroesSelectActions = createActionGroup({
  source: StoreNames.heroesSelect,
  events: {
    setHeroesSelectState: props<{
      name: HeroesSelectNames;
      data: (RewardValues | HeroesNamesCodes)[];
    }>(),
    removeHeroFromCollection: props<{
      name: HeroesSelectNames;
      itemName: RewardValues | HeroesNamesCodes;
    }>(),
    addHeroToCollection: props<{
      name: HeroesSelectNames;
      itemName: RewardValues | HeroesNamesCodes;
    }>(),
    resetHeroCollection: props<{ name: HeroesSelectNames }>(),
  },
});
