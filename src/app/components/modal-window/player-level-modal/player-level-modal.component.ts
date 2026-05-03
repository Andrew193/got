import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DynamicComponentConfig, HasFooterHost, ModalBase } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { PlayerLevelTableComponent } from '../player-level-table/player-level-table.component';

@Component({
  selector: 'app-player-level-modal',
  imports: [PlayerLevelTableComponent],
  templateUrl: './player-level-modal.component.html',
  styleUrl: './player-level-modal.component.scss',
})
export class PlayerLevelModalComponent implements Partial<HasFooterHost> {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  data = inject<DynamicComponentConfig<ModalBase>>(DYNAMIC_COMPONENT_DATA);

  constructor() {
    console.log(this.data);
  }
}
