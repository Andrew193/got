import { inject, Injectable } from '@angular/core';
import { HeroesMatcherInterfaceFacade } from '../../../models/interfaces/heroes-matcher.interface';
import { HeroesSelectNames } from '../../../constants';
import { LocalFiltersService } from '../../local-filters/local-filters.service';
import { HeroesMatcherService } from '../taverna/helpers/heroes-matcher.service';
import { HeroesFacadeService } from '../heroes/heroes.service';
import { UnitsConfiguratorFeatureActions } from '../../../store/actions/units-configurator.actions';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';

@Injectable({
  providedIn: 'root',
})
export class TrainingHeroesMatcherService implements HeroesMatcherInterfaceFacade {
  localFiltersService = inject(LocalFiltersService);
  heroesMatcherService = inject(HeroesMatcherService);
  heroesService = inject(HeroesFacadeService);
  store = inject(Store);

  heroesMatcherForm = this.heroesMatcherService.getForm();
  onUiErrorNames: Record<string, string> = {};
  contextName: HeroesSelectNames = HeroesSelectNames.userCollection;

  filteredTemplateOptions = this.localFiltersService.filterOptionsByValueCover(
    this.heroesMatcherService.templateOptions,
    this.heroesMatcherForm.get('template'),
  );

  saveHeroesMatcherFormTemplate() {}

  loadHeroesMatcherFormTemplate = () => {
    if (this.heroesMatcherForm.value.template) {
      const existing = this.heroesMatcherService.getTemplates();
      const template = existing[this.heroesMatcherForm.value.template];

      const selectedUnits = template.unitsConfig.filter(_ => !_.active);

      this.store.dispatch(
        UnitsConfiguratorFeatureActions.drop({
          collections: [this.contextName],
        }),
      );

      this.store.dispatch(
        HeroesSelectActions.setHeroesSelectState({
          data: selectedUnits.map(_ => ({ name: _.name, collection: this.contextName })),
        }),
      );

      this.store.dispatch(
        UnitsConfiguratorFeatureActions.addUnits({
          data: selectedUnits.map(_ => ({
            ...this.heroesService.getPreviewUnit(_.name),
            collection: this.contextName,
          })),
        }),
      );
    }
  };

  removeHeroesMatcherFormTemplate() {}
}
