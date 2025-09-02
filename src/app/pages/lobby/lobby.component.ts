import {Component} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";
import {CommonModule} from "@angular/common";
import {frontRoutes} from "../../constants";
import {trackByRoute} from "../../helpers";
import {NotificationType} from "../../services/notifications/notifications.service";
import {NotificationMarkerComponent} from "../../directives/notification-marker/notification-marker.component";
import {ImageComponent} from "../../components/views/image/image.component";

export interface route {
  name: string,
  url: string,
  src: string
}

@Component({
    selector: 'app-lobby',
  imports: [
    DailyRewardComponent,
    CommonModule,
    RouterModule,
    NotificationMarkerComponent,
    ImageComponent
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

  public openIronBank = () => {
    this.router.navigateByUrl(frontRoutes.ironBank)
  }

  public openSummonTree = () => {
    this.router.navigateByUrl(frontRoutes.summonTree)
  }

  public openGiftLand = () => {
    this.router.navigateByUrl(frontRoutes.giftStore)
  }

  public openDailyBoss = () => {
    this.router.navigateByUrl(frontRoutes.dailyBoss)
  }

  public showDailyReward = () => {
    this.isShowDailyReward = !this.isShowDailyReward;
  }

  public closePopup = () => {
    this.showDailyReward();
  }

  protected readonly trackByRoute = trackByRoute;

  activities = [
    {name:'Поставки из Дара', src: 'icons/food', click: this.openGiftLand, notification: NotificationType.gift_store},
    {name:'Обмен с Кpастером', src: 'icons/towers'},
    {name:'Награды Древа', src: 'icons/tree', click: this.openSummonTree},
    {name:'Магазин Сторожки', src: 'icons/raven'},
    {name:'Магазин Арены', src: 'icons/arena-icon'},
    {name:'Награды за Стеной', src: 'icons/maps'},
    {name:'Награды Входа', src: 'UI_Avatar_Unit_Alvar', click: this.showDailyReward, notification: NotificationType.daily_reward},
    {name:'Железный Банк', src: 'gold', click: this.openIronBank},
    {name:'Ремесленики', src: 'silver'},
    {name:'Ежедневный Босс', src: 'UI_Avatar_Unit_PolarBear', click: this.openDailyBoss}
  ]
}
