import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BattleDifficulty } from '../../../services/abstract/battle-rewards/battle-rewards.service';

export interface CampaignVictories {
  userId: string;
  difficulties: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class CampaignVictoriesService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/campaign-victories';

  getVictories(userId: string): Observable<CampaignVictories> {
    return this.http.get<CampaignVictories>(`${this.baseUrl}/${userId}`);
  }

  incrementVictory(userId: string, difficulty: BattleDifficulty): Observable<CampaignVictories> {
    return this.http.post<CampaignVictories>(`${this.baseUrl}/${userId}/increment`, {
      difficulty: BattleDifficulty[difficulty],
    });
  }

  decrementVictory(
    userId: string,
    difficulty: BattleDifficulty,
    amount = 10,
  ): Observable<CampaignVictories> {
    return this.http.post<CampaignVictories>(`${this.baseUrl}/${userId}/decrement`, {
      difficulty: BattleDifficulty[difficulty],
      amount,
    });
  }
}
