import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BattleRewardCurrency, BattleRewardsConfig } from '../../../models/reward-based.model';

@Component({
  selector: 'app-battle-rewards-bar',
  imports: [DecimalPipe],
  templateUrl: './battle-rewards-bar.component.html',
  styleUrl: './battle-rewards-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattleRewardsBarComponent {
  rewardsConfig = input.required<BattleRewardsConfig<BattleRewardCurrency>>();
}
