import { InitTask } from '../init.model';

export interface InitInterface {
  init: () => ReturnType<InitTask>;
}
