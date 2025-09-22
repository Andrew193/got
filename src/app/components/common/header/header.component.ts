import { Component, OnInit } from '@angular/core';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { DecimalPipe } from '@angular/common';
import { USER_TOKEN } from '../../../constants';
import { UsersService } from '../../../services/users/users.service';
import { User } from '../../../services/users/users.interfaces';

@Component({
  selector: 'header',
  imports: [PopoverModule, DecimalPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  user!: User;

  constructor(
    private usersService: UsersService,
    private localStorageService: LocalStorageService
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

  logOut() {
    this.usersService.logout();
  }
}
