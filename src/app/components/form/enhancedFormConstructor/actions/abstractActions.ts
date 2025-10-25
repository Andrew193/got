import { ProtoActions } from './protoActions';

export abstract class AbstractActions<T> extends ProtoActions {
  saveAction(model: T): void {
    console.log(model);
  }
}
