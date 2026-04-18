import { ComponentRef, Type, ViewContainerRef } from '@angular/core';
import { BasicModalStrategy } from './strategies/basic-modal-strategy/basic-modal-strategy';
import { ComponentModalStrategy } from './strategies/component-modal-strategy/component-modal-strategy';

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

export type DynamicComponentConfig<T> = {
  close: (response?: boolean) => void;
  labels: ModalBaseLabels;
} & T;

export interface ModalConfig<T = unknown> extends ModalBase {
  dialogId: string;
  config: {
    callback?: (response?: boolean) => void;
    strategy: ModalStrategiesTypes;
    modalRootClass?: string;
    component?: Type<any>;
    data?: T;
  };
}

export interface ExtendedModalConfig<T = unknown> extends ModalConfig<T> {
  close: (response?: boolean) => void;
}

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
