import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BasicModalStrategy } from './strategies/basic-modal-strategy/basic-modal-strategy';
import { ComponentModalStrategy } from './strategies/component-modal-strategy/component-modal-strategy';
import { Currency } from '../../services/users/users.interfaces';

export interface HasFooterHost {
  footerHost: ViewContainerRef;
  name: string;
}

export type ModalBaseLabels = {
  closeBtnLabel: string;
  declineBtnLabel?: string;
};

export interface ModalBase {
  headerClass: string;
  headerMessage: string;
  labels: ModalBaseLabels;
}

export interface AfterBattleModal extends ModalBase {
  reward: Currency;
}

export interface ModalConfig<T = unknown> extends ModalBase {
  dialogId: string;
  config: {
    callback?: (response?: boolean) => void;
    strategy: ModalStrategiesTypes;
    modalRootClass?: string;
    component?: HasFooterHost;
    data?: T;
  };
}

export interface ExtendedModalConfig<T = unknown> extends ModalConfig<T> {
  close: (response: boolean) => void;
}

export type DynamicComponentConfig<T> = Pick<ExtendedModalConfig, 'close'> & T;

export enum ModalStrategiesTypes {
  base,
  component,
}

export const ModalStrategies: Record<ModalStrategiesTypes, ModalStrategy> = {
  [ModalStrategiesTypes.base]: new BasicModalStrategy(),
  [ModalStrategiesTypes.component]: new ComponentModalStrategy(),
};

export interface ModalStrategy {
  render(vc: ViewContainerRef, modalConfig: ExtendedModalConfig): ComponentRef<any>;
}
