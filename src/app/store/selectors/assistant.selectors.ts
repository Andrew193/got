import { AssistantRecords } from '../store.interfaces';
import { createSelector, MemoizedSelector } from '@ngrx/store';
import { Keyword } from '../../models/taverna/taverna.model';

type SelectRecords = MemoizedSelector<object, AssistantRecords>;
type SelectKeywordsRecords = MemoizedSelector<object, Keyword[]>;

let selectLoadingCache: MemoizedSelector<object, boolean> | null = null;
let selectKeywordsLabelsCache: MemoizedSelector<object, string[]> | null = null;

export function createSelectLoading(selectContext: SelectRecords) {
  if (!selectLoadingCache) {
    selectLoadingCache = createSelector(selectContext, ctx => ctx.loading);
  }

  return selectLoadingCache;
}

export function createSelectKeywordsLabels(selectContext: SelectKeywordsRecords) {
  if (!selectKeywordsLabelsCache) {
    selectKeywordsLabelsCache = createSelector(selectContext, ctx =>
      ctx.map(keyword => keyword.word),
    );
  }

  return selectKeywordsLabelsCache;
}
