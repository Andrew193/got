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
  prefix = 'got_';
  names = {
    user: 'user',
    localOnlineBuffer: 'localOnlineBuffer',
  };
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends BasicLocalStorage {
  updateLocalStorage = new BehaviorSubject(new Date().getMilliseconds());
  updateLocalStorage$ = this.updateLocalStorage.asObservable();

  getItem(key: string) {
    const item = localStorage.getItem(this.getToken(key));

    if (item) {
      return isJsonString(item) ? JSON.parse(item) : item;
    }

    return '';
  }

  setItem(key: string, value: any) {
    const valueToSet = typeof value === 'object' ? JSON.stringify(value) : value;

    localStorage.setItem(this.getToken(key), valueToSet);
    this.updateLocalStorage.next(new Date().getMilliseconds());
  }

  removeItem(key: string) {
    localStorage.removeItem(this.getToken(key));
  }

  private getToken(key: string) {
    return this.prefix + key;
  }
}
