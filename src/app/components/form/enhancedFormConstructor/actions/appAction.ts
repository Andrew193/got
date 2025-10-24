import { AppEntity, ProtoAction } from '../form-constructor.models';

export interface AppAction<T> extends ProtoAction {
  description: string;
  getAction?: (model: T, index: number) => void;
  getShowCondition: (model: T) => boolean;
  appEntity?: AppEntity<T>;
}
