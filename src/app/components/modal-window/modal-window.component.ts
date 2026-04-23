import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalWindowService } from '../../services/modal/modal-window.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicHostComponent } from './dynamic-host/dynamic-host.component';
import {
  ModalConfig,
  ModalStrategies,
  ModalStrategy,
  DynamicComponentConfig,
} from './modal-interfaces';
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
    const close = this.close.bind(this, modalConfig);

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

    dialogRef.afterClosed().subscribe((response = true) => {
      close(response);
    });
  }

  get dialogsContainers() {
    if (this.modalWindowService.selectedDialogRef == null) {
      this.modalWindowService.selectedDialogRef = this.modalWindowService.dialogRefs.size - 1;
    }

    return Array.from(this.modalWindowService.dialogRefs.entries());
  }

  getContextConfig(modalConfig: ModalConfig<unknown>) {
    const dynamicData: Pick<DynamicComponentConfig<unknown>, 'close' | 'labels'> = {
      close: (response?: boolean) => this.close(modalConfig, response),
      labels: modalConfig.labels,
    };

    return {
      ...modalConfig,
      close: (response?: boolean) => this.close(modalConfig, response),
      config: {
        ...modalConfig.config,
        data: {
          ...(modalConfig.config?.data ?? {}),
          ...dynamicData,
        },
      },
    };
  }

  public close = (modalConfig: ModalConfig<unknown>, response?: boolean) => {
    modalConfig.config.callback && modalConfig.config.callback(response);

    this.modalWindowService.removeDialogFromRefs(modalConfig.dialogId);
  };
}
