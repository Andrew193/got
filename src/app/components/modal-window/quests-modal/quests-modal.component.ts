import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { DynamicComponentConfig, HasFooterHost, ModalBase } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { QuestId } from '../../../../../server/types';
import { DailyQuestService } from '../../../services/facades/daily-quest/daily-quest.service';
import { CurrencyHelperService } from '../../../services/users/currency/helper/currency-helper.service';
import { RewardCoinComponent } from '../../views/reward-coin/reward-coin.component';

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

  readonly quests$ = this.dailyQuestService.quests$;
  readonly loading$ = this.dailyQuestService.loading$;
  readonly error$ = this.dailyQuestService.error$;

  ngOnInit() {
    this.dailyQuestService.loadQuests();
  }

  retry() {
    this.dailyQuestService.loadQuests();
  }

  onQuestClick(questId: QuestId) {
    this.dailyQuestService.claimQuestReward(questId);
  }

  getRewardCoins(reward: { copper: number; silver: number; gold: number }) {
    return this.currencyHelper.getCoins(reward).filter(c => c.amount > 0);
  }
}
