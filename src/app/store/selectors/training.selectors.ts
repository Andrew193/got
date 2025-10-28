import { createSelector, MemoizedSelector } from '@ngrx/store';
import { TrainingStateUnit, TrainingVisibilityUnit } from '../store.interfaces';
import { UnitName } from '../../models/units-related/unit.model';

export type SelectContexts = MemoizedSelector<object, TrainingStateUnit[]>;
type SelectVisibilityContexts = MemoizedSelector<object, TrainingVisibilityUnit[]>;

let canStartTrainingBattleCache: MemoizedSelector<object, boolean> | null = null;
const unitsVisibilityCache = new Map<string, MemoizedSelector<object, boolean>>();

export function makeUnitVisibility(
  selectContexts: SelectVisibilityContexts,
  id: UnitName,
  isUser: boolean,
) {
  const key = `${isUser}:${id}`;

  let selector = unitsVisibilityCache.get(key);

  if (!selector) {
    selector = createSelector(selectContexts, ctx => {
      const unit = ctx.filter(_ => _.name === id)[0];

      return unit ? unit.visible : false;
    });
    unitsVisibilityCache.set(key, selector);
  }

  return selector;
}

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
