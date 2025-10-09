import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
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

  protected userId = '0';

  constructor() {
    this.userId = this.getUserId();
  }

  protected putPostCover<R extends boolean, E extends IdEntity>(
    entity: E,
    meta: PutPostMetaOf<T, R>,
  ): typeof meta.returnObs extends true ? Observable<T | T[]> : Subscription {
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
    return tap({
      next: (response: T[] | T | undefined) => {
        const toReturn = Array.isArray(response) ? response[0] : response;

        if (toReturn) {
          this.data.next(toReturn);
          callback(toReturn);
        }
      },
      error: error => {
        console.log(error);
      },
    });
  }

  private getUserId() {
    const user = this.localStorageService.getItem(USER_TOKEN) as User;

    return user.id;
  }
}
