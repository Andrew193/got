import { inject, Injectable, OutputEmitterRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { BattleStateService } from '../battle-state/battle-state.service';
import { GameService } from '../game-action/game.service';
import { ModalWindowService } from '../../modal/modal-window.service';
import { GameResultsRedirectType, TileUnit } from '../../../models/field.model';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import {
  AfterBattleComponent,
  AfterBattleData,
} from '../../../components/modal-window/after-battle/after-battle.component';
import { selectBattleReward } from '../../../store/reducers/game-board.reducer';

export interface BattleEndResult {
  battleEnded: boolean;
  winner: 'user' | 'ai' | null;
  reason: 'all_dead' | 'max_turns' | 'none';
}

@Injectable({ providedIn: 'root' })
export class BattleResultService {
  private battleStateService = inject(BattleStateService);
  private gameService = inject(GameService);
  private modalWindowService = inject(ModalWindowService);
  private store = inject(Store);

  checkBattleEnd(userUnits: TileUnit[], aiUnits: TileUnit[]): BattleEndResult {
    // Guard against null/undefined unit arrays
    if (!userUnits || !aiUnits) {
      return { battleEnded: false, winner: null, reason: 'none' };
    }

    // Check if all units of one team are dead
    const allUserDead = this.gameService.isDead(userUnits);
    const allAiDead = this.gameService.isDead(aiUnits);

    if (allUserDead || allAiDead) {
      return {
        battleEnded: true,
        winner: allUserDead ? 'ai' : 'user',
        reason: 'all_dead',
      };
    }

    // Check if max turns reached
    if (this.battleStateService.turnCount >= this.battleStateService.maxTurnCount) {
      const winner = this.determineWinnerByDamage();

      return {
        battleEnded: true,
        winner,
        reason: 'max_turns',
      };
    }

    // Battle continues
    return {
      battleEnded: false,
      winner: null,
      reason: 'none',
    };
  }

  determineWinnerByDamage(): 'user' | 'ai' {
    const userDamage = this.battleStateService.userTotalDamage;
    const aiDamage = this.battleStateService.aiTotalDamage;

    // User wins only if dealt strictly more damage
    if (userDamage > aiDamage) {
      return 'user';
    }

    // AI wins if dealt more damage OR damage is equal (tie goes to AI)
    return 'ai';
  }

  showBattleResult(
    result: BattleEndResult,
    realAiUnits: TileUnit[],
    callback: GameResultsRedirectType,
    rewardSetter: OutputEmitterRef<Parameters<GameResultsRedirectType>>,
  ): void {
    debugger;
    if (!result.battleEnded) return;

    const userWon = result.winner === 'user';

    // Emit reward calculation — this triggers the store update
    rewardSetter.emit([realAiUnits, userWon]);

    const headerClass = userWon ? 'green-b' : 'red-b';
    const headerMessage = this.getHeaderMessage(result);

    // Open modal — reward is read lazily inside callbacks
    const config = this.modalWindowService.getModalConfig(
      headerClass,
      headerMessage,
      {
        closeBtnLabel: userWon ? 'Great' : 'Try again later',
      },
      {
        callback: () => {
          const reward = this.store.selectSignal(selectBattleReward())();

          callback(realAiUnits, userWon, reward);
        },
        strategy: ModalStrategiesTypes.component,
        component: AfterBattleComponent,
        data: {
          reward: this.store.selectSignal(selectBattleReward())(),
          headerMessage,
          headerClass,
        } satisfies AfterBattleData,
      },
    );

    this.modalWindowService.openModal(config);
  }

  private getHeaderMessage(result: BattleEndResult): string {
    const userWon = result.winner === 'user';

    if (result.reason === 'all_dead') {
      return userWon ? 'You won' : 'You lost';
    }

    if (result.reason === 'max_turns') {
      const userDamage = this.battleStateService.userTotalDamage;
      const aiDamage = this.battleStateService.aiTotalDamage;

      if (userWon) {
        return `You won by damage (${userDamage} vs ${aiDamage})`;
      } else {
        return `You lost by damage (${userDamage} vs ${aiDamage})`;
      }
    }

    return userWon ? 'You won' : 'You lost';
  }
}
