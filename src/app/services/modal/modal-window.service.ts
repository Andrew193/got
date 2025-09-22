import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ModalConfig,
  ModalStrategiesTypes,
} from '../../components/modal-window/modal-interfaces';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  init: ModalConfig = {
    headerMessage: '',
    headerClass: '',
    closeBtnLabel: '',
    config: {
      open: false,
      callback: () => {},
      strategy: ModalStrategiesTypes.base,
    },
  };
  private _modalConfig: BehaviorSubject<ModalConfig> =
    new BehaviorSubject<ModalConfig>(this.init);
  modalConfig$ = this._modalConfig.asObservable();

  constructor() {}

  openModal(modalConfig: ModalConfig) {
    this._modalConfig.next(modalConfig);
  }

  dropModal() {
    this._modalConfig.next(this.init);
  }

  getModalConfig(
    headerClass = '',
    headerMessage = '',
    closeBtnLabel = '',
    config: {
      open: boolean;
      callback: () => void;
      strategy: number;
      component?: any;
      modalRootClass?: string;
    }
  ): ModalConfig {
    return {
      headerClass: headerClass,
      headerMessage: headerMessage,
      closeBtnLabel: closeBtnLabel,
      config: {
        callback: config.callback,
        open: config.open,
        strategy: config.strategy,
        component: config.component,
        modalRootClass: config.modalRootClass,
      },
    };
  }
}
