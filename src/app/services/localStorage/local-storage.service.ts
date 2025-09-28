import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  static names = {
    user: 'user',
    localOnlineBuffer: 'localOnlineBuffer',
  } as const;
}

export type BasicLocalStorageNamesKeys =
  (typeof BasicLocalStorage.names)[keyof typeof BasicLocalStorage.names];

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
