import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {CommonModule} from "@angular/common";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {TavernaComponent} from "./components/taverna/taverna.component";
import {HeaderComponent} from "./components/common/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    SiteComponent,
    LobbyComponent,
    TavernaComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gameOfThrones';
}
