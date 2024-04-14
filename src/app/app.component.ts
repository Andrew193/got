import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {CommonModule} from "@angular/common";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {HeaderComponent} from "./components/common/header/header.component";
import {TavernaModule} from "./modules/taverna/taverna.module";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    SiteComponent,
    LobbyComponent,
    HeaderComponent,
    TavernaModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gameOfThrones';
}
