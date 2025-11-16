import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeroesMatcherComponent } from './heroes-matcher/heroes-matcher.component';
import { TavernaPagesFooterComponent } from '../views/taverna-pages-footer/taverna-pages-footer.component';
import { HEROES_MATCHER_FACADE } from '../../../models/tokens';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { UnitsConfiguratorFeatureActions } from '../../../store/actions/units-configurator.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-taverna-heroes-skill-overview',
  imports: [HeroesMatcherComponent, TavernaPagesFooterComponent],
  providers: [{ provide: HEROES_MATCHER_FACADE, useClass: TavernaFacadeService }],
  templateUrl: './taverna-synergy-overview.component.html',
  styleUrl: './taverna-synergy-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TavernaSynergyOverviewComponent {
  facade = inject(HEROES_MATCHER_FACADE);
  store = inject(Store);

  cleanup = () => {
    this.facade.heroesMatcherService.getForm().reset();
    this.store.dispatch(
      UnitsConfiguratorFeatureActions.drop({
        collections: [this.facade.contextName],
      }),
    );
  };
}
