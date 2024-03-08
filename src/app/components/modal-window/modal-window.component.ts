import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ModalConfig, ModalWindowService} from "../../services/modal/modal-window.service";

@Component({
  selector: 'modal-window',
  standalone: true,
  imports: [],
  providers: [BsModalService],
  templateUrl: './modal-window.component.html',
  styleUrl: './modal-window.component.scss'
})
export class ModalWindowComponent implements OnInit{
  modalRef?: BsModalRef;
  @ViewChild("template") modalTemplate: any;
  modalConfig: ModalConfig = {
    headerClass: '',
    headerMessage: '',
    closeBtnLabel: '',
    open: false
  }

  constructor(private modalService: BsModalService,
              private modalWindowService: ModalWindowService) {
  }

  ngOnInit(): void {
    this.modalWindowService.modalConfig$.subscribe((newConfig)=> {
      if(newConfig.open && !this.modalConfig.open) {
        this.modalConfig = newConfig;
        this.openModal(this.modalTemplate);
      }
    })
  }

  openModal(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template, {ignoreBackdropClick: true, class: 'modal-lg'});
  }
}
