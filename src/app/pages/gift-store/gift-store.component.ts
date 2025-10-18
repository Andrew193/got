import { Component, inject, OnInit } from '@angular/core';
import { GameEntryPointComponent } from '../../components/game-entry-point/game-entry-point.component';
import { GiftNpcService } from '../../services/gift-npc/gift-npc.service';
import {
  basicRewardNames,
  DisplayReward,
  RewardService,
} from '../../services/reward/reward.service';
import { DisplayRewardComponent } from '../../components/display-reward/display-reward.component';
import { GiftService } from '../../services/gift/gift.service';
import { tap } from 'rxjs';
import { TODAY } from '../../constants';
import {
  NotificationsService,
  NotificationType,
} from '../../services/notifications/notifications.service';
import { GiftConfig } from '../../models/gift.model';
import { UsersService } from '../../services/users/users.service';
import { Currency } from '../../services/users/users.interfaces';
import { TileUnit, TileUnitWithReward } from '../../models/field.model';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { DisplayRewardNames } from '../../store/store.interfaces';
import { Store } from '@ngrx/store';
import { setDisplayRewardState } from '../../store/actions/display-reward.actions';
import { selectCardCollection } from '../../store/reducers/display-reward.reducer';

@Component({
  selector: 'app-gift-store',
  imports: [GameEntryPointComponent, DisplayRewardComponent],
  templateUrl: './gift-store.component.html',
  styleUrl: './gift-store.component.scss',
})
export class GiftStoreComponent implements OnInit {
  store = inject(Store);
  notificationService = inject(NotificationsService);
  nav = inject(NavigationService);
  contextName = DisplayRewardNames.gift;
  loot = this.store.selectSignal(selectCardCollection(this.contextName));

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
  ) {
    this.init();
  }

  ngOnInit(): void {
    this.giftService._data.subscribe(config => {
      this.giftConfig = { ...config, userId: config.userId };
    });
  }

  init() {
    this.userUnits = [
      this.npcService.convertToTileUnit(this.npcService.getUserForNPC({ x: 0, y: 0 })),
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

        return elType.name === basicRewardNames.special0
          ? {
              ...this.npcService.getWildling(),
              x: el.x,
              y: el.y,
              reward: this.npcService.getSpecialGiftReward(),
              user: false,
              healer: el.healer || false,
              onlyHealer: el.onlyHealer || false,
            }
          : el;
      });
  }

  collectAndLeave(loot: DisplayReward[]) {
    const reward: Currency = {
      gold: 0,
      silver: 0,
      copper: 0,
    };

    const chestsReward = loot
      .filter(el => el?.name === basicRewardNames.chest)
      .map(() => this.npcService.getChestReward());
    const otherRewards = loot.filter(el => el?.name !== basicRewardNames.chest);
    const allRewards = [...chestsReward, ...otherRewards].filter(el => !!el) as DisplayReward[];

    allRewards.forEach(el => {
      const name = (el.name[0].toLowerCase() + el.name.slice(1)) as 'gold' | 'silver' | 'copper';

      reward[name] = reward[name] + el.amount;
    });

    const newCurrency = this.usersService.updateCurrency(reward, {
      returnObs: true,
    });

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
                this.goToMainPage();
              },
            );
          },
        }),
      )
      .subscribe();
  }

  goToMainPage() {
    this.nav.goToMainPage();
  }

  public gameResultsRedirect = (realAiUnits: TileUnitWithReward[] | TileUnit[]) => {
    const loot = this.aiUnits.map((el, index) => ({
      ...el.reward,
      amount: !realAiUnits[index].health ? el.reward.amount : 0,
    }));

    this.store.dispatch(setDisplayRewardState({ name: this.contextName, data: loot }));
  };
}
