import {Component, Input, ViewContainerRef} from '@angular/core';
import {ExtendedModalConfig, HasFooterHost, ModalStrategy} from "../../modal-interfaces";

@Component({
  imports: [],
  template: '<div class="p-2"><button class="btn btn-success" (click)="close()">Close</button></div>',
})
class ComponentModalStrategyFooter {
  @Input({ required: true }) close!: () => void;
}

function hasFooterHost(instance: any): instance is HasFooterHost {
  return instance && 'footerHost' in instance && instance.footerHost instanceof ViewContainerRef;
}

export class ComponentModalStrategy implements ModalStrategy {
  render(vc: ViewContainerRef, modalConfig: ExtendedModalConfig) {
    const componentRef = vc.createComponent(modalConfig.config.component);

    if (hasFooterHost(componentRef.instance)) {
      const footerVc = componentRef.instance.footerHost;
      const footerRef = footerVc.createComponent(ComponentModalStrategyFooter);
      footerRef.setInput('close', modalConfig.close);
    } else {
      const footerRef = vc.createComponent(ComponentModalStrategyFooter);
      footerRef.setInput('close', modalConfig.close);
    }

    return componentRef;
  }
}
