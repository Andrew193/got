import {Component, Input} from '@angular/core';
import {GameFieldComponent} from "../game-field/game-field.component";
import {Unit} from "../../interface";

@Component({
  selector: 'game-entry-point',
  standalone: true,
  imports: [
    GameFieldComponent
  ],
  templateUrl: './game-entry-point.component.html',
  styleUrl: './game-entry-point.component.scss'
})
export class GameEntryPointComponent {
  @Input() userUnits: Unit[] = [];
  @Input() aiUnits: Unit[] = [];
  @Input() battleMode = true;
  @Input() gameResultsRedirect: () => void = ()=>{};
}
