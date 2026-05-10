import { Component, Injector, Input, ViewContainerRef } from '@angular/core';
import { ExtendedModalConfig, HasFooterHost, ModalStrategy } from '../../modal-interfaces';
import { provideDynamicData } from '../../../../models/tokens';
import { MatDialogClose } from '@angular/material/dialog';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [MatDialogClose, MatMiniFabButton, MatIcon],
  template: `<div class="p-2">
    <button matMiniFab aria-label="Close dialog" mat-dialog-close="true">
      <mat-icon>close</mat-icon>
    </button>
  </div>`,
})
class ComponentModalStrategyFooter {
  @Input({ required: true }) close!: () => void;
}

function hasFooterHost(instance: any): instance is HasFooterHost {
  return instance && 'footerHost' in instance && instance.footerHost instanceof ViewContainerRef;
}

export class ComponentModalStrategy<T> implements ModalStrategy {
  render(vc: ViewContainerRef, modalConfig: ExtendedModalConfig<T>) {
    const customInjector = Injector.create({
      providers: [provideDynamicData<T>(modalConfig.config.data as T)],
      parent: vc.injector,
    });

    const componentRef = vc.createComponent(modalConfig.config.component!, {
      injector: customInjector,
    });
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
