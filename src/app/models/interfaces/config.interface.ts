import { Observable } from 'rxjs';

export interface ConfigInterface<T> {
  getConfig: (callback: (config: T) => void) => Observable<T | T[] | undefined>;
  initConfigForNewUser: (userId: string) => Observable<T | T[] | undefined>;
}
