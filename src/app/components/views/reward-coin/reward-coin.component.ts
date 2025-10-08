import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ImageComponent } from '../image/image.component';
import { DecimalPipe } from '@angular/common';
import { Coin } from '../../../models/reward-based.model';

@Component({
  selector: 'app-reward-coin',
  imports: [ImageComponent, DecimalPipe],
  templateUrl: './reward-coin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardCoinComponent {
  useFixSize = input<boolean>(false);
  coinConfig = input.required<Coin>();
  imageContainerClass = input('');
}
