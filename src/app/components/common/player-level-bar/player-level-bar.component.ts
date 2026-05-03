import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectPlayerLevelViewModel } from '../../../store/selectors/player-level.selectors';
import { DecimalPipe } from '@angular/common';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../modal-window/modal-interfaces';
import { PlayerLevelModalComponent } from '../../modal-window/player-level-modal/player-level-modal.component';

@Component({
  selector: 'app-player-level-bar',
  imports: [DecimalPipe],
  templateUrl: './player-level-bar.component.html',
  styleUrl: './player-level-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLevelBarComponent {
  private store = inject(Store);
  private modalService = inject(ModalWindowService);

  data = toSignal(this.store.select(selectPlayerLevelViewModel), {
    initialValue: { level: 1, xp: 0, xpForNext: 0, progress: 0 },
  });

  openLevelTable() {
    const config = this.modalService.getModalConfig(
      'level-table-header',
      'Player Level Requirements',
      { closeBtnLabel: 'Player Level Requirements' },
      {
        strategy: ModalStrategiesTypes.component,
        component: PlayerLevelModalComponent,
      },
    );

    this.modalService.openModal(config);
  }
}
