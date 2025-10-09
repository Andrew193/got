import { Observable } from 'rxjs';

export interface ConfigInterface<T> {
  getConfig: (callback: (config: T) => void) => Observable<T | T[] | undefined>;
}
