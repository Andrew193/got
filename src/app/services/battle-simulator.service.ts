import { inject, Injectable, ChangeDetectorRef, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameFieldService } from './game-related/game-field/game-field.service';
import { UnitService } from './unit/unit.service';
import { EffectsService } from './effects/effects.service';
import { GameService } from './game-related/game-action/game.service';
import { BattleStateService } from './game-related/battle-state/battle-state.service';
import { AutoFightService } from './game-related/auto-fight/auto-fight.service';
import { BattleResultService } from './game-related/battle-result/battle-result.service';
import { AiTurnService } from './game-related/ai-turn/ai-turn.service';
import { BasicGameFieldComposition } from '../components/abstract/basic-game-field/basic-game-field-composition';
import { GameResultsRedirectType, TileUnit } from '../models/field.model';
import { Currency } from './users/users.interfaces';
import { OutputEmitterRef } from '@angular/core';

// No-op ChangeDetectorRef — headless simulation requires no rendering
const noopCdRef = {
  markForCheck: () => {},
  detectChanges: () => {},
  checkNoChanges: () => {},
  detach: () => {},
  reattach: () => {},
  context: null,
} as unknown as ChangeDetectorRef;

function makeCapturingEmitter(): OutputEmitterRef<Parameters<GameResultsRedirectType>> & {
  captured: Parameters<GameResultsRedirectType> | null;
} {
  let captured: Parameters<GameResultsRedirectType> | null = null;

  return {
    get captured() {
      return captured;
    },
    emit(value: Parameters<GameResultsRedirectType>) {
      captured = value;
    },
    subscribe: () => ({ unsubscribe: () => {} }),
    destroyRef: null as any,
  } as any;
}

@Injectable({ providedIn: 'root' })
export class BattleSimulatorService {
  private fieldService = inject(GameFieldService);
  private unitService = inject(UnitService);
  private effectsService = inject(EffectsService);
  private gameService = inject(GameService);
  private battleStateService = inject(BattleStateService);
  private autoFightService = inject(AutoFightService);
  private battleResultService = inject(BattleResultService);
  private aiTurnService = inject(AiTurnService);
  private store = inject(Store);

  isSimulating = signal(false);

  simulate(
    userUnits: TileUnit[],
    aiUnits: TileUnit[],
    rewardFn: (aiUnits: TileUnit[], userWon: boolean) => Currency,
  ): Currency {
    this.battleStateService.resetBattleState();
    this.battleResultService.headlessMode = true;

    const emitter = makeCapturingEmitter();
    let resultAiUnits: TileUnit[] = aiUnits;
    let resultUserWon = false;

    const noopRedirect: GameResultsRedirectType = () => {};

    const composition = new BasicGameFieldComposition(
      this.fieldService,
      this.unitService,
      this.effectsService,
      this.gameService,
      this.battleStateService,
      this.autoFightService,
      this.battleResultService,
      this.aiTurnService,
      this.store,
    );

    try {
      composition.skipFightOnlyStandaloneMode(userUnits, aiUnits, emitter, noopRedirect, noopCdRef);

      if (emitter.captured) {
        resultAiUnits = emitter.captured[0];
        resultUserWon = emitter.captured[1];
      }
    } finally {
      this.autoFightService.stopAutoFight();
      this.battleStateService.resetBattleState();
      this.battleResultService.headlessMode = false;
    }

    return rewardFn(resultAiUnits, resultUserWon);
  }
}
