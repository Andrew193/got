import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalWindowComponent } from '../../components/modal-window/modal-window.component';
import { UsersService } from '../../services/users/users.service';
import { HeaderComponent } from '../../components/common/header/header.component';
import { NavigationService } from '../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-site',
  imports: [RouterOutlet, ModalWindowComponent, HeaderComponent],
  templateUrl: './site.component.html',
  styleUrl: './site.component.scss',
})
export class SiteComponent implements OnInit {
  nav = inject(NavigationService);

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    if (!this.usersService.isAuth()) {
      this.nav.goToLogin();
    }
  }
}
