import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalWindowService } from '../../services/modal/modal-window.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicHostComponent } from './dynamic-host/dynamic-host.component';
import { ModalConfig, ModalStrategies, ModalStrategy } from './modal-interfaces';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { modalWindowsNames } from '../../names';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ModalDialogRefs } from '../../models/modal.model';

@Component({
  selector: 'app-modal-window',
  imports: [DynamicHostComponent, NgClass, MatIcon, MatFabButton],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss',
})
export class ModalWindowComponent implements OnInit {
  @ViewChild('template', { static: true }) modalTemplate: any;

  modalWindowService = inject(ModalWindowService);
  destroyRef = inject(DestroyRef);

  strategy!: ModalStrategy;
  contextConfig!: ReturnType<typeof this.getContextConfig>;

  isModalTabSelected = this.modalWindowService.isModalTabSelected;
  bringToFront = this.modalWindowService.bringToFront;
  dialogRefs = this.modalWindowService.dialogRefs;

  ngOnInit(): void {
    this.modalWindowService.modalConfig$
      .pipe(takeUntilDestroyed(this.destroyRef), filter(Boolean))
      .subscribe(newConfig => {
        this.strategy = ModalStrategies[newConfig.config.strategy];
        this.openModal(
          this.modalTemplate,
          modalWindowsNames[newConfig.config.component?.name || ''],
          newConfig,
        );
        this.modalWindowService.dropModal();
      });
  }

  openModal(
    template: TemplateRef<void>,
    refConfig: Omit<ModalDialogRefs, 'dialogRef' | 'modalConfig'> = {
      name: 'Modal window',
      icon: 'notifications_active',
    },
    modalConfig: ModalConfig<unknown>,
  ) {
    this.contextConfig = this.getContextConfig(modalConfig);

    const dialogRef = this.modalWindowService.dialog.open(template, {
      disableClose: true,
      position: {
        top: '75px',
      },
    });

    this.modalWindowService.dialogRefs.set(modalConfig.dialogId, {
      dialogRef,
      ...refConfig,
      modalConfig,
    });
    dialogRef.afterClosed().subscribe();
  }

  get dialogsContainers() {
    if (this.modalWindowService.selectedDialogRef == null) {
      this.modalWindowService.selectedDialogRef = this.modalWindowService.dialogRefs.size - 1;
    }

    return Array.from(this.modalWindowService.dialogRefs.entries());
  }

  getContextConfig(modalConfig: ModalConfig<unknown>) {
    debugger;

    return {
      ...modalConfig,
      close: () => this.close(modalConfig),
      config: Object.assign({}, modalConfig.config, {
        data: Object.assign({}, modalConfig.config.data, { close: () => this.close(modalConfig) }),
      }),
    };
  }

  public close = (modalConfig: ModalConfig<unknown>) => {
    debugger;
    modalConfig.config.callback && modalConfig.config.callback();

    this.modalWindowService.removeDialogFromRefs(modalConfig.dialogId);
  };
}
