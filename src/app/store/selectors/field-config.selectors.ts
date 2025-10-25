import { createSelector, MemoizedSelector } from '@ngrx/store';
import { FieldConfig } from '../store.interfaces';

export type SelectContexts = MemoizedSelector<object, FieldConfig>;

const fieldConfigCacheMap = new Map<string, MemoizedSelector<object, FieldConfig>>();

export function makeSelectFieldConfig(selectContexts: SelectContexts, name: string) {
  let fieldConfigCache = fieldConfigCacheMap.get(name);

  if (!fieldConfigCache) {
    fieldConfigCache = createSelector(selectContexts, ctx => ctx);
    fieldConfigCacheMap.set(name, fieldConfigCache);
  }

  return fieldConfigCache;
}
