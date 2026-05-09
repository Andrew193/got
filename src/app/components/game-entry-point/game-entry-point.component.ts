import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  Input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { GameFieldComponent } from '../game-field/game-field.component';
import { GameResultsRedirectType, TileUnit } from '../../models/field.model';

@Component({
  selector: 'app-game-entry-point',
  imports: [GameFieldComponent],
  templateUrl: './game-entry-point.component.html',
  styleUrl: './game-entry-point.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameEntryPointComponent<T extends TileUnit> {
  @Input() gameResultsRedirect: GameResultsRedirectType = () => {};
  @Input() gameMode = 'training';

  gameField = viewChild(GameFieldComponent);
  userUnits = model<TileUnit[]>([]);
  aiUnits = model<T[]>([]);
  battleMode = input(true);

  battleEndFlag = output<Parameters<GameResultsRedirectType>>();

  constructor() {
    effect(() => {
      const field = this.gameField();
      const userUnits = this.userUnits();
      const aiUnits = this.aiUnits();

      if (field) {
        untracked(() => field.recreateGameConfig(userUnits, aiUnits));
      }
    });
  }
}
