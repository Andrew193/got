import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {GameFieldComponent} from "../../components/game-field/game-field.component";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";
import {CommonModule} from "@angular/common";
import {frontRoutes} from "../../app.routes";

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    GameFieldComponent,
    DailyRewardComponent,
    CommonModule
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  isShowDailyReward = false;

  constructor(private router: Router) {
  }
  openTaverna() {
    this.router.navigate([frontRoutes.taverna])
  }

  openTraining() {
    this.router.navigate([frontRoutes.training])
  }

  openSummonTree() {
    this.router.navigate([frontRoutes.summonTree])
  }

  openGiftLand() {
    this.router.navigate([frontRoutes.giftStore])
  }

  openBattle() {
    this.router.navigate([frontRoutes.battleField])
  }

  showDailyReward() {
    this.isShowDailyReward = !this.isShowDailyReward;
  }

  public closePopup = () => {
    this.showDailyReward();
  }
}
