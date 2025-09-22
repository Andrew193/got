import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ModalWindowComponent } from '../../components/modal-window/modal-window.component';
import { UsersService } from '../../services/users/users.service';
import { frontRoutes } from '../../constants';

@Component({
  selector: 'app-site',
  imports: [RouterOutlet, CommonModule, ModalWindowComponent],
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
