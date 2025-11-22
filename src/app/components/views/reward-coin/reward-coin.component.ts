import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ImageComponent } from '../image/image.component';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { Coin } from '../../../models/reward-based.model';

@Component({
  selector: 'app-reward-coin',
  imports: [ImageComponent, DecimalPipe, PercentPipe],
  templateUrl: './reward-coin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardCoinComponent {
  useFixSize = input<boolean>(false);
  coinConfig = input.required<Coin>();
  imageContainerClass = input('');
  containerClass = input('');
  convertToPercentage = input(false);
}
