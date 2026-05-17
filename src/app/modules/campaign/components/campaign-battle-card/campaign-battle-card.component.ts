import { Component, computed, inject, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { CampaignBattleConfig } from '../../models/campaign.models';
import { ContainerLabelComponent } from '../../../../components/views/container-label/container-label.component';
import { MatIcon } from '@angular/material/icon';
import { ModalWindowService } from '../../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../../../components/modal-window/modal-interfaces';
import { BattleCardInformationComponent } from '../../../../components/modal-window/battle-card-information/battle-card-information.component';

@Component({
  selector: 'app-campaign-battle-card',
  standalone: true,
  imports: [NgClass, ContainerLabelComponent, MatIcon],
  templateUrl: './campaign-battle-card.component.html',
  styleUrl: './campaign-battle-card.component.scss',
})
export class CampaignBattleCardComponent {
  private readonly modalService = inject(ModalWindowService);

  battle = input.required<CampaignBattleConfig>();
  isSelected = input<boolean>(false);
  isLocked = input<boolean | { locked: boolean; label: string }>(false);
  isLockedConfig = computed(() => {
    const isLocked = this.isLocked();

    return typeof isLocked === 'object' ? isLocked : { locked: isLocked, label: '' };
  });

  cardClicked = output<CampaignBattleConfig>();

  onClick() {
    if (this.isLockedConfig().locked) {
      return;
    }

    this.cardClicked.emit(this.battle());
  }

  openBattleInformationModal(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    this.modalService.openModal(
      this.modalService.getModalConfig(
        '',
        'Battle Information',
        { closeBtnLabel: 'Battle Information' },
        {
          strategy: ModalStrategiesTypes.component,
          component: BattleCardInformationComponent,
          data: { battleInformation: this.battle() },
        },
      ),
    );
  }
}
