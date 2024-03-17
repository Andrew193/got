import {Component, Input} from '@angular/core';
import {Unit} from "../../services/game-field/game-field.service";

@Component({
  selector: 'stats',
  standalone: true,
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  @Input() selectedHero!: Unit;

}
