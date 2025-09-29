import { Component, inject, OnInit } from '@angular/core';
import { GameEntryPointComponent } from '../../components/game-entry-point/game-entry-point.component';
import { GiftNpcService } from '../../services/gift-npc/gift-npc.service';
import { DisplayReward, RewardService } from '../../services/reward/reward.service';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';
import { Router, RouterLink } from '@angular/router';
import { GiftService } from '../../services/gift/gift.service';
import { Observable, tap } from 'rxjs';
import { TODAY } from '../../constants';
import {
  NotificationsService,
  NotificationType,
} from '../../services/notifications/notifications.service';
import { GiftConfig } from '../../models/gift.model';
import { UsersService } from '../../services/users/users.service';
import { Currency } from '../../services/users/users.interfaces';
import { TileUnit, TileUnitWithReward } from '../../models/field.model';

@Component({
  selector: 'app-gift-store',
  imports: [GameEntryPointComponent, DisplayRewardComponent, RouterLink],
  templateUrl: './gift-store.component.html',
  styleUrl: './gift-store.component.scss',
})
export class GiftStoreComponent implements OnInit {
  notificationService = inject(NotificationsService);

  loot: (DisplayReward | null)[] = [];
  aiUnits: TileUnitWithReward[] = [];
  userUnits: TileUnit[] = [];
  private giftConfig!: GiftConfig;

  items = [
    { name: this.rewardService.rewardNames.special1, probability: 0.9 },
    { name: this.rewardService.rewardNames.special0, probability: 0.1 },
  ];

  constructor(
    private npcService: GiftNpcService,
    private giftService: GiftService,
    private usersService: UsersService,
    private rewardService: RewardService,
    private router: Router,
  ) {
    this.init();
  }

  ngOnInit(): void {
    this.giftService._data.subscribe(config => {
      this.giftConfig = structuredClone({ ...(config || {}), userId: config.userId });
    });
  }

  init() {
    this.userUnits = [
      this.npcService.convertToTileUnit({
        ...this.npcService.getUserForNPC(),
        x: 0,
        y: 0,
        inBattle: true,
      }),
    ];
    this.aiUnits = [];

    this.aiUnits = this.npcService
      .getGiftNPC()
      .map(el => ({
        ...el,
        imgSrc: el.reward.src,
        user: false,
        canMove: false,
        healer: el.healer || false,
        onlyHealer: el.onlyHealer || false,
      }))
      .map(el => {
        const elType = this.rewardService.getReward(1, this.items);

        return elType.name === 'Special 0'
          ? {
              ...this.npcService.getWildling(),
              x: el.x,
              y: el.y,
              reward: this.npcService.getSpecialGiftReward(),
              inBattle: true,
              user: false,
              healer: el.healer || false,
              onlyHealer: el.onlyHealer || false,
            }
          : el;
      });
  }

  collectAndLeave() {
    const reward: Currency = {
      gold: 0,
      silver: 0,
      cooper: 0,
    };

    const chestsReward = this.loot
      .filter(el => el?.name === 'Chest')
      .map(() => this.npcService.getChestReward());
    const otherRewards = this.loot.filter(el => el?.name !== 'Chest');
    const allRewards = [...chestsReward, ...otherRewards].filter(el => !!el) as DisplayReward[];

    allRewards.forEach(el => {
      const name = (el.name[0].toLowerCase() + el.name.slice(1)) as 'gold' | 'silver' | 'cooper';

      reward[name] = reward[name] + el.amount;
    });

    const newCurrency = this.usersService.updateCurrency(reward, {
      returnObs: true,
    }) as Observable<any>;

    newCurrency
      .pipe(
        tap({
          next: () => {
            this.giftService.claimGiftReward(
              {
                ...this.giftConfig,
                lastLogin: TODAY,
              },
              () => {
                this.notificationService.notificationsValue(NotificationType.gift_store, false);
                this.router.navigateByUrl('/');
              },
            );
          },
        }),
      )
      .subscribe();
  }

  public gameResultsRedirect = (realAiUnits: TileUnitWithReward[] | TileUnit[]) => {
    this.loot = this.aiUnits.map((el, index) => (!realAiUnits[index].health ? el.reward : null));
  };
}
