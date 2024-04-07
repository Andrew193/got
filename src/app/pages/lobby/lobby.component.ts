import { Component } from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {GameFieldComponent} from "../../components/game-field/game-field.component";
import {DailyRewardComponent} from "../../components/daily-reward/daily-reward.component";
import {CommonModule} from "@angular/common";
import {frontRoutes} from "../../app.routes";
import {interval, merge, Observable, of, startWith, switchMap, tap, withLatestFrom} from "rxjs";

interface route {
  name: string,
  url: string,
  src: string
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [
    GameFieldComponent,
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
    {name:"Таверна", url: frontRoutes.taverna, src: "taverna.png"},
    {name:"Казармы", url: "#", src: "barracks.png"},
    {name:"Тренировочный Лагерь", url: frontRoutes.training, src: "weightlifting.png"},
    {name:"Банкетный Зал", url: "#", src: "banquet.png"},
    {name:"Великое Древо", url: "#", src: "tree.png"},
    {name:"Сторожка", url: "#", src: "knight.png"},
    {name:"За Стену", url: frontRoutes.battleField, src: "wall.png"}
  ]

  constructor(private router: Router) {
    const observable1 =  new Observable((subscriber)=> {
      setTimeout(()=>{
        subscriber.next("Test 2(2)")
      }, 12000)
    });
    const observable2 = new Observable((subscriber)=> {
      setTimeout(()=>{
        subscriber.next("second 2(2)")
      }, 10000)
    });

    merge(
      observable1,
      observable2
    ).pipe(
      withLatestFrom(
        observable1,
        observable2
      )
    ).subscribe((test)=>{
      console.log(test, "test")
    });
  }

  public openSummonTree = () => {
    this.router.navigate([frontRoutes.summonTree])
  }

  public openGiftLand = () => {
    this.router.navigate([frontRoutes.giftStore])
  }

  public showDailyReward = () => {
    this.isShowDailyReward = !this.isShowDailyReward;
  }

  public closePopup = () => {
    this.showDailyReward();
  }
}
