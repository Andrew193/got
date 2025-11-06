import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { AssistantActions } from '../actions/assistant.actions';
import { delay } from 'rxjs';
import { AssistantService } from '../../services/facades/assistant/assistant.service';

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
      delay(2500),
      map(event => {
        if (event.data.request) {
          const newData = this.assistant.createRequest(event.data.message, false);

          return AssistantActions.addRequest({ data: newData });
        }

        return AssistantActions.addKeywords({ data: event.data.keywords });
      }),
    );
  });
}
