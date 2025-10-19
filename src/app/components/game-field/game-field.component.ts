import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameFieldService } from '../../services/game-field/game-field.service';
import { GameService } from '../../services/game-action/game.service';
import { EffectsService } from '../../services/effects/effects.service';
import { UnitService } from '../../services/unit/unit.service';
import { BasicGameBoardComponent } from '../basic-game-board/basic-game-board.component';
import { GameLoggerService } from '../../services/game-logger/logger.service';
import { BasicGameFieldComponent } from '../abstract/basic-game-field/basic-game-field.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-game-field',
  imports: [
    BasicGameBoardComponent,
    NgClass,
    NgTemplateOutlet,
    MatTab,
    MatTabGroup,
    MatTabLabel,
    MatExpansionPanelHeader,
    MatExpansionPanel,
    MatTooltip,
    MatProgressBar,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameFieldComponent extends BasicGameFieldComponent {
  constructor(
    fieldService: GameFieldService,
    unitService: UnitService,
    effectsService: EffectsService,
    gameActionService: GameService,
    gameLoggerService: GameLoggerService,
  ) {
    super(fieldService, unitService, effectsService, gameActionService, gameLoggerService);
  }
}
