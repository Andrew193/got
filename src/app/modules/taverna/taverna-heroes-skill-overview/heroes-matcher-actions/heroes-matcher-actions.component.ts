import { Component, inject } from '@angular/core';
import { TavernaFacadeService } from '../../../../services/facades/taverna/taverna.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../../../components/data-inputs/text-input/text-input.component';
import { AutocompleteMatInputComponent } from '../../../../components/data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';
import { FormErrorsContainerComponent } from '../../../../components/form/form-errors-container/form-errors-container.component';

@Component({
  selector: 'app-heroes-matcher-actions',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    AutocompleteMatInputComponent,
    FormErrorsContainerComponent,
  ],
  templateUrl: './heroes-matcher-actions.component.html',
  styleUrl: './heroes-matcher-actions.component.scss',
})
export class HeroesMatcherActionsComponent {
  facade = inject(TavernaFacadeService);
  form = this.facade.heroesMatcherForm;
  onUiErrorNames = this.facade.onUiErrorNames;

  saveHeroesMatcherFormTemplate = this.facade.saveHeroesMatcherFormTemplate;
  loadHeroesMatcherFormTemplate = this.facade.loadHeroesMatcherFormTemplate;
  removeHeroesMatcherFormTemplate = this.facade.removeHeroesMatcherFormTemplate;

  templateOptions$ = this.facade.templateOptions$;
}
