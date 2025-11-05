import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { AssistantActions } from '../actions/assistant.actions';
import { delay } from 'rxjs';
import { AssistantService } from '../../services/facades/assistant/assistant.service';
import { none } from '../actions/common.actions';

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
        return event.data.request
          ? AssistantActions.addRequest({
              data: this.assistant.createRequest(event.data.message, false),
            })
          : none();
      }),
    );
  });
}
