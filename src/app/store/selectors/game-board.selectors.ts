import { createSelector, MemoizedSelector } from '@ngrx/store';
import { BasicBoardState } from '../store.interfaces';
import { Coordinate, TilesToHighlight } from '../../models/field.model';
import { logAdapter, tilesToHighlightAdapter } from '../reducers/game-board.reducer';
import { LogRecord } from '../../models/logger.model';
import { Currency } from '../../services/users/users.interfaces';

export type SelectContexts = MemoizedSelector<object, BasicBoardState>;

let tilesToHighlightCache: MemoizedSelector<object, TilesToHighlight[]> | null = null;
let battleLogCache: MemoizedSelector<object, LogRecord[]> | null = null;
let battleRewardCache: MemoizedSelector<object, Currency> | null = null;
const tileToHighlightCache = new Map<string, MemoizedSelector<object, TilesToHighlight | null>>();

export function makeSelectTilesToHighlightArray(selectTilesToHighlight: SelectContexts) {
  if (!tilesToHighlightCache) {
    const selectTilesSelector = createSelector(selectTilesToHighlight, ctx => ctx.tilesToHighlight);

    tilesToHighlightCache = tilesToHighlightAdapter.getSelectors(selectTilesSelector).selectAll;
  }

  return tilesToHighlightCache;
}

export function makeSelectBattleLog(selectBattleLog: SelectContexts) {
  if (!battleLogCache) {
    const selectBattleLogSelector = createSelector(selectBattleLog, ctx => ctx.battleLog);

    battleLogCache = logAdapter.getSelectors(selectBattleLogSelector).selectAll;
  }

  return battleLogCache;
}

export function makeSelectBattleReward(selectBattleReward: SelectContexts) {
  if (!battleRewardCache) {
    battleRewardCache = createSelector(selectBattleReward, ctx => ctx.reward);
  }

  return battleRewardCache;
}

export function makeSelectTileToHighlight(selectTileToHighlight: SelectContexts, tile: Coordinate) {
  const key = `${tile.x}:${tile.y}`;
  let memo = tileToHighlightCache.get(key);

  if (!memo) {
    const selectTilesSelector = createSelector(selectTileToHighlight, ctx => ctx.tilesToHighlight);
    const selectAll = tilesToHighlightAdapter.getSelectors(selectTilesSelector).selectAll;

    memo = createSelector(selectAll, ctx => {
      return ctx.find(el => el.i === tile.x && el.j === tile.y) || null;
    });
  }

  return memo;
}
