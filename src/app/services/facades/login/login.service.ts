import { inject, Injectable } from '@angular/core';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { ModalWindowService } from '../../modal/modal-window.service';
import { AdventureBeginsComponent } from '../../../components/modal-window/adventure-begins/adventure-begins.component';

@Injectable({
  providedIn: 'root',
})
export class LoginFacadeService {
  private modalWindowService = inject(ModalWindowService);

  openAdventureBegins(callback: () => void) {
    const modalConfig = this.modalWindowService.getModalConfig('', '', '', {
      open: true,
      strategy: ModalStrategiesTypes.component,
      component: AdventureBeginsComponent,
      data: {
        callback: callback,
      },
    });

    this.modalWindowService.openModal(modalConfig);
  }
}
