import { inject, Injectable } from '@angular/core';
import { NavigationService } from '../facades/navigation/navigation.service';
import { Store } from '@ngrx/store';
import { toggleDailyReward } from '../../store/actions/lobby.actions';
import { NotificationType } from '../notifications/notifications.service';
import { ShortcutNotation, ShortcutNotationTriggers } from '../../models/shortcut/shortcut.model';
import { frontRoutes } from '../../constants';
import { Route } from '../../pages/lobby/lobby.component';
import { ShortcutHelperService } from '../facades/shortcut/helpers/shortcut-helper.service';

type Activity = {
  name: string;
  src: string;
  click?: () => void;
  notification?: NotificationType;
};

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  nav = inject(NavigationService);
  store = inject(Store);

  notation: ShortcutNotation[] = [
    {
      cut: ShortcutHelperService.makeKeyTypes(['D', 'R']),
      action: () => {
        this.showDailyReward();
      },
      head: ShortcutNotationTriggers.ShiftLeft,
    },
    {
      cut: ShortcutHelperService.makeKeyTypes(['G']),
      action: () => {
        this.nav.goToGiftLand();
      },
      head: ShortcutNotationTriggers.ShiftLeft,
    },
    {
      cut: ShortcutHelperService.makeKeyTypes(['S']),
      action: () => {
        this.nav.goToSummonTree();
      },
      head: ShortcutNotationTriggers.ShiftLeft,
    },
    {
      cut: ShortcutHelperService.makeKeyTypes(['I', 'B']),
      action: () => {
        this.nav.goToIronBank();
      },
      head: ShortcutNotationTriggers.ShiftLeft,
    },
    {
      cut: ShortcutHelperService.makeKeyTypes(['D', 'B']),
      action: () => {
        this.nav.goToDailyBoss();
      },
      head: ShortcutNotationTriggers.ShiftLeft,
    },
  ];

  public showDailyReward = () => {
    this.store.dispatch(toggleDailyReward());
  };

  activities: Activity[] = [
    {
      name: 'Gift',
      src: 'icons/food',
      click: () => this.nav.goToGiftLand(),
      notification: NotificationType.gift_store,
    },
    { name: 'Kraster Exchange', src: 'icons/towers' },
    { name: 'Summon Tree', src: 'icons/tree', click: () => this.nav.goToSummonTree() },
    { name: 'Watchtower Store', src: 'icons/raven' },
    { name: 'Arena Store', src: 'icons/arena-icon' },
    { name: 'Wall Store', src: 'icons/maps' },
    {
      name: 'Daily Reward',
      src: 'UI_Avatar_Unit_Alvar',
      click: () => this.showDailyReward(),
      notification: NotificationType.daily_reward,
    },
    {
      name: 'Iron Bank',
      src: 'gold',
      click: () => this.nav.goToIronBank(),
      notification: NotificationType.deposit,
    },
    { name: 'Craftsmen', src: 'silver' },
    {
      name: 'Daily Boss',
      src: 'UI_Avatar_Unit_PolarBear',
      click: () => this.nav.goToDailyBoss(),
    },
  ];

  pageRoutes: Route[] = [
    { name: 'Tavern', url: frontRoutes.taverna, src: 'taverna.png' },
    { name: 'Barracks', url: '#', src: 'barracks.png' },
    {
      name: 'Training ground',
      url: frontRoutes.training,
      src: 'weightlifting.png',
    },
    { name: 'Banquet Hall', url: '#', src: 'banquet.png' },
    { name: 'Great Tree', url: '#', src: 'tree.png' },
    { name: 'Watchtower', url: '#', src: 'knight.png' },
    { name: 'Beyond the Wall', url: frontRoutes.battleField, src: 'wall.png' },
  ];
}
