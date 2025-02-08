import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

function isJsonString(jsonString: string) {
  try {
    JSON.parse(jsonString);
  } catch (e) {
    return false;
  }
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  prefix = "got_"
  names = {
    user: "user"
  }

  updateLocalStorage = new BehaviorSubject(new Date().getMilliseconds());
  updateLocalStorage$ = this.updateLocalStorage.asObservable();

  constructor() {
  }

  getItem(key: string) {
    const item = localStorage.getItem(this.getToken(key));
    if (item) {
      return isJsonString(item) ? JSON.parse(item) : item;
    }
    return "";
  }

  setItem(key: string, value: any) {
    const valueToSet = typeof value === "object" ? JSON.stringify(value) : value;
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
