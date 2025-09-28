import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayReward } from '../../services/reward/reward.service';
import { ImageComponent } from '../views/image/image.component';

@Component({
  selector: 'app-display-reward',
  imports: [CommonModule, ImageComponent],
  templateUrl: './display-reward.component.html',
  styleUrl: './display-reward.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayRewardComponent {
  rewards = model.required<(DisplayReward | null)[]>();

  cards = computed(() => this.rewards());
  cardsPrize = computed(() => {
    const total: Record<string, Record<any, any>> = {};

    this.rewards()
      .filter(e => !!e)
      .forEach(reward => {
        if (total[reward?.name]) {
          total[reward?.name] = {
            src: reward?.src,
            amount: total[reward?.name]['amount'] + reward?.amount,
          };
        } else {
          total[reward?.name] = {
            src: reward?.src,
            amount: reward?.amount,
          };
        }
      });

    return Object.entries(total);
  });

  showOpenButton = computed(() => {
    return this.rewards()
      .filter(e => !!e)
      .every(e => e?.flipped === false);
  });

  showTotalReward = computed(() => {
    return this.rewards()
      .filter(e => !!e)
      .every(e => e?.flipped === true);
  });

  async revealAll() {
    for (let i = 0; i < this.rewards().length; i++) {
      await new Promise(r => setTimeout(r, 300));
      const reward = this.rewards()[i];

      if (reward) {
        this.rewards.update(model => {
          return model.map((_, index) => {
            return i === index
              ? {
                  ...reward,
                  flipped: true,
                }
              : _;
          });
        });
      }
    }
  }
}
