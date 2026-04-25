import { inject, Injectable } from '@angular/core';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { ModalWindowService } from '../../modal/modal-window.service';
import { AdventureBeginsComponent } from '../../../components/modal-window/adventure-begins/adventure-begins.component';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';

@Injectable({
  providedIn: 'root',
})
export class LoginFacadeService {
  private modalWindowService = inject(ModalWindowService);
  dialogId = '';

  openAdventureBegins(callback: (heroName: HeroesNamesCodes) => void) {
    const modalConfig = this.modalWindowService.getModalConfig(
      '',
      '',
      { closeBtnLabel: '' },
      {
        strategy: ModalStrategiesTypes.component,
        component: AdventureBeginsComponent,
        data: {
          callback: callback,
        },
      },
    );

    this.dialogId = this.modalWindowService.openModal(modalConfig);

    return this.dialogId;
  }

  closeAdventureBeginsDialog() {
    this.modalWindowService.removeDialogFromRefs(this.dialogId);
  }
}
