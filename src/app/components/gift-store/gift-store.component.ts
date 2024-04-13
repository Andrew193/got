import {Component, OnInit} from '@angular/core';
import {UnitWithReward} from "../../interface";
import {BasicGameBoardComponent} from "../basic-game-board/basic-game-board.component";
import {GameEntryPointComponent} from "../game-entry-point/game-entry-point.component";
import {NgIf} from "@angular/common";
import {NpcService} from "../../services/npc/npc.service";
import {DisplayReward} from "../../services/reward/reward.service";
import {DisplayRewardComponent} from "../display-reward/display-reward.component";
import {Router, RouterLink} from "@angular/router";
import {GiftConfig, GiftService} from "../../services/gift/gift.service";
import moment from "moment/moment";
import {Unit} from "../../models/unit.model";

@Component({
  selector: 'app-gift-store',
  standalone: true,
  imports: [
    BasicGameBoardComponent,
    GameEntryPointComponent,
    NgIf,
    DisplayRewardComponent,
    RouterLink
  ],
  templateUrl: './gift-store.component.html',
  styleUrl: './gift-store.component.scss'
})

export class GiftStoreComponent implements OnInit {
  loot: DisplayReward[] = [];
  aiUnits: UnitWithReward[] = [];
  userUnits: Unit[] = [];
  giftConfig!: GiftConfig;

  constructor(private npcService: NpcService,
              private giftService: GiftService,
              private router: Router) {
    this.userUnits.push({...this.npcService.getUser(), attackRange: 1, x: 0, y: 0})
    this.npcService.getGiftNPC().map((el) => ({...el, imgSrc: el.reward.src}))
      .forEach((el) => {
        this.aiUnits.push(el)
      })
  }

  ngOnInit(): void {
    this.giftService.getGiftRewardConfig((config) => {
      this.giftConfig = config;
      if (this.giftConfig.lastVist === moment().format("MM/DD/YYYY")) {
        this.collectAndLeave();
      }
    });
  }

  collectAndLeave() {
    this.giftService.claimGiftReward({
      ...this.giftConfig,
      lastVist: moment().format("MM/DD/YYYY")
    }, () => {
      this.router.navigateByUrl('/')
    })
  }

  public gameResultsRedirect = () => {
    this.loot = this.aiUnits.map((el) => el.reward)
  }
}
