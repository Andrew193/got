import { createSelector, MemoizedSelector } from '@ngrx/store';
import { UnitsConfiguratorStateUnit, UnitsConfiguratorVisibilityUnit } from '../store.interfaces';
import { getUnitKey } from '../reducers/units-configurator.reducer';
import { UnitName } from '../../models/units-related/unit.model';
import { HeroesSelectNames } from '../../constants';

export type SelectContexts = MemoizedSelector<object, UnitsConfiguratorStateUnit[]>;
type SelectVisibilityContexts = MemoizedSelector<object, UnitsConfiguratorVisibilityUnit[]>;

let canStartBattleCache: MemoizedSelector<object, boolean> | null = null;
const selectUnitsSelectorCache = new Map<
  HeroesSelectNames,
  MemoizedSelector<object, UnitsConfiguratorStateUnit[]>
>();

const unitsVisibilityCache = new Map<string, MemoizedSelector<object, boolean>>();

export function makeUnitVisibility(
  selectContexts: SelectVisibilityContexts,
  unit: { name: UnitName; collection: HeroesSelectNames },
) {
  const key = getUnitKey(unit);

  let selector = unitsVisibilityCache.get(key);

  if (!selector) {
    selector = createSelector(selectContexts, ctx => {
      const foundUnit = ctx.filter(
        _ => _.name === unit.name && _.collection === unit.collection,
      )[0];

      return foundUnit ? foundUnit.visible : false;
    });
    unitsVisibilityCache.set(key, selector);
  }

  return selector;
}

export function makeCanStartBattle(selectUnits: SelectContexts) {
  if (!canStartBattleCache) {
    canStartBattleCache = createSelector(selectUnits, units => {
      return units.every(el => {
        return el.x != -1 && el.y != -1 && el.x != null && el.y != null;
      });
    });
  }

  return canStartBattleCache;
}

export function makeSelectUnits(selectUnits: SelectContexts, collection: HeroesSelectNames) {
  let fromCache = selectUnitsSelectorCache.get(collection);

  if (!fromCache) {
    fromCache = createSelector(selectUnits, ctx => ctx.filter(el => el.collection === collection));
    selectUnitsSelectorCache.set(collection, fromCache);
  }

  return fromCache;
}
