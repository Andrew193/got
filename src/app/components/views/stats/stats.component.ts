import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Unit } from '../../../models/unit.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class StatsComponent {
  selectedHero = input.required<Unit>();
  tableMode = input(false);
}
