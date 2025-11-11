import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroesMatcherComponent } from './heroes-matcher/heroes-matcher.component';

@Component({
  selector: 'app-taverna-heroes-skill-overview',
  imports: [HeroesMatcherComponent],
  templateUrl: './taverna-synergy-overview.component.html',
  styleUrl: './taverna-synergy-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TavernaSynergyOverviewComponent {}
