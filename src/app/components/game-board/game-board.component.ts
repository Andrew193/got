import {Component, Input} from '@angular/core';
import {GameFieldComponent} from "../game-field/game-field.component";
import {Unit} from "../../services/game-field/game-field.service";

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
  @Input() userUnits: Unit[] = [];
  @Input() aiUnits: Unit[] = [];
  @Input() gameResultsRedirect: () => void = ()=>{};
}
