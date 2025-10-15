import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
} from '@angular/core';
import { DisplayReward } from '../../services/reward/reward.service';
import { ImageComponent } from '../views/image/image.component';
import { DecimalPipe } from '@angular/common';

type InnerTotal = {
  src: string;
  amount: number;
};

@Component({
  selector: 'app-display-reward',
  imports: [ImageComponent, DecimalPipe],
  templateUrl: './display-reward.component.html',
  styleUrl: './display-reward.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayRewardComponent {
  containerClass = input('m-2');
  imageClass = input('');
  showTotalBar = input(true);
  rewards = model.required<(DisplayReward | null)[]>();
  allRevealed = output<boolean>();

  cards = computed(() => this.rewards());
  cardsPrize = computed(() => {
    const total: Record<string, InnerTotal> = {};

    this.rewards()
      .filter(e => !!e)
      .forEach(reward => {
        total[reward?.name] = {
          src: reward?.src,
          amount: (total[reward?.name]['amount'] || 0) + reward?.amount,
        };
      });

    return Object.entries(total);
  });

  showOpenButton = computed(() => this.testRewards(false));

  showTotalReward = computed(() => {
    const config = this.showTotalBar();

    return config ? this.testRewards(true) : false;
  });

  private allFlipped = computed(() => {
    const arr = this.rewards().filter(Boolean) as DisplayReward[];

    return arr.length > 0 && arr.every(r => r.flipped);
  });

  constructor() {
    let prev = false;

    effect(() => {
      const now = this.allFlipped();

      if (now && !prev) {
        this.allRevealed.emit(true);
      }

      prev = now;
    });
  }

  private testRewards(shouldBeFlipped: boolean) {
    const _rewards = this.rewards();

    if (_rewards.length) {
      return _rewards.filter(e => !!e).every(e => e.flipped === shouldBeFlipped);
    }

    return false;
  }

  async revealAll() {
    for (let i = 0; i < this.rewards().length; i++) {
      await new Promise(r => setTimeout(r, 300));
      this.revealOne(i);
    }
  }

  protected revealOne(i: number) {
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
