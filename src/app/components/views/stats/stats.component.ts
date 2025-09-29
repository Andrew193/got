import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Unit } from '../../../models/unit.model';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
  selectedHero = input.required<Unit>();
}
