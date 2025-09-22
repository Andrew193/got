import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { fakeUser } from '../../constants';

function isJsonString(jsonString: string) {
  try {
    JSON.parse(jsonString);
  } catch (error) {
    console.log(error);

    return false;
  }

  return true;
}

class BasicLocalStorage {
  prefix = 'got_';
  names = {
    user: 'user',
    localOnlineBuffer: 'localOnlineBuffer',
  };
}

export class FakeLocalStorage extends BasicLocalStorage {
  store: Map<string, string | Record<string, any>> = new Map<string, string | Record<string, any>>([
    ['localOnlineBuffer', '600'],
    [this.names.user, fakeUser],
  ]);

  getItem(key: string) {
    return this.store.get(key) || '';
  }

  setItem(key: string, value: string | Record<string, any>) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }
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
