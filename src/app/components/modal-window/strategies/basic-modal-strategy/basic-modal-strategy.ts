import { ViewContainerRef } from '@angular/core';
import { ModalConfig, ModalStrategy } from '../../modal-interfaces';
import { BasicModalStrategyTemplateComponent } from './basic-modal-strategy-template/basic-modal-strategy-template.component';

export class BasicModalStrategy implements ModalStrategy {
  render(vc: ViewContainerRef, modalConfig: ModalConfig) {
    const componentRef = vc.createComponent(BasicModalStrategyTemplateComponent);

    componentRef.setInput('modalConfig', modalConfig);

    return componentRef;
  }
}
