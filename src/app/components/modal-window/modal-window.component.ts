import {Component, DestroyRef, inject, input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ModalConfig, ModalWindowService} from "../../services/modal/modal-window.service";
import {CommonModule} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'dynamic-modal-host',
  imports: [CommonModule],
  template: `
    <div>
      <ng-container #vc></ng-container>
      <ng-content></ng-content>
    </div>`,
  styleUrl: './modal-window.component.scss'
})
export class DynamicModalHostComponent implements OnInit {
  component = input<any>();

  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;

  ngOnInit() {
    this.component() && this.createCustomModalComponent(this.component());
  }

  createCustomModalComponent(DynamicComponent: any) {
    this.vc.clear();
    const componentRef = this.vc.createComponent(DynamicComponent);
  }
}

@Component({
  selector: 'modal-window',
  imports: [CommonModule, DynamicModalHostComponent],
  providers: [BsModalService],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss'
})
export class ModalWindowComponent implements OnInit {
  @ViewChild("template", {static: true}) modalTemplate: any;

  destroyRef = inject(DestroyRef);
  modalRef?: BsModalRef;

  initConfig = {
    headerClass: '',
    headerMessage: '',
    closeBtnLabel: '',
    config: {
      open: false,
      callback: () => {
      }
    }
  };
  modalConfig: ModalConfig = this.initConfig

  constructor(private modalService: BsModalService,
              private modalWindowService: ModalWindowService) {
  }

  ngOnInit(): void {
    this.modalWindowService.modalConfig$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newConfig) => {

        console.log(newConfig);

      if (newConfig.config.open) {
        this.modalConfig = newConfig;
        this.openModal(this.modalTemplate);
      } else {
        this.modalConfig = this.initConfig;
        this.modalService.hide(this.modalRef?.id)
      }
    })
  }

  openModal(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template, {ignoreBackdropClick: true, class: 'modal-lg'});
  }

  close() {
    this.modalConfig.config.callback();
    this.modalRef?.hide();
    this.modalWindowService.dropModal();
  }
}
