import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ModalWindowComponent } from '../../components/modal-window/modal-window.component';
import { UsersService } from '../../services/users/users.service';
import { frontRoutes } from '../../constants';
import { HeaderComponent } from '../../components/common/header/header.component';

@Component({
  selector: 'app-site',
  imports: [RouterOutlet, ModalWindowComponent, HeaderComponent],
  templateUrl: './site.component.html',
  styleUrl: './site.component.scss',
})
export class SiteComponent implements OnInit {
  constructor(
    private usersService: UsersService,
    private route: Router,
  ) {}

  ngOnInit(): void {
    if (!this.usersService.isAuth()) {
      this.route.navigate([frontRoutes.login]);
    }
  }
}
