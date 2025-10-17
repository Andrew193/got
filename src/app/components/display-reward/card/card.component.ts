import { Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ImageComponent } from '../../views/image/image.component';
import { Store } from '@ngrx/store';
import { selectCardState } from '../../../store/reducers/display-reward.reducer';
import { DisplayRewardNames } from '../../../store/store.interfaces';

@Component({
  selector: 'app-card',
  imports: [DecimalPipe, ImageComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  store = inject(Store);

  card = computed(() =>
    this.store.selectSignal(selectCardState(this.cardCollectionName(), this.index()))(),
  );

  imageClass = input('');
  cardCollectionName = input.required<DisplayRewardNames>();
  index = input.required<number>();

  revealOne = output<number>();
}
