import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { DecimalPipe } from '@angular/common';
import { USER_TOKEN } from '../../../constants';
import { UsersService } from '../../../services/users/users.service';
import { User } from '../../../services/users/users.interfaces';
import { BossRewardCurrency } from '../../../models/reward-based.model';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  imports: [DecimalPipe, MatMenu, MatMenuItem, MatMenuTrigger],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  user!: User;

  constructor(
    private usersService: UsersService,
    private localStorageService: LocalStorageService,
  ) {}

  ngOnInit() {
    this.user = this.localStorageService.getItem(USER_TOKEN);

    this.localStorageService.updateLocalStorage$.subscribe(() => {
      this.user = this.localStorageService.getItem(USER_TOKEN);
    });
  }

  get currency() {
    return this.user.currency;
  }

  getDisplayCurrency(): Record<'alias' | 'amount', BossRewardCurrency | number>[] {
    const currency = this.currency;

    return [
      {
        alias: 'copper',
        amount: currency.copper,
      },
      {
        alias: 'silver',
        amount: currency.silver,
      },
      {
        alias: 'gold',
        amount: currency.gold,
      },
    ];
  }

  logOut() {
    this.usersService.logout();
  }
}
