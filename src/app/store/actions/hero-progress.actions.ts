import { createActionGroup, props } from '@ngrx/store';
import { PlayerHeroesProgress } from '../../models/units-related/unit.model';
import { StoreNames } from '../store.interfaces';

export const HeroProgressActions = createActionGroup({
  source: StoreNames.heroProgress,
  events: {
    loadProgressSuccess: props<{ data: PlayerHeroesProgress }>(),
    loadProgressFailure: props<{ error: string }>(),
    unlockHeroSuccess: props<{ data: PlayerHeroesProgress }>(),
    updateHeroSuccess: props<{ data: PlayerHeroesProgress }>(),
  },
});
