import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { NewsConfig } from '../../../models/watchtower/watchtower.model';

@Injectable({ providedIn: 'root' })
export class WatchtowerFacadeService {
  private http = inject(HttpClient);

  getNews(): Observable<NewsConfig[]> {
    return this.http.get<NewsConfig[]>('/api/watchtower/news');
  }

  createNews(item: Omit<NewsConfig, 'id'>): Observable<NewsConfig> {
    return this.http.post<NewsConfig>('/api/watchtower/news', item);
  }
}
