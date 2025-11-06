import { AssistantRecords } from '../store.interfaces';
import { createSelector, MemoizedSelector } from '@ngrx/store';

type SelectRecords = MemoizedSelector<object, AssistantRecords>;
let selectLoadingCache: MemoizedSelector<object, boolean> | null = null;

export function createSelectLoading(selectContext: SelectRecords) {
  if (!selectLoadingCache) {
    selectLoadingCache = createSelector(selectContext, ctx => ctx.loading);
  }

  return selectLoadingCache;
}
