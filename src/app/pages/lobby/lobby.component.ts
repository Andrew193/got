import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {GameFieldComponent} from "../../components/game-field/game-field.component";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";
import {CommonModule} from "@angular/common";

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
    this.router.navigate(["taverna"])
  }

  openBattle() {
    this.router.navigate(["test-b"])
  }

  showDailyReward() {
    this.isShowDailyReward = !this.isShowDailyReward;
  }

  public closePopup = () => {
    this.showDailyReward();
  }
}
