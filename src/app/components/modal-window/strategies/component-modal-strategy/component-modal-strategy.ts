import {Component, Input, ViewContainerRef} from '@angular/core';
import {ExtendedModalConfig, HasFooterHost, ModalStrategy} from "../../modal-interfaces";

@Component({
  imports: [],
  template: '<div class="p-2"><i class="material-icons cursor-pointer" (click)="close()">close</i></div>',
})
class ComponentModalStrategyFooter {
  @Input({ required: true }) close!: () => void;
}

function hasFooterHost(instance: any): instance is HasFooterHost {
  return instance && 'footerHost' in instance && instance.footerHost instanceof ViewContainerRef;
}

export class ComponentModalStrategy implements ModalStrategy {
  render(vc: ViewContainerRef, modalConfig: ExtendedModalConfig) {
    // @ts-ignore
    const componentRef = vc.createComponent(modalConfig.config.component);
    let footerRef;

    if (hasFooterHost(componentRef.instance)) {
      const footerVc = componentRef.instance.footerHost;
      footerRef = footerVc.createComponent(ComponentModalStrategyFooter);
    } else {
      footerRef = vc.createComponent(ComponentModalStrategyFooter);
    }

    footerRef.setInput('close', modalConfig.close);
    return componentRef;
  }
}
