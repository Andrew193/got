import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroesMatcherComponent } from './heroes-matcher/heroes-matcher.component';
import { TavernaPagesFooterComponent } from '../views/taverna-pages-footer/taverna-pages-footer.component';

@Component({
  selector: 'app-taverna-heroes-skill-overview',
  imports: [HeroesMatcherComponent, TavernaPagesFooterComponent],
  templateUrl: './taverna-synergy-overview.component.html',
  styleUrl: './taverna-synergy-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TavernaSynergyOverviewComponent {}
