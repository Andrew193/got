import { createSelector, MemoizedSelector } from '@ngrx/store';
import {
  TrainingStateUnit,
  TrainingStateUnitType,
  TrainingVisibilityUnit,
} from '../store.interfaces';
import { UnitName } from '../../models/units-related/unit.model';

export type SelectContexts = MemoizedSelector<object, TrainingStateUnit[]>;
type SelectVisibilityContexts = MemoizedSelector<object, TrainingVisibilityUnit[]>;

let canStartTrainingBattleCache: MemoizedSelector<object, boolean> | null = null;
const selectUnitsSelectorCache = new Map<
  TrainingStateUnitType,
  MemoizedSelector<object, TrainingStateUnit[]>
>();

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

export function makeCanStartTrainingBattle(selectUnits: SelectContexts) {
  if (!canStartTrainingBattleCache) {
    canStartTrainingBattleCache = createSelector(selectUnits, units => {
      return units.every(el => {
        return el.x != -1 && el.y != -1 && el.x != null && el.y != null;
      });
    });
  }

  return canStartTrainingBattleCache;
}

export function makeSelectUnits(selectUnits: SelectContexts, collection: TrainingStateUnitType) {
  let fromCache = selectUnitsSelectorCache.get(collection);

  if (!fromCache) {
    fromCache = createSelector(selectUnits, ctx => ctx.filter(el => el.collection === collection));
    selectUnitsSelectorCache.set(collection, fromCache);
  }

  return fromCache;
}
