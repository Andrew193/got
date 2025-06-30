import {Component} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";
import {CommonModule} from "@angular/common";
import {frontRoutes} from "../../constants";

interface route {
  name: string,
  url: string,
  src: string
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    DailyRewardComponent,
    CommonModule,
    RouterModule
  ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  isShowDailyReward = false;

  pageRoutes: route[] = [
    {name: "Таверна", url: frontRoutes.taverna, src: "taverna.png"},
    {name: "Казармы", url: "#", src: "barracks.png"},
    {name: "Тренировочный Лагерь", url: frontRoutes.training, src: "weightlifting.png"},
    {name: "Банкетный Зал", url: "#", src: "banquet.png"},
    {name: "Великое Древо", url: "#", src: "tree.png"},
    {name: "Сторожка", url: "#", src: "knight.png"},
    {name: "За Стену", url: frontRoutes.battleField, src: "wall.png"}
  ]

  constructor(private router: Router) {
  }

  public openSummonTree = () => {
    this.router.navigate([frontRoutes.summonTree])
  }

  public openGiftLand = () => {
    this.router.navigate([frontRoutes.giftStore])
  }

  public openDailyBoss = () => {
    this.router.navigate([frontRoutes.dailyBoss])
  }

  public showDailyReward = () => {
    this.isShowDailyReward = !this.isShowDailyReward;
  }

  public closePopup = () => {
    this.showDailyReward();
  }
}
