import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig, ModalStrategiesTypes } from '../../components/modal-window/modal-interfaces';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  static frozen = false;

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
  private _modalConfig: BehaviorSubject<ModalConfig> = new BehaviorSubject<ModalConfig>(this.init);
  modalConfig$ = this._modalConfig.asObservable();

  openModal(modalConfig: ModalConfig) {
    console.log(ModalWindowService.frozen, 'ModalWindowService.frozen', modalConfig);
    if (!ModalWindowService.frozen) {
      this._modalConfig.next(modalConfig);
    }
  }

  dropModal() {
    this._modalConfig.next(this.init);
  }

  getModalConfig<T>(
    headerClass = '',
    headerMessage = '',
    closeBtnLabel = '',
    config: {
      open: boolean;
      callback?: () => void;
      strategy: number;
      component?: any;
      modalRootClass?: string;
      data?: T;
    },
  ): ModalConfig<T> {
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
        data: config.data,
      },
    };
  }
}
