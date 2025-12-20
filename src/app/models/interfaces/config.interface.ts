import { Observable } from 'rxjs';

export interface ConfigInterface<T> {
  getConfig: (callback: (config: T) => void) => Observable<T | T[] | null>;
  initConfigForNewUser: (userId: string) => Observable<T | T[] | null>;
}
