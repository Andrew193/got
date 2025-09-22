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
import { Unit } from '../../models/unit.model';

@Component({
  selector: 'game-entry-point',
  imports: [GameFieldComponent],
  templateUrl: './game-entry-point.component.html',
  styleUrl: './game-entry-point.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameEntryPointComponent {
  gameField = viewChild(GameFieldComponent);

  @Input() gameResultsRedirect: (realAiUnits: Unit[]) => void = () => {};

  userUnits = model([] as Unit[]);
  aiUnits = model([] as Unit[]);
  battleMode = input(true);

  constructor() {
    effect(() => {
      this.userUnits.update(model =>
        model.map(unit => ({ ...unit, user: true }))
      );
      this.aiUnits.update(model =>
        model.map(unit => ({ ...unit, user: false }))
      );

      if (this.gameField()) {
        this.gameField()?.recreateGameConfig(this.userUnits(), this.aiUnits());
      }
    });
  }
}
