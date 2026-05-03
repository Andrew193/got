import { createActionGroup, props } from '@ngrx/store';
import { StoreNames } from '../store.interfaces';
import { PlayerLevelData } from '../../services/player-level/player-level-api.service';

export const PlayerLevelActions = createActionGroup({
  source: StoreNames.playerLevel,
  events: {
    loadSuccess: props<{ data: PlayerLevelData }>(),
    loadFailure: props<{ error: string }>(),
    updateSuccess: props<{ data: PlayerLevelData }>(),
    updateFailure: props<{ error: string }>(),
  },
});
