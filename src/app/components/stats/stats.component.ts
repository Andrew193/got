import {Component, Input} from '@angular/core';
import {Unit} from "../../interface";

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
