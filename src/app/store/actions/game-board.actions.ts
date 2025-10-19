import { createActionGroup, props } from '@ngrx/store';
import { StoreNames } from '../store.interfaces';
import { TilesToHighlight } from '../../models/field.model';

export const GameBoardActions = createActionGroup({
  source: StoreNames.gameBoard,
  events: {
    setTilesToHighlight: props<{ list: TilesToHighlight[] }>(),
  },
});
