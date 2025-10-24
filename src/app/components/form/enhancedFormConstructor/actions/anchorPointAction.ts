import { ProtoAction } from '../form-constructor.models';

export interface AnchorPointAction extends ProtoAction {
  getAction: () => void;
  getShowCondition: () => boolean;
  getDescription: () => string;
  color?: string;
}
