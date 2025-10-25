import { BasicBoardState, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { GameBoardActions } from '../actions/game-board.actions';
import { createEntityAdapter } from '@ngrx/entity';
import { Coordinate, TilesToHighlight } from '../../models/field.model';
import {
  makeSelectBattleLog,
  makeSelectTilesToHighlightArray,
  makeSelectTileToHighlight,
} from '../selectors/game-board.selectors';
import { LogRecord } from '../../models/logger.model';
import { BaseGameLoggerService } from '../../services/game-related/game-logger/logger.service';
import { FieldConfigInitialState, FieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from '../actions/field-config.actions';
import { makeSelectFieldConfig } from '../selectors/field-config.selectors';

function selectId(model: TilesToHighlight) {
  return `${model.i}:${model.j}`;
}

export const tilesToHighlightAdapter = createEntityAdapter<TilesToHighlight>({
  selectId,
});

export const logAdapter = createEntityAdapter<LogRecord>();

export const GameBoardInitialState: BasicBoardState = {
  tilesToHighlight: tilesToHighlightAdapter.getInitialState(),
  battleLog: logAdapter.getInitialState({ keepTrack: true }),
  fieldConfig: FieldConfigInitialState,
};

const loggerHelper = new BaseGameLoggerService();

export const GameBoardFeature = createFeature({
  name: StoreNames.gameBoard,
  reducer: createReducer(
    GameBoardInitialState,
    on(FieldConfigActions.setFieldConfig, (state, action) => {
      return { ...state, fieldConfig: FieldConfigReducer(state.fieldConfig, action) };
    }),
    on(GameBoardActions.setTilesToHighlight, (state, action) => {
      return {
        ...state,
        tilesToHighlight: tilesToHighlightAdapter.setAll(action.list, state.tilesToHighlight),
      };
    }),
    on(GameBoardActions.logEvent, (state, action) => {
      if (state.battleLog.keepTrack) {
        const { config, isUser, skill, unit, message } = action;
        const newLog = loggerHelper.logEvent(config, isUser, skill, unit, message);

        return { ...state, battleLog: logAdapter.addOne(newLog, state.battleLog) };
      }

      return state;
    }),
    on(GameBoardActions.logRecord, (state, action) => {
      if (state.battleLog.keepTrack) {
        return { ...state, battleLog: logAdapter.addOne(action, state.battleLog) };
      }

      return state;
    }),
    on(GameBoardActions.toggleTrackLog, state => {
      return { ...state, battleLog: { ...state.battleLog, keepTrack: !state.battleLog.keepTrack } };
    }),
    on(GameBoardActions.dropLog, state => {
      return { ...state, battleLog: logAdapter.removeAll(state.battleLog) };
    }),
  ),
  extraSelectors: baseSelectors => {
    const selectGameBoardState = baseSelectors.selectGameBoardState;

    return {
      selectTilesToHighlightArray: () => makeSelectTilesToHighlightArray(selectGameBoardState),
      selectTileToHighlight: (tile: Coordinate) =>
        makeSelectTileToHighlight(selectGameBoardState, tile),
      selectBattleLog: () => makeSelectBattleLog(selectGameBoardState),
      selectFieldConfig: () =>
        makeSelectFieldConfig(baseSelectors.selectFieldConfig, StoreNames.gameBoard),
    };
  },
});

export const {
  selectTileToHighlight,
  selectBattleLog,
  selectFieldConfig: selectGameFieldConfig,
} = GameBoardFeature;
