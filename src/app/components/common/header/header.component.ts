import { Component } from '@angular/core';
import {PopoverModule} from "ngx-bootstrap/popover";
import {UsersService} from "../../../services/users/users.service";

@Component({
  selector: 'header',
  standalone: true,
  imports: [
    PopoverModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private usersService: UsersService) {
  }

  logOut() {
    this.usersService.logout();
  }
}
