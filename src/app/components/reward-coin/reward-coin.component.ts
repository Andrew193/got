import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {ImageComponent} from "../views/image/image.component";
import {DecimalPipe} from "@angular/common";

@Component({
  selector: 'app-reward-coin',
  imports: [
    ImageComponent,
    DecimalPipe
  ],
  templateUrl: './reward-coin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardCoinComponent {
  useFixSize = input<boolean>(false);
  coinConfig = input.required<{ class: string, imgSrc: string, alt: string, amount: number }>();
}
