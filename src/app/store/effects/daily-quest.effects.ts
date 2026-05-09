import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, map, of, switchMap, take, tap } from 'rxjs';
import { SNACKBAR_CONFIG } from '../../constants';
import { Quest } from '../../models/daily-quest.model';
import { DailyQuestApiService } from '../../services/daily-quest/daily-quest-api.service';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { UsersService } from '../../services/users/users.service';
import { DailyQuestActions } from '../actions/daily-quest.actions';
import { selectQuestById } from '../selectors/daily-quest.selectors';
import { DAILY_QUESTS } from '../../../../global-constants';

@Injectable()
export class DailyQuestEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private dailyQuestApiService = inject(DailyQuestApiService);
  private localStorageService = inject(LocalStorageService);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  loadQuests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DailyQuestActions.loadQuests),
      switchMap(() => {
        const userId = this.localStorageService.getUserId();

        return this.dailyQuestApiService.getQuests(userId).pipe(
          map(data => {
            if (!data) {
              return DailyQuestActions.loadQuestsFailure({ error: 'No data received' });
            }

            const quests: Quest[] = DAILY_QUESTS.map(def => {
              const record = data.quests.find(q => q.id === def.id);

              return {
                id: def.id,
                title: def.title,
                reward: def.reward,
                completed: record?.completed ?? false,
              };
            });

            return DailyQuestActions.loadQuestsSuccess({ quests });
          }),
          catchError(err =>
            of(DailyQuestActions.loadQuestsFailure({ error: err?.message ?? 'Unknown error' })),
          ),
        );
      }),
    ),
  );

  completeQuest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DailyQuestActions.completeQuest),
      switchMap(({ questId }) =>
        this.store.select(selectQuestById(questId)).pipe(
          take(1),
          switchMap(quest => {
            if (quest?.completed) {
              return EMPTY;
            }

            const userId = this.localStorageService.getUserId();

            return this.dailyQuestApiService.completeQuest(userId, questId).pipe(
              map(data => {
                if (!data) {
                  return DailyQuestActions.completeQuestFailure({ error: 'No data received' });
                }

                return DailyQuestActions.completeQuestSuccess({ questId });
              }),
              catchError(err =>
                of(
                  DailyQuestActions.completeQuestFailure({
                    error: err?.message ?? 'Unknown error',
                  }),
                ),
              ),
            );
          }),
        ),
      ),
    ),
  );

  grantReward$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DailyQuestActions.completeQuestSuccess),
        tap(({ questId }) => {
          const def = DAILY_QUESTS.find(q => q.id === questId);

          if (!def) {
            return;
          }

          this.usersService
            .updateCurrency({ copper: def.reward.copper, gold: 0, silver: 0 })
            .pipe(
              catchError(() => {
                this.snackBar.open('Failed to grant quest reward.', undefined, SNACKBAR_CONFIG);

                return EMPTY;
              }),
            )
            .subscribe();
        }),
      ),
    { dispatch: false },
  );
}
