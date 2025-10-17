import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { ImageComponent } from '../views/image/image.component';
import { DecimalPipe } from '@angular/common';
import { CardComponent } from './card/card.component';
import { DisplayRewardNames } from '../../store/store.interfaces';
import { Store } from '@ngrx/store';
import { setDisplayRewardCartState } from '../../store/actions/display-reward.actions';
import {
  selectAllCardsFlipped,
  selectCardCollection,
} from '../../store/reducers/display-reward.reducer';

type InnerTotal = {
  src: string;
  amount: number;
};

@Component({
  selector: 'app-display-reward',
  imports: [ImageComponent, DecimalPipe, CardComponent],
  templateUrl: './display-reward.component.html',
  styleUrl: './display-reward.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayRewardComponent {
  store = inject(Store);

  contextName = input.required<DisplayRewardNames>();

  containerClass = input('m-2');
  imageClass = input('');
  showTotalBar = input(true);

  allRevealed = output<boolean>();

  rewards = computed(() => this.store.selectSignal(selectCardCollection(this.contextName()))());

  cardsPrize = computed(() => {
    const total: Record<string, InnerTotal> = {};

    this.rewards()
      .filter(e => !!e)
      .forEach(reward => {
        total[reward?.name] = {
          src: reward?.src,
          amount: (total[reward?.name]?.['amount'] || 0) + reward?.amount,
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
    return this.store.selectSignal(selectAllCardsFlipped(this.contextName()))();
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
      this.store.dispatch(
        setDisplayRewardCartState({
          name: this.contextName(),
          index: i,
          data: {
            ...reward,
            flipped: true,
          },
        }),
      );
    }
  }
}
