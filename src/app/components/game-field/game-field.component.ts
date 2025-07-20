import {Component} from '@angular/core';
import {GameFieldService} from "../../services/game-field/game-field.service";
import {CommonModule} from "@angular/common";
import {PopoverModule} from "ngx-bootstrap/popover";
import {TabsModule} from "ngx-bootstrap/tabs";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {GameService} from "../../services/game-action/game.service";
import {EffectsService} from "../../services/effects/effects.service";
import {UnitService} from "../../services/unit/unit.service";
import {BasicGameBoardComponent} from "../basic-game-board/basic-game-board.component";
import {GameLoggerService} from "../../services/game-logger/logger.service";
import {BasicGameFieldComponent} from "../abstract/basic-game-field/basic-game-field.component";
import {trackByEffect, trackBySkill, trackByUnit} from "../../helpers";

@Component({
    selector: 'game-field',
    imports: [CommonModule, PopoverModule, TabsModule, ProgressbarModule, AccordionModule, TooltipModule, BasicGameBoardComponent],
    templateUrl: './game-field.component.html',
    styleUrl: './game-field.component.scss'
})
export class GameFieldComponent extends BasicGameFieldComponent {
  constructor(fieldService: GameFieldService,
              unitService: UnitService,
              effectsService: EffectsService,
              gameActionService: GameService,
              gameLoggerService: GameLoggerService) {
    super(fieldService, unitService, effectsService, gameActionService, gameLoggerService);
  }

  protected readonly trackBySkill = trackBySkill;
  protected readonly trackByUnit = trackByUnit;
  protected readonly trackByEffect = trackByEffect;
}
