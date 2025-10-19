import { Component, inject, input, OnInit, output, Signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ImageComponent } from '../../views/image/image.component';
import { Store } from '@ngrx/store';
import { selectCardState } from '../../../store/reducers/display-reward.reducer';
import { DisplayRewardNames } from '../../../store/store.interfaces';
import { DisplayReward } from '../../../services/reward/reward.service';

@Component({
  selector: 'app-card',
  imports: [DecimalPipe, ImageComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
  store = inject(Store);

  card!: Signal<DisplayReward>;

  imageClass = input('');
  cardCollectionName = input.required<DisplayRewardNames>();
  index = input.required<number>();

  revealOne = output<number>();

  ngOnInit() {
    const name = this.cardCollectionName();
    const index = this.index();

    this.card = this.store.selectSignal(selectCardState(name, index));
  }
}
