import { Component } from '@angular/core';
import {GameFieldComponent} from "../game-field/game-field.component";

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [
    GameFieldComponent
  ],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {

}
