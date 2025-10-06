import { Observable } from 'rxjs';

export type InitTaskObs = {
  ok: boolean;
  message: string;
};
export type InitTask = () => Observable<InitTaskObs>;

export interface InitStep {
  name: string;
  order?: number;
  task: InitTask;
}
