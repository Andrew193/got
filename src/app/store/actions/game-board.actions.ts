import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { StoreNames } from '../store.interfaces';
import { TilesToHighlight, TileUnit } from '../../models/field.model';
import { LogConfig, LogRecord } from '../../models/logger.model';
import { TileUnitSkill } from '../../models/units-related/skill.model';
import { Effect } from '../../models/effect.model';
import { Currency } from '../../services/users/users.interfaces';

export const GameBoardActions = createActionGroup({
  source: StoreNames.gameBoard,
  events: {
    setTilesToHighlight: props<{ list: TilesToHighlight[] }>(),
    logEvent: props<{
      config: LogConfig;
      isUser: boolean;
      skill: TileUnitSkill | Effect;
      unit: TileUnit;
      message?: string;
    }>(),
    setBattleReward: props<{ data: Currency }>(),
    logRecord: props<LogRecord>(),
    toggleTrackLog: emptyProps(),
    setTrackLog: props<{ newState: boolean }>(),
    dropLog: emptyProps(),
  },
});
