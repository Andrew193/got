import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

export interface ModalConfig {
  headerClass: string,
  headerMessage: string,
  closeBtnLabel: string,
  open: boolean,
  callback: () => void
}

@Injectable({
  providedIn: 'root'
})
export class ModalWindowService {
  init = {
    headerMessage: '',
    headerClass: '',
    closeBtnLabel: '',
    open: false,
    callback: () => {}
  }
  private _modalConfig: BehaviorSubject<ModalConfig> = new BehaviorSubject<ModalConfig>(this.init);
  modalConfig$ = this._modalConfig.asObservable();

  constructor() {
  }

  openModal(modalConfig: ModalConfig) {
    this._modalConfig.next(modalConfig)
  }

  dropModal() {
    this._modalConfig.next(this.init)
  }

  getModalConfig(headerClass = "", headerMessage = "", closeBtnLabel = "",
                 callback: ()=> void) {
    return {
      headerClass: headerClass,
      headerMessage: headerMessage,
      closeBtnLabel: closeBtnLabel,
      callback: callback,
      open: true
    }
  }
}
