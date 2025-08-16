import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {DisplayReward} from "../../services/reward/reward.service";
import {trackByIndex} from "../../helpers";
import {ImageComponent} from "../views/image/image.component";

@Component({
  selector: 'display-reward',
  imports: [
    CommonModule,
    ImageComponent
  ],
  templateUrl: './display-reward.component.html',
  styleUrl: './display-reward.component.scss'
})
export class DisplayRewardComponent {
  @Input() rewards: (DisplayReward | null)[] = [];

  protected readonly trackByIndex = trackByIndex;
}
