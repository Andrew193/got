import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectPlayerLevelViewModel } from '../../../store/selectors/player-level.selectors';
import { MAX_PLAYER_LEVEL } from '../../../constants/player-level.constants';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-player-level-bar',
  imports: [DecimalPipe],
  templateUrl: './player-level-bar.component.html',
  styleUrl: './player-level-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLevelBarComponent {
  private store = inject(Store);

  vm = toSignal(this.store.select(selectPlayerLevelViewModel), {
    initialValue: { level: 1, xp: 0, xpForNext: 0, progress: 0 },
  });

  readonly MAX_LEVEL = MAX_PLAYER_LEVEL;
}
