import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DynamicComponentConfig, HasFooterHost, ModalBase } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { QuestId } from '../../../../../server/types';
import { DailyQuestService } from '../../../services/facades/daily-quest/daily-quest.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { RewardCoinComponent } from '../../views/reward-coin/reward-coin.component';
import { Currency } from '../../../services/users/users.interfaces';
import { Quest } from '../../../models/daily-quest.model';
import { UsersService } from '../../../services/users/users.service';

@Component({
  selector: 'app-quests-modal',
  imports: [AsyncPipe, RewardCoinComponent],
  templateUrl: './quests-modal.component.html',
  styleUrl: './quests-modal.component.scss',
})
export class QuestsModalComponent implements Partial<HasFooterHost>, OnInit {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  data = inject<DynamicComponentConfig<ModalBase>>(DYNAMIC_COMPONENT_DATA);

  private dailyQuestService = inject(DailyQuestService);
  private currencyHelper = inject(CurrencyHelperService);
  private userService = inject(UsersService);

  readonly quests$ = this.dailyQuestService.quests$;
  readonly loading$ = this.dailyQuestService.loading$;
  readonly error$ = this.dailyQuestService.error$;

  specialBonus: Currency = {
    gold: 100,
    silver: 500,
    copper: 150000,
  };

  canClaimSpecialBonus(quests: Quest[]) {
    return quests.filter(quest => quest.status === 'claimed').length === quests.length - 1;
  }

  ngOnInit() {
    this.dailyQuestService.loadQuests();
  }

  retry() {
    this.dailyQuestService.loadQuests();
  }

  onQuestClick(questId: QuestId, quests: Quest[]) {
    this.dailyQuestService.claimQuestReward(questId);

    if (this.canClaimSpecialBonus(quests)) {
      setTimeout(() => {
        this.userService.updateCurrency(this.specialBonus);
      }, 1000);
    }
  }

  getRewardCoins(reward: { copper: number; silver: number; gold: number }) {
    return this.currencyHelper.getCoins(reward).filter(c => c.amount > 0);
  }
}
