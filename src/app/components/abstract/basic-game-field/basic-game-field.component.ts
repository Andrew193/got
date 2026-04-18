import { ChangeDetectorRef, Component, inject, OnDestroy, output } from '@angular/core';
import { GameFieldService } from '../../../services/game-related/game-field/game-field.service';
import { UnitService } from '../../../services/unit/unit.service';
import { EffectsService } from '../../../services/effects/effects.service';
import { GameService } from '../../../services/game-related/game-action/game.service';
import { BasicGameFieldComposition } from './basic-game-field-composition';
import { GameResultsRedirectType } from '../../../models/field.model';
import { Store } from '@ngrx/store';
import { BattleStateService } from '../../../services/game-related/battle-state/battle-state.service';
import { AutoFightService } from '../../../services/game-related/auto-fight/auto-fight.service';
import { BattleResultService } from '../../../services/game-related/battle-result/battle-result.service';
import { AiTurnService } from '../../../services/game-related/ai-turn/ai-turn.service';

@Component({
  selector: 'app-basic-game-field',
  template: '',
})
export abstract class BasicGameFieldComponent
  extends BasicGameFieldComposition
  implements OnDestroy
{
  override cdRef = inject(ChangeDetectorRef);
  override battleEndFlag = output<Parameters<GameResultsRedirectType>>();

  constructor(
    fieldService: GameFieldService,
    unitService: UnitService,
    eS: EffectsService,
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
      eS,
      gameActionService,
      battleStateS,
      autoFightS,
      battleResultS,
      aiTurnS,
      store,
    );
  }

  ngOnDestroy(): void {
    this.autoFightS.stopAutoFight();
    this.battleStateS.resetBattleState();
  }
}
