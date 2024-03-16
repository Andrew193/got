import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from "@angular/router";
import {HeaderComponent} from "../../components/common/header/header.component";
import {CommonModule} from "@angular/common";
import {GameFieldComponent} from "../../components/game-field/game-field.component";
import {ModalWindowComponent} from "../../components/modal-window/modal-window.component";
import {UsersService} from "../../services/users/users.service";
import {frontRoutes} from "../../app.routes";

@Component({
  selector: 'app-site',
  standalone: true,
    imports: [
        RouterOutlet,
        HeaderComponent,
        CommonModule,
        GameFieldComponent,
        ModalWindowComponent
    ],
  templateUrl: './site.component.html',
  styleUrl: './site.component.scss'
})
export class SiteComponent implements OnInit{

  constructor(private usersService: UsersService,
              private route: Router) {
  }

  ngOnInit(): void {
    if(!this.usersService.isAuth()) {
      this.route.navigate([frontRoutes.login])
    }
  }
}
