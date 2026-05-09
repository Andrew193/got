import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { QuestId, QuestProgress } from '../../../../server/types';
import { BaseConfigApiService } from '../abstract/base-config-api/base-config-api.service';
import { DailyQuestActions } from '../../store/actions/daily-quest.actions';
import { Store } from '@ngrx/store';
import { createQuestsFromProgress } from './daily-quest-helper';

@Injectable({ providedIn: 'root' })
export class DailyQuestApiService extends BaseConfigApiService<QuestProgress> {
  private readonly baseUrl = '/api/daily-quests';
  private readonly store = inject(Store);

  override getConfig(callback?: (config: QuestProgress) => void) {
    return this.getQuests(this.userId).pipe(
      tap({
        next: data => {
          if (!data) {
            return;
          }

          callback?.(data);
          this.store.dispatch(
            DailyQuestActions.loadQuestsSuccess({ quests: createQuestsFromProgress(data) }),
          );
        },
        error: err => {
          const error = err?.message ?? 'Failed to load quest progress';

          this.store.dispatch(DailyQuestActions.loadQuestsFailure({ error }));
        },
      }),
    );
  }

  getQuests(userId: string): Observable<QuestProgress | null> {
    return this.http
      .get<QuestProgress>(`${this.baseUrl}/${userId}`)
      .pipe(this.basicResponseTapParser(data => data));
  }

  markQuestAsCompleted(userId: string, questId: QuestId): Observable<QuestProgress | null> {
    return this.http
      .post<QuestProgress>(`${this.baseUrl}/${userId}/mark-ready`, { questId })
      .pipe(this.basicResponseTapParser(data => data));
  }

  claimQuestReward(userId: string, questId: QuestId): Observable<QuestProgress | null> {
    return this.http
      .post<QuestProgress>(`${this.baseUrl}/${userId}/complete`, { questId })
      .pipe(this.basicResponseTapParser(data => data));
  }
}
