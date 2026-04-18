import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { GameFieldService } from '../../services/game-related/game-field/game-field.service';
import { GameService } from '../../services/game-related/game-action/game.service';
import { EffectsService } from '../../services/effects/effects.service';
import { UnitService } from '../../services/unit/unit.service';
import { BasicGameBoardComponent } from '../basic-game-board/basic-game-board.component';
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
import { GameResultsRedirectType, TileUnit } from '../../models/field.model';
import { Store } from '@ngrx/store';
import { BattleStateService } from '../../services/game-related/battle-state/battle-state.service';
import { AutoFightService } from '../../services/game-related/auto-fight/auto-fight.service';
import { BattleResultService } from '../../services/game-related/battle-result/battle-result.service';
import { AiTurnService } from '../../services/game-related/ai-turn/ai-turn.service';

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
  @Input() override userUnits: TileUnit[] = [];
  @Input() override aiUnits: TileUnit[] = [];
  @Input() override battleMode = true;
  @Input() override gameResultsRedirect: GameResultsRedirectType = () => {};

  override battleEndFlag = output<Parameters<GameResultsRedirectType>>();

  constructor(
    fieldService: GameFieldService,
    unitService: UnitService,
    effectsService: EffectsService,
    gameActionService: GameService,
    battleStateS: BattleStateService,
    autoFightS: AutoFightService,
    battleResultS: BattleResultService,
    aiTurnS: AiTurnService,
    store: Store,
  ) {
    super(
      fieldService,
      unitService,
      effectsService,
      gameActionService,
      battleStateS,
      autoFightS,
      battleResultS,
      aiTurnS,
      store,
    );
  }
}
