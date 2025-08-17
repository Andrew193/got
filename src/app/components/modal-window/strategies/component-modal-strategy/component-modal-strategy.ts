import {Component, Input, ViewContainerRef} from '@angular/core';
import {ExtendedModalConfig, ModalStrategy} from "../../modal-interfaces";

@Component({
  imports: [],
  template: '<div class="p-2"><button class="btn btn-success" (click)="close()">Close</button></div>',
})
class ComponentModalStrategyFooter {
  @Input({ required: true }) close!: () => void;
}

export class ComponentModalStrategy implements ModalStrategy {
  render(vc: ViewContainerRef, modalConfig: ExtendedModalConfig) {
    const componentRef = vc.createComponent(modalConfig.config.component);
    const footerRef = vc.createComponent(ComponentModalStrategyFooter);

    footerRef.setInput('close', modalConfig.close);

    return componentRef;
  }
}
