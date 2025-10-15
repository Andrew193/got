import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  Input,
  model,
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

  gameField = viewChild(GameFieldComponent);
  userUnits = model<TileUnit[]>([]);
  aiUnits = model<T[]>([]);
  battleMode = input(true);

  constructor() {
    effect(() => {
      this.userUnits.update(model => model.map(unit => ({ ...unit, user: true })));
      this.aiUnits.update(model => model.map(unit => ({ ...unit, user: false })));

      if (this.gameField()) {
        this.gameField()?.recreateGameConfig(this.userUnits(), this.aiUnits());
      }
    });
  }
}
