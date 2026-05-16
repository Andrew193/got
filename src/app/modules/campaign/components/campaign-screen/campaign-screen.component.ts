import { Component, computed, input, output } from '@angular/core';
import { CampaignBattleConfig } from '../../models/campaign.models';
import { CampaignBattleCardComponent } from '../campaign-battle-card/campaign-battle-card.component';
import {
  BattleDifficultyNumbers,
  BattleDifficultyNumbersKeys,
} from '../../../../services/abstract/battle-rewards/battle-rewards.service';

@Component({
  selector: 'app-campaign-screen',
  standalone: true,
  imports: [CampaignBattleCardComponent],
  templateUrl: './campaign-screen.component.html',
  styleUrl: './campaign-screen.component.scss',
})
export class CampaignScreenComponent {
  battles = input.required<CampaignBattleConfig[]>();
  selectedBattleId = input<string | null>(null);
  unlockedBattleId = input<string | null>(null);
  isLockedFn = input<((battle: CampaignBattleConfig) => boolean) | null>(null);
  overScreenReaction = input(false);
  fullMatch = input(false);

  battleSelected = output<CampaignBattleConfig>();

  isSelected = computed(() => {
    const id = this.selectedBattleId();

    return (battle: CampaignBattleConfig) => battle.id === id;
  });

  isLocked = computed(() => {
    const unlockedId = this.unlockedBattleId() || '';
    const fullMatch = this.fullMatch();
    const overScreenReaction = this.overScreenReaction();

    return (battleConfig: CampaignBattleConfig) => {
      const [difficulty, ...rest] = battleConfig.id.split('-');
      const [selectedDifficulty, ...secondRest] = unlockedId.split('-');

      if (unlockedId) {
        const screen = rest[rest.length - 2];
        const selectedScreen = secondRest[secondRest.length - 2];

        const battle = rest[rest.length - 1];
        const selectedBattle = secondRest[secondRest.length - 1];

        const dOne =
          BattleDifficultyNumbers[selectedDifficulty as BattleDifficultyNumbersKeys] || 0;
        const dTwo = BattleDifficultyNumbers[difficulty as BattleDifficultyNumbersKeys] || 0;

        const dIndex = dOne >= dTwo;

        const selectedScreenNumder = +selectedScreen.replace(/\D/g, '');
        const screenNumber = +screen.replace(/\D/g, '');

        const sIndex = selectedScreenNumder >= screenNumber;
        const bIndex = selectedBattle.replace(/\D/g, '') >= battle.replace(/\D/g, '');

        if (!fullMatch) {
          if (selectedScreenNumder > screenNumber && dIndex) {
            return {
              locked: overScreenReaction,
              label: overScreenReaction ? 'Can not be replayed' : '',
            };
          }

          return !(dIndex && sIndex && bIndex);
        } else if (fullMatch) {
          return {
            locked: battleConfig.id !== unlockedId,
            label: overScreenReaction && sIndex && bIndex ? 'Can not be replayed' : '',
          };
        }
      }

      return true;
    };
  });

  onBattleClicked(battle: CampaignBattleConfig) {
    this.battleSelected.emit(battle);
  }
}
