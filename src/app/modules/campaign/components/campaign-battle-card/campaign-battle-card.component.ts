import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { CampaignBattleConfig } from '../../models/campaign.models';
import { ContainerLabelComponent } from '../../../../components/views/container-label/container-label.component';

@Component({
  selector: 'app-campaign-battle-card',
  standalone: true,
  imports: [NgClass, ContainerLabelComponent],
  templateUrl: './campaign-battle-card.component.html',
  styleUrl: './campaign-battle-card.component.scss',
})
export class CampaignBattleCardComponent {
  battle = input.required<CampaignBattleConfig>();
  isSelected = input<boolean>(false);
  isLocked = input<boolean>(false);

  cardClicked = output<CampaignBattleConfig>();

  onClick() {
    if (this.isLocked()) {
      return;
    }

    this.cardClicked.emit(this.battle());
  }
}
