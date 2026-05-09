import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../abstract/api/api.service';
import { QuestId, QuestProgress } from '../../../../server/types';

@Injectable({ providedIn: 'root' })
export class DailyQuestApiService extends ApiService<QuestProgress> {
  private readonly baseUrl = '/api/daily-quests';

  getQuests(userId: string): Observable<QuestProgress | null> {
    return this.http
      .get<QuestProgress>(`${this.baseUrl}/${userId}`)
      .pipe(this.basicResponseTapParser(data => data));
  }

  completeQuest(userId: string, questId: QuestId): Observable<QuestProgress | null> {
    return this.http
      .post<QuestProgress>(`${this.baseUrl}/${userId}/complete`, { questId })
      .pipe(this.basicResponseTapParser(data => data));
  }
}
