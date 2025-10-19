import { BasicBoardState, BasicBoardStateContexts, StoreNames } from '../store.interfaces';
import { createFeature, createReducer, on } from '@ngrx/store';
import { GameBoardActions } from '../actions/game-board.actions';

export const GameBoardInitialState: BasicBoardState = {
  contexts: {},
};

export const GameBoardFeature = createFeature({
  name: StoreNames.gameBoard,
  reducer: createReducer(
    GameBoardInitialState,
    on(GameBoardActions.setTilesToHighlight, (state, action) => {
      const newState: BasicBoardStateContexts = {};

      for (const t of action.list) newState[`${t.i}:${t.j}`] = t.highlightedClass;

      return { ...state, contexts: newState };
    }),
  ),
  extraSelectors: baseSelectors => {
    return {};
  },
});

export const { selectContexts: selectGameBoardContexts } = GameBoardFeature;
