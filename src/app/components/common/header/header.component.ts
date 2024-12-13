import {Component, OnInit} from '@angular/core';
import {PopoverModule} from "ngx-bootstrap/popover";
import {User, UsersService} from "../../../services/users/users.service";
import {LocalStorageService} from "../../../services/localStorage/local-storage.service";

@Component({
  selector: 'header',
  standalone: true,
  imports: [
    PopoverModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  user!: User;
  constructor(private usersService: UsersService,
              private localStorageService: LocalStorageService) {
  }

  ngOnInit() {
    this.user = this.localStorageService.getItem(this.usersService.userToken);
  }

  get currency() {
    return this.user.currency;
  }

  logOut() {
    this.usersService.logout();
  }
}
