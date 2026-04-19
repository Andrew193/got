import { Component, computed, input, output } from '@angular/core';
import { CampaignBattleConfig } from '../../models/campaign.models';
import { CampaignBattleCardComponent } from '../campaign-battle-card/campaign-battle-card.component';

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

  battleSelected = output<CampaignBattleConfig>();

  isSelected = computed(() => {
    const id = this.selectedBattleId();

    return (battle: CampaignBattleConfig) => battle.id === id;
  });

  onBattleClicked(battle: CampaignBattleConfig) {
    this.battleSelected.emit(battle);
  }
}
