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
      { battleId: this.getNextBanquetBattleId(battleId) },
    );
  }

  getNextBanquetBattleId(value: string): string {
    const match = value.match(/^(banquet-.+)-s(\d)-b(\d)$/);

    if (!match) {
      throw new Error(`Invalid banquet battle id format: ${value}`);
    }

    const [, prefix, sRaw, bRaw] = match;

    let s = Number(sRaw);
    let b = Number(bRaw);

    if (s === 4 && b === 5) {
      return value;
    }

    if (b < 5) {
      b += 1;
    } else {
      b = 0;
      if (s < 4) {
        s += 1;
      }
    }

    return `${prefix}-s${s}-b${b}`;
  }
}
