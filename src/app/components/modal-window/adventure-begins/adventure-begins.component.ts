import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { HasFooterHost } from '../modal-interfaces';
import { AdventureScenesHelperService } from './helpers/scenes-helper.service';
import { SceneRunnerService } from '../../../services/facades/scene-runner/scene-runner.service';
import { ScenesRunnerHost } from '../../../models/interfaces/scenes/scene.interface';
import { MatDialogRef } from '@angular/material/dialog';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { ModalWindowService } from '../../../services/modal/modal-window.service';

type Callback = {
  callback: () => void;
};

@Component({
  selector: 'app-adventure-begins',
  templateUrl: './adventure-begins.component.html',
  styleUrl: './adventure-begins.component.scss',
})
export class AdventureBeginsComponent implements HasFooterHost, ScenesRunnerHost {
  _data = inject<Callback>(DYNAMIC_COMPONENT_DATA);
  modalWindowService = inject(ModalWindowService);
  dialogRef = inject(MatDialogRef<AdventureBeginsComponent>);

  inProgress = false;

  scenesHelper = inject(AdventureScenesHelperService);
  runner = inject(SceneRunnerService);

  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  playSequences() {
    this.inProgress = true;

    this.runner.playSequence(this.scenesHelper.scenes).subscribe({
      complete: () => {
        this.inProgress = false;
        this.modalWindowService.dropModal();
        this.dialogRef.close();
        this._data.callback();
      },
    });
  }
}
