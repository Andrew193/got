import { createSelector, MemoizedSelector } from '@ngrx/store';
import { TrainingStateUnit } from '../store.interfaces';

export type SelectContexts = MemoizedSelector<object, TrainingStateUnit[]>;
let canStartTrainingBattleCache: MemoizedSelector<object, boolean> | null = null;

export function makeCanStartTrainingBattle(
  selectAiUnits: SelectContexts,
  selectUserUnits: SelectContexts,
) {
  if (!canStartTrainingBattleCache) {
    canStartTrainingBattleCache = createSelector(
      selectAiUnits,
      selectUserUnits,
      (aiUnits, userUnits) => {
        return [aiUnits, userUnits].flat().every(el => {
          return el.x != -1 && el.y != -1 && el.x != null && el.y != null;
        });
      },
    );
  }

  return canStartTrainingBattleCache;
}
