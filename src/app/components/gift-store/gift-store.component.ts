import {Component, OnInit} from '@angular/core';
import {GiftConfig, UnitWithReward} from "../../interface";
import {BasicGameBoardComponent} from "../basic-game-board/basic-game-board.component";
import {GameEntryPointComponent} from "../game-entry-point/game-entry-point.component";
import {NgIf} from "@angular/common";
import {NpcService} from "../../services/npc/npc.service";
import {DisplayReward, RewardService} from "../../services/reward/reward.service";
import {DisplayRewardComponent} from "../display-reward/display-reward.component";
import {Router, RouterLink} from "@angular/router";
import {GiftService} from "../../services/gift/gift.service";
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
  loot: (DisplayReward | null)[] = [];
  aiUnits: UnitWithReward[] = [];
  userUnits: Unit[] = [];
  giftConfig!: GiftConfig;

  items = [
    {name: '1', probability: 0.9},
    {name: '0', probability: 0.1},
  ];

  constructor(private npcService: NpcService,
              private giftService: GiftService,
              private rewardService: RewardService,
              private router: Router) {

    this.userUnits.push({...this.npcService.getUser(), attackRange: 1, x: 0, y: 0, inBattle: true});
    this.npcService.getGiftNPC().map((el) => ({...el, imgSrc: el.reward.src, user: false, canMove: false}))
      .forEach((el, index, elements) => {
        const elType = this.rewardService.getReward(1, this.items)[0];
        this.aiUnits.push(elType.name === '0' ? {
          ...this.npcService.getWildling(),
          x: el.x,
          y: el.y,
          reward: this.npcService.getSpecialGiftReward(),
          inBattle: true
        } : el);
      })
  }

  ngOnInit(): void {
    this.giftService.getGiftRewardConfig((config, userId) => {
      this.giftConfig = {...(config || {}), userId};
      if (this.giftConfig.lastVist && this.giftConfig.lastVist === moment().format("MM/DD/YYYY")) {
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

  public gameResultsRedirect = (realAiUnits: Unit[]) => {
    this.loot = this.aiUnits.map((el, index) => {
      return !realAiUnits[index].health ? el.reward: null
    })
  }
}
