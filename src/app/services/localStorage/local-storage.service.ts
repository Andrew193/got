import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { USER_TOKEN } from '../../constants';
import { User } from '../users/users.interfaces';

function isJsonString(jsonString: string) {
  try {
    JSON.parse(jsonString);
  } catch (error) {
    console.log(error);

    return false;
  }

  return true;
}

export class BasicLocalStorage {
  updateLocalStorage = new BehaviorSubject(new Date().getMilliseconds());
  updateLocalStorage$ = this.updateLocalStorage.asObservable();

  prefix = 'got_';
  static appPrefix = '__app_state__';

  static names = {
    [USER_TOKEN]: USER_TOKEN,
    localOnlineBuffer: 'localOnlineBuffer',
  } as const;
}

export type BasicLocalStorageNamesKeys =
  | (typeof BasicLocalStorage.names)[keyof typeof BasicLocalStorage.names]
  | string;

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends BasicLocalStorage {
  getItem(key: BasicLocalStorageNamesKeys) {
    const item = localStorage.getItem(this.getToken(key));

    if (item) {
      return isJsonString(item) ? JSON.parse(item) : item;
    }

    return '';
  }

  getUserId() {
    const user = this.getItem(USER_TOKEN) as User;

    return user.id;
  }

  setItem(key: BasicLocalStorageNamesKeys, value: any) {
    const valueToSet = typeof value === 'object' ? JSON.stringify(value) : value;

    localStorage.setItem(this.getToken(key), valueToSet);
    this.updateLocalStorage.next(new Date().getMilliseconds());
  }

  removeItem(key: BasicLocalStorageNamesKeys) {
    localStorage.removeItem(this.getToken(key));
  }

  private getToken(key: BasicLocalStorageNamesKeys) {
    return this.prefix + key;
  }
}
