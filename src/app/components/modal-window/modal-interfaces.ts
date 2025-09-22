import { ComponentRef, ViewContainerRef } from '@angular/core';
import { BasicModalStrategy } from './strategies/basic-modal-strategy/basic-modal-strategy';
import { ComponentModalStrategy } from './strategies/component-modal-strategy/component-modal-strategy';

export interface HasFooterHost {
  footerHost: ViewContainerRef;
}

export interface ModalConfig {
  headerClass: string;
  headerMessage: string;
  closeBtnLabel: string;
  config: {
    open: boolean;
    callback: () => void;
    strategy: number;
    modalRootClass?: string;
    component?: HasFooterHost;
  };
}

export interface ExtendedModalConfig extends ModalConfig {
  close: () => void;
}

export enum ModalStrategiesTypes {
  base,
  component,
}

export const ModalStrategies: Record<number, ModalStrategy> = {
  [ModalStrategiesTypes.base]: new BasicModalStrategy(),
  [ModalStrategiesTypes.component]: new ComponentModalStrategy(),
};

export interface ModalStrategy {
  render(
    vc: ViewContainerRef,
    modalConfig: ExtendedModalConfig
  ): ComponentRef<any>;
}
