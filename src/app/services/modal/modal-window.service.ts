import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";

export interface ModalConfig {
  headerClass: string,
  headerMessage: string,
  closeBtnLabel: string,
  config: {
    open: boolean,
    callback: () => void,
    component?: any
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModalWindowService {
  init = {
    headerMessage: '',
    headerClass: '',
    closeBtnLabel: '',
    config: {
      open: false,
      callback: () => {
      }
    }
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

  getModalConfig(headerClass = "", headerMessage = "", closeBtnLabel = "", config: {
    open: boolean,
    callback: () => void,
    component?: any
  }) {
    return {
      headerClass: headerClass,
      headerMessage: headerMessage,
      closeBtnLabel: closeBtnLabel,
      config: {
        callback: config.callback,
        open: config.open,
        component: config.component
      }
    }
  }
}
