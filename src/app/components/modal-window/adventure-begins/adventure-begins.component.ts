import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { HasFooterHost } from '../modal-interfaces';
import { SceneRunnerService } from '../../../services/facades/scene-runner/scene-runner.service';
import { ScenesRunnerHost } from '../../../models/interfaces/scenes/scene.interface';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { ScenariosHelperService } from './helpers/scenarios-helper.service';

export type Callback = {
  callback: () => void;
};

@Component({
  selector: 'app-adventure-begins',
  templateUrl: './adventure-begins.component.html',
  styleUrl: './adventure-begins.component.scss',
})
export class AdventureBeginsComponent implements Partial<HasFooterHost>, ScenesRunnerHost {
  _data = inject<Callback>(DYNAMIC_COMPONENT_DATA);
  scenesHelper = inject(ScenariosHelperService);
  runner = inject(SceneRunnerService);

  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  inProgress = false;

  playSequences() {
    this.inProgress = true;

    this.runner.init(this.scenesHelper.adventureScenario).subscribe(() => {
      this.inProgress = false;
      this._data.callback();
    });
  }
}
