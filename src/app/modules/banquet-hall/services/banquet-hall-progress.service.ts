import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HeroBattleProgress {
  heroName: string;
  completedBattles: string[];
}

export interface UserBanquetProgress {
  userId: string;
  heroes: HeroBattleProgress[];
}

@Injectable({ providedIn: 'root' })
export class BanquetHallProgressService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/banquet-hall';

  getProgress(userId: string): Observable<UserBanquetProgress> {
    return this.http.get<UserBanquetProgress>(`${this.baseUrl}/progress/${userId}`);
  }

  getHeroProgress(userId: string, heroName: string): Observable<HeroBattleProgress> {
    return this.http.get<HeroBattleProgress>(
      `${this.baseUrl}/progress/${userId}/${encodeURIComponent(heroName)}`,
    );
  }

  completeBattle(userId: string, battleId: string): Observable<UserBanquetProgress> {
    return this.http.post<UserBanquetProgress>(
      `${this.baseUrl}/progress/${userId}/complete-battle`,
      { battleId },
    );
  }
}
