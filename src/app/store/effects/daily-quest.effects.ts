import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, catchError, map, of, switchMap, take, tap } from 'rxjs';
import { DAILY_QUESTS } from '../../../../global-constants';
import { SNACKBAR_CONFIG } from '../../constants';
import { DailyQuestApiService } from '../../services/daily-quest/daily-quest-api.service';
import { LocalStorageService } from '../../services/localStorage/local-storage.service';
import { UsersService } from '../../services/users/users.service';
import {
  NotificationsService,
  NotificationType,
} from '../../services/notifications/notifications.service';
import { DailyQuestActions } from '../actions/daily-quest.actions';
import { selectHasReadyToClaim, selectQuestById } from '../selectors/daily-quest.selectors';
import { createQuestsFromProgress } from '../../services/daily-quest/daily-quest-helper';

@Injectable()
export class DailyQuestEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private dailyQuestApiService = inject(DailyQuestApiService);
  private localStorageService = inject(LocalStorageService);
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);
  private notificationsService = inject(NotificationsService);

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

            return DailyQuestActions.loadQuestsSuccess({ quests: createQuestsFromProgress(data) });
          }),
          catchError(err =>
            of(DailyQuestActions.loadQuestsFailure({ error: err?.message ?? 'Unknown error' })),
          ),
        );
      }),
    ),
  );

  markQuestAsCompleted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DailyQuestActions.markQuestAsCompleted),
      switchMap(({ questId }) =>
        this.store.select(selectQuestById(questId)).pipe(
          take(1),
          switchMap(quest => {
            if (quest?.status !== 'pending') {
              return EMPTY;
            }

            const userId = this.localStorageService.getUserId();

            return this.dailyQuestApiService.markQuestAsCompleted(userId, questId).pipe(
              map(data => {
                if (!data) {
                  return DailyQuestActions.markQuestAsCompletedFailure({
                    error: 'No data received',
                  });
                }

                return DailyQuestActions.markQuestAsCompletedSuccess({ questId });
              }),
              catchError(err =>
                of(
                  DailyQuestActions.markQuestAsCompletedFailure({
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

  claimQuestReward$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DailyQuestActions.claimQuestReward),
      switchMap(({ questId }) =>
        this.store.select(selectQuestById(questId)).pipe(
          take(1),
          switchMap(quest => {
            if (quest?.status !== 'ready_to_claim') {
              return EMPTY;
            }

            const userId = this.localStorageService.getUserId();

            return this.dailyQuestApiService.claimQuestReward(userId, questId).pipe(
              map(data => {
                if (!data) {
                  return DailyQuestActions.claimQuestRewardFailure({ error: 'No data received' });
                }

                return DailyQuestActions.claimQuestRewardSuccess({ questId });
              }),
              catchError(err =>
                of(
                  DailyQuestActions.claimQuestRewardFailure({
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
        ofType(DailyQuestActions.claimQuestRewardSuccess),
        tap(({ questId }) => {
          const def = DAILY_QUESTS.find(q => q.id === questId);

          if (!def) {
            return;
          }

          this.usersService
            .updateCurrency(def.reward)
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

  syncNotification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          DailyQuestActions.loadQuestsSuccess,
          DailyQuestActions.markQuestAsCompletedSuccess,
          DailyQuestActions.claimQuestRewardSuccess,
        ),
        switchMap(() =>
          this.store.select(selectHasReadyToClaim).pipe(
            take(1),
            tap(hasReady => {
              this.notificationsService.notificationsValue(NotificationType.daily_quests, hasReady);
            }),
          ),
        ),
      ),
    { dispatch: false },
  );
}
