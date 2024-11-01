import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {GameEntryPointComponent} from "../../../components/game-entry-point/game-entry-point.component";
import {ActivatedRoute} from "@angular/router";
import {Unit} from "../../../models/unit.model";

@Component({
  selector: 'app-battlefield',
  standalone: true,
  imports: [
    CommonModule,
    GameEntryPointComponent
  ],
  templateUrl: './daily-boss-battlefield.component.html',
  styleUrl: './daily-boss-battlefield.component.scss'
})
export class DailyBossBattlefieldComponent {
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe((value)=>{
      console.log(value['bossLevel'])
    })
  }
}
