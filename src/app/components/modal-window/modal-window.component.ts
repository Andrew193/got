import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ModalConfig, ModalWindowService} from "../../services/modal/modal-window.service";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'modal-window',
    imports: [CommonModule],
    providers: [BsModalService],
    templateUrl: './modal-window.component.html',
    styleUrl: './modal-window.component.scss'
})
export class ModalWindowComponent implements OnInit {
  modalRef?: BsModalRef;
  @ViewChild("template") modalTemplate: any;
  initConfig = {
    headerClass: '',
    headerMessage: '',
    closeBtnLabel: '',
    open: false,
    callback: () => {
    }
  };
  modalConfig: ModalConfig = this.initConfig

  constructor(private modalService: BsModalService,
              private modalWindowService: ModalWindowService) {
  }

  ngOnInit(): void {
    this.modalWindowService.modalConfig$.subscribe((newConfig) => {
      if (newConfig.open) {
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
    this.modalConfig.callback();
    this.modalRef?.hide();
    this.modalWindowService.dropModal();
  }
}
