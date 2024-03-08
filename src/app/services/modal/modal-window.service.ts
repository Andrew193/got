import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

export interface ModalConfig {
  headerClass: string,
  headerMessage: string,
  closeBtnLabel: string,
  open: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ModalWindowService {
  private _modalConfig: BehaviorSubject<ModalConfig> = new BehaviorSubject<ModalConfig>({
    headerMessage: '',
    headerClass: '',
    closeBtnLabel: '',
    open: false
  });
  modalConfig$ = this._modalConfig.asObservable();

  constructor() {
  }

  openModal(modalConfig: ModalConfig) {
    this._modalConfig.next(modalConfig)
  }
}
