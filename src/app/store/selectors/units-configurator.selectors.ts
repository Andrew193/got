import { createSelector, MemoizedSelector } from '@ngrx/store';
import { UnitsConfiguratorStateUnit, UnitsConfiguratorUnitConfig } from '../store.interfaces';
import { getUnitKey } from '../reducers/units-configurator.reducer';
import { UnitName } from '../../models/units-related/unit.model';
import { HeroesSelectNames } from '../../constants';

export type SelectContexts = MemoizedSelector<object, UnitsConfiguratorStateUnit[]>;
type SelectConfigContexts = MemoizedSelector<object, UnitsConfiguratorUnitConfig[]>;

let canStartBattleCache: MemoizedSelector<object, boolean> | null = null;
const selectUnitsSelectorCache = new Map<
  HeroesSelectNames,
  MemoizedSelector<object, UnitsConfiguratorStateUnit[]>
>();

const unitsConfigCache = new Map<
  string,
  MemoizedSelector<object, Pick<UnitsConfiguratorUnitConfig, 'visible' | 'active'>>
>();

const unitsConfigsCache = new Map<
  HeroesSelectNames,
  MemoizedSelector<object, UnitsConfiguratorUnitConfig[]>
>();

export function makeSelectUnitConfigs(
  selectContexts: SelectConfigContexts,
  collection: HeroesSelectNames,
) {
  let selector = unitsConfigsCache.get(collection);

  if (!selector) {
    selector = createSelector(selectContexts, ctx => ctx.filter(_ => _.collection === collection));
    unitsConfigsCache.set(collection, selector);
  }

  return selector;
}

export function makeSelectUnitConfig(
  selectContexts: SelectConfigContexts,
  unit: { name: UnitName; collection: HeroesSelectNames },
) {
  const key = getUnitKey(unit);

  let selector = unitsConfigCache.get(key);

  if (!selector) {
    selector = createSelector(selectContexts, ctx => {
      const foundUnit = ctx.filter(
        _ => _.name === unit.name && _.collection === unit.collection,
      )[0];

      return { active: foundUnit?.active ?? true, visible: foundUnit?.visible ?? true };
    });
    unitsConfigCache.set(key, selector);
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
