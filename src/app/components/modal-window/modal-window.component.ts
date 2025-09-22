import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalWindowService } from '../../services/modal/modal-window.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DynamicHostComponent } from './dynamic-host/dynamic-host.component';
import {
  ModalConfig,
  ModalStrategies,
  ModalStrategy,
} from './modal-interfaces';

@Component({
  selector: 'modal-window',
  imports: [CommonModule, DynamicHostComponent],
  providers: [BsModalService],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss',
})
export class ModalWindowComponent implements OnInit {
  @ViewChild('template', { static: true }) modalTemplate: any;

  modalWindowService = inject(ModalWindowService);
  destroyRef = inject(DestroyRef);
  modalService = inject(BsModalService);

  modalRef?: BsModalRef;
  strategy!: ModalStrategy;

  initConfig: ModalConfig = { ...this.modalWindowService.init };
  modalConfig: ModalConfig = this.initConfig;

  ngOnInit(): void {
    this.modalWindowService.modalConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(newConfig => {
        if (newConfig.config.open) {
          this.strategy = ModalStrategies[newConfig.config.strategy];
          this.modalConfig = newConfig;
          this.openModal(this.modalTemplate);
        } else {
          this.modalConfig = this.initConfig;
          this.modalService.hide(this.modalRef?.id);
        }
      });
  }

  openModal(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template, {
      ignoreBackdropClick: true,
      class: `modal-lg ${this.modalConfig.config.modalRootClass || ''}`,
    });
  }

  get contextConfig() {
    return {
      ...this.modalConfig,
      close: this.close,
    };
  }

  public close = () => {
    this.modalConfig.config.callback();
    this.modalRef?.hide();
    this.modalWindowService.dropModal();
  };
}
