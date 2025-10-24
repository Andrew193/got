import { createSelector, MemoizedSelector } from '@ngrx/store';
import { BasicBoardFieldConfig, BasicBoardState } from '../store.interfaces';
import { Coordinate, TilesToHighlight } from '../../models/field.model';
import { logAdapter, tilesToHighlightAdapter } from '../reducers/game-board.reducer';
import { LogRecord } from '../../models/logger.model';

export type SelectContexts = MemoizedSelector<object, BasicBoardState>;

let tilesToHighlightCache: MemoizedSelector<object, TilesToHighlight[]> | null = null;
let battleLogCache: MemoizedSelector<object, LogRecord[]> | null = null;
let fieldConfigCache: MemoizedSelector<object, BasicBoardFieldConfig> | null = null;
const tileToHighlightCache = new Map<string, MemoizedSelector<object, TilesToHighlight | null>>();

export function makeSelectTilesToHighlightArray(selectTilesToHighlight: SelectContexts) {
  if (!tilesToHighlightCache) {
    const selectTilesSelector = createSelector(selectTilesToHighlight, ctx => ctx.tilesToHighlight);

    tilesToHighlightCache = tilesToHighlightAdapter.getSelectors(selectTilesSelector).selectAll;
  }

  return tilesToHighlightCache;
}

export function makeSelectBattleLog(selectTilesToHighlight: SelectContexts) {
  if (!battleLogCache) {
    const selectBattleLogSelector = createSelector(selectTilesToHighlight, ctx => ctx.battleLog);

    battleLogCache = logAdapter.getSelectors(selectBattleLogSelector).selectAll;
  }

  return battleLogCache;
}

export function makeSelectFieldConfig(selectTilesToHighlight: SelectContexts) {
  if (!fieldConfigCache) {
    fieldConfigCache = createSelector(selectTilesToHighlight, ctx => ctx.fieldConfig);
  }

  return fieldConfigCache;
}

export function makeSelectTileToHighlight(
  selectTilesToHighlight: SelectContexts,
  tile: Coordinate,
) {
  const key = `${tile.x}:${tile.y}`;
  let memo = tileToHighlightCache.get(key);

  if (!memo) {
    const selectTilesSelector = createSelector(selectTilesToHighlight, ctx => ctx.tilesToHighlight);
    const selectAll = tilesToHighlightAdapter.getSelectors(selectTilesSelector).selectAll;

    memo = createSelector(selectAll, ctx => {
      return ctx.find(el => el.i === tile.x && el.j === tile.y) || null;
    });
  }

  return memo;
}
