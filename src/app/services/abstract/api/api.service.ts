import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, pipe, Subscription, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from '../../localStorage/local-storage.service';
import { IdEntity } from '../../../models/common.model';
import { USER_TOKEN } from '../../../constants';
import { User } from '../../users/users.interfaces';
import { PutPostMetaOf } from '../../../models/api.model';

type TapParser<T> = (config: T) => void;

@Injectable({
  providedIn: 'root',
})
export abstract class ApiService<T> {
  protected data = new BehaviorSubject<T>({} as T);
  _data = this.data.asObservable();

  protected http = inject(HttpClient);
  protected localStorageService = inject(LocalStorageService);

  protected _userId = '0';

  constructor() {
    this._userId = this.getUserId();
  }

  protected putPostCover<R extends boolean, E extends IdEntity>(
    entity: E,
    meta: PutPostMetaOf<T, R>,
  ): R extends true ? Observable<T | T[]> : Subscription {
    const url = entity.id ? `${meta.url}/${entity.id}` : meta.url;
    const body = entity.id
      ? entity
      : (() => {
          const withDate = { ...entity, createdAt: Date.now() };

          delete withDate.id;

          return withDate;
        })();

    const req$ = entity.id ? this.http.put<T>(url, body) : this.http.post<T>(url, body);
    const parsed$ = req$.pipe(this.basicResponseTapParser(meta.callback));

    return (meta.returnObs ? parsed$ : parsed$.subscribe()) as any;
  }

  protected basicResponseTapParser(callback: TapParser<T>) {
    return pipe(
      map((response: T[] | T | undefined) => (Array.isArray(response) ? response[0] : response)),
      tap({
        next: (response: T | undefined) => {
          if (response) {
            this.data.next(response);
            callback(response);
          } else {
            this.data.next({} as T);
          }
        },
        error: error => {
          console.log(error);
        },
      }),
    );
  }

  getStaticData() {
    return this.data.getValue();
  }

  private getUserId() {
    const user = this.localStorageService.getItem(USER_TOKEN) as User;

    return user.id;
  }

  get userId() {
    if (!this._userId) {
      this._userId = this.getUserId();
    }

    return this._userId;
  }
}
