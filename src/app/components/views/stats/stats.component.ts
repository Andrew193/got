import { Component, Input } from '@angular/core';
import { Unit } from '../../../models/unit.model';

@Component({
  selector: 'stats',
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  @Input() selectedHero!: Unit;
}
