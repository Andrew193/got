import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalWindowService } from '../../services/modal/modal-window.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicHostComponent } from './dynamic-host/dynamic-host.component';
import { ModalConfig, ModalStrategies, ModalStrategy } from './modal-interfaces';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-window',
  imports: [DynamicHostComponent],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss',
})
export class ModalWindowComponent implements OnInit {
  dialog = inject(MatDialog);
  dialogRef!: ReturnType<typeof this.dialog.open>;

  @ViewChild('template', { static: true }) modalTemplate: any;

  modalWindowService = inject(ModalWindowService);
  destroyRef = inject(DestroyRef);

  strategy!: ModalStrategy;

  initConfig: ModalConfig = { ...this.modalWindowService.init };
  modalConfig: ModalConfig = this.initConfig;

  ngOnInit(): void {
    this.modalWindowService.modalConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(newConfig => {
        console.log(newConfig);
        if (newConfig.config.open) {
          this.strategy = ModalStrategies[newConfig.config.strategy];
          this.modalConfig = newConfig;
          this.openModal(this.modalTemplate);
        } else {
          this.modalConfig = this.initConfig;
        }
      });
  }

  openModal(template: TemplateRef<void>) {
    this.dialogRef = this.dialog.open(template, {
      disableClose: true,
      position: {
        top: '50px',
      },
    });

    this.dialogRef.afterClosed().subscribe();
  }

  get contextConfig() {
    return {
      ...this.modalConfig,
      close: this.close,
    };
  }

  public close = () => {
    this.modalConfig.config.callback?.();
    this.dialogRef.close();
    this.modalWindowService.dropModal();
  };
}
