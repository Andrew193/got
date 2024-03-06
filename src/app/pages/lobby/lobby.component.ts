import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {GameFieldComponent} from "../../components/game-field/game-field.component";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    GameFieldComponent,
    DailyRewardComponent
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {

  constructor(private router: Router) {
  }
  openTaverna() {
    this.router.navigate(["taverna"])
  }

  openBattle() {
    this.router.navigate(["test-b"])
  }
}
