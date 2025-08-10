import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, tap} from "rxjs";
import {DailyReward, IdEntity} from "../../../interface";
import { HttpClient } from "@angular/common/http";
import {User, UsersService} from "../../users/users.service";
import {LocalStorageService} from "../../localStorage/local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {
  protected data = new BehaviorSubject<T>({} as T);
  _data = this.data.asObservable();

  protected http = inject(HttpClient)
  protected localStorageService = inject(LocalStorageService);
  protected userService = inject(UsersService);

  protected userId = '0';

  constructor() {
    this.userId = this.getUserId();
  }

  putPostCover(entity: IdEntity, meta: { url: string, callback: (res: IdEntity) => void, returnObs?: boolean }) {
    const process = {
      next: (response: IdEntity) => {
        meta.callback(response);
      },
      error: (error: any) => {
        console.log(error)
      }
    }
    const url = entity.id ? meta.url + `/${entity.id}` : meta.url;

    if (entity.id) {
      return meta.returnObs ? this.http.put<IdEntity>(url, entity).pipe(tap(process)) : this.http.put<IdEntity>(url, entity).pipe(tap(process)).subscribe()
    } else {
      delete entity.id;
      return meta.returnObs ? this.http.post<IdEntity>(url, entity).pipe(tap(process)) : this.http.post<IdEntity>(url, entity).pipe(tap(process)).subscribe()
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
    const user = this.localStorageService.getItem(this.userService.userToken) as User;
    return user.id;
  }
}
