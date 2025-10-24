import { Id } from '../../../../models/common.model';
import { ProtoActions } from './protoActions';

export abstract class AbstractActions<T extends Id> extends ProtoActions {
  saveAction(model: T): void {
    console.log(model);
  }
}
