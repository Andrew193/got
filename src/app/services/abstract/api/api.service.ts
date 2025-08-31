import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, tap} from "rxjs";
import { HttpClient } from "@angular/common/http";
import {LocalStorageService} from "../../localStorage/local-storage.service";
import {IdEntity} from "../../../models/common.model";
import {USER_TOKEN} from "../../../constants";
import {User} from "../../users/users.interfaces";

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {
  protected data = new BehaviorSubject<T>({} as T);
  _data = this.data.asObservable();

  protected http = inject(HttpClient)
  protected localStorageService = inject(LocalStorageService);

  protected userId = '0';

  constructor() {
    this.userId = this.getUserId();
  }

  putPostCover(entity: IdEntity, meta: { url: string, callback: (res: T) => void, returnObs?: boolean }) {
    const process = {
      next: (response: T) => {
        this.data.next(response);
        meta.callback(response);
      },
      error: (error: any) => {
        console.log(error)
      }
    }
    const url = entity.id ? meta.url + `/${entity.id}` : meta.url;

    if (entity.id) {
      return meta.returnObs ? this.http.put<T>(url, entity).pipe(tap(process)) : this.http.put<T>(url, entity).pipe(tap(process)).subscribe()
    } else {
      const withDate = {...entity, createdAt: Date.now()};
      delete entity.id;
      return meta.returnObs ? this.http.post<T>(url, withDate).pipe(tap(process)) : this.http.post<T>(url, withDate).pipe(tap(process)).subscribe()
    }
  }

  protected basicResponseTapParser(callback: (config: T, userId: string) => void) {
    return tap({
      next: (response: T[]) => {
        this.data.next(response[0]);
        callback(response[0], this.userId);
      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  private getUserId() {
    const user = this.localStorageService.getItem(USER_TOKEN) as User;
    return user.id;
  }
}
