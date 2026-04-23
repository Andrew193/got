import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProgress } from '../models/campaign.models';

@Injectable({ providedIn: 'root' })
export class CampaignProgressService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/campaign';

  getProgress(userId: string): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.baseUrl}/progress/${userId}`);
  }

  completeBattle(userId: string, battleId: string): Observable<UserProgress> {
    return this.http.post<UserProgress>(`${this.baseUrl}/progress/${userId}/complete-battle`, {
      battleId,
    });
  }
}
