import { InitTask } from '../init.model';

export interface InitInterface<T extends InitTask = InitTask> {
  init: () => ReturnType<T>;
}
