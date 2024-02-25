import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {GameFieldComponent} from "../../components/game-field/game-field.component";

@Component({
  selector: 'app-lobby',
  standalone: true,
    imports: [
        GameFieldComponent
    ],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {

  constructor(private router: Router) {
  }
  openTaverna() {
    this.router.navigate(["taverna"])
  }
}
