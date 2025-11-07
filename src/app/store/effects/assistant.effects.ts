import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { AssistantActions } from '../actions/assistant.actions';
import { delay } from 'rxjs';
import { AssistantService } from '../../services/facades/assistant/assistant.service';
import { Keyword } from '../../models/taverna/taverna.model';

@Injectable()
export class AssistantEffects {
  actions$ = inject(Actions);
  assistant = inject(AssistantService);

  toggleLoadingAfterAddRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssistantActions.addRequest),
      map(() => AssistantActions.toggleLoading()),
    ),
  );

  generateResponseAfterRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssistantActions.addRequest),
      delay(500),
      map(event => {
        if (event.data.request) {
          const newData = this.assistant.createRequest(event.data.message, false);

          return AssistantActions.addRequest({ data: newData });
        }

        const keywords = event.data.keywords.map(keyword => {
          return {
            word: keyword,
            active: false,
            assistantMemoryType: event.data.assistantMemoryType,
          } satisfies Keyword;
        });

        return AssistantActions.addKeywords({ data: keywords });
      }),
    );
  });
}
