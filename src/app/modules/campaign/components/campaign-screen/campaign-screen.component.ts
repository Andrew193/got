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

  battleSelected = output<CampaignBattleConfig>();

  isSelected = computed(() => {
    const id = this.selectedBattleId();

    return (battle: CampaignBattleConfig) => battle.id === id;
  });

  isLocked = computed(() => {
    const unlockedId = this.unlockedBattleId() || '';

    return (battleConfig: CampaignBattleConfig) => {
      if (battleConfig.id && unlockedId) {
        const [difficulty, screen, battle] = battleConfig.id.split('-');
        const [selectedDifficulty, selectedScreen, selectedBattle] = unlockedId.split('-');

        const dIndex =
          BattleDifficultyNumbers[selectedDifficulty as BattleDifficultyNumbersKeys] >=
          BattleDifficultyNumbers[difficulty as BattleDifficultyNumbersKeys];
        const sIndex = selectedScreen.replace(/\D/g, '') >= screen.replace(/\D/g, '');
        const bIndex = selectedBattle.replace(/\D/g, '') >= battle.replace(/\D/g, '');

        return !(dIndex && sIndex && bIndex);
      }

      return true;
    };
  });

  onBattleClicked(battle: CampaignBattleConfig) {
    this.battleSelected.emit(battle);
  }
}
