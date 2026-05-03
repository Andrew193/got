import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../abstract/api/api.service';

export interface PlayerLevelData {
  userId: string;
  level: number;
  xp: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerLevelApiService extends ApiService<PlayerLevelData> {
  private readonly baseUrl = '/api/player-level';

  load(userId: string): Observable<PlayerLevelData | null> {
    return this.http
      .get<PlayerLevelData>(`${this.baseUrl}/${userId}`)
      .pipe(this.basicResponseTapParser(data => data));
  }

  save(
    userId: string,
    data: Pick<PlayerLevelData, 'level' | 'xp'>,
  ): Observable<PlayerLevelData | null> {
    return this.http
      .put<PlayerLevelData>(`${this.baseUrl}/${userId}`, data)
      .pipe(this.basicResponseTapParser(d => d));
  }
}
