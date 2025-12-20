import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, pipe, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { IdEntity } from '../../../models/common.model';
import { PutPostMetaOf } from '../../../models/api.model';
import { toObservable } from '@angular/core/rxjs-interop';

type TapParser<T> = (config: T) => void;

@Injectable({
  providedIn: 'root',
})
export abstract class ApiService<T> {
  protected http = inject(HttpClient);
  protected localStorageService = inject(LocalStorageService);

  protected _data = signal<T | null>(null);
  _data$ = toObservable(this._data);

  get userId() {
    return this.localStorageService.getUserId();
  }

  protected putPostCover<E extends IdEntity>(
    entity: E,
    meta: PutPostMetaOf<T>,
  ): Observable<T | T[]> {
    const url = entity.id ? `${meta.url}/${entity.id}` : meta.url;
    const body = entity.id
      ? entity
      : (() => {
          const withDate = { ...entity, createdAt: Date.now() };

          delete withDate.id;

          return withDate;
        })();

    const req$ = entity.id ? this.http.put<T>(url, body) : this.http.post<T>(url, body);

    return req$.pipe(this.basicResponseTapParser(meta.callback)) as any;
  }

  protected basicResponseTapParser(callback: TapParser<T>) {
    return pipe(
      map((response: T | T[] | null) => (Array.isArray(response) ? response[0] : response)),
      tap({
        next: (response: T | null) => {
          this._data.set(response);
          response && callback(response);
        },
      }),
    );
  }

  getStaticData() {
    return this._data();
  }
}
