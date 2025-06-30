import {Component, OnInit} from '@angular/core';
import {GameFieldComponent} from "../game-field/game-field.component";
import {GameFieldService} from "../../services/game-field/game-field.service";
import {BasicGameFieldComponent} from "../abstract/basic-game-field/basic-game-field.component";
import {GameLoggerService} from "../../services/game-logger/logger.service";
import {GameService} from "../../services/game-action/game.service";
import {EffectsService} from "../../services/effects/effects.service";
import {UnitService} from "../../services/unit/unit.service";

@Component({
  selector: 'game-entry-point',
  standalone: true,
  imports: [GameFieldComponent],
  templateUrl: './game-entry-point.component.html',
  styleUrl: './game-entry-point.component.scss'
})
export class GameEntryPointComponent extends BasicGameFieldComponent implements OnInit {

  constructor(fieldService: GameFieldService,
              unitService: UnitService,
              effectsService: EffectsService,
              gameActionService: GameService,
              gameLoggerService: GameLoggerService) {
    super(fieldService, unitService, effectsService, gameActionService, gameLoggerService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.aiUnits = this.aiUnits.map((unit) => ({...unit, user: false}))
    this.userUnits = this.userUnits.map((unit) => ({...unit, user: true}))
  }
}
