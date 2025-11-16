import { Component, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../../../../components/data-inputs/text-input/text-input.component';
import { AutocompleteMatInputComponent } from '../../../../components/data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';
import { FormErrorsContainerComponent } from '../../../../components/form/form-errors-container/form-errors-container.component';
import { HEROES_MATCHER_FACADE } from '../../../../models/tokens';
import { HeroesSelectNames } from '../../../../constants';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-heroes-matcher-actions',
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    AutocompleteMatInputComponent,
    FormErrorsContainerComponent,
    NgClass,
  ],
  templateUrl: './heroes-matcher-actions.component.html',
  styleUrl: './heroes-matcher-actions.component.scss',
})
export class HeroesMatcherActionsComponent implements OnInit {
  facade = inject(HEROES_MATCHER_FACADE);
  form = this.facade.heroesMatcherService.getForm();
  onUiErrorNames = this.facade.onUiErrorNames;

  saveHeroesMatcherFormTemplate = this.facade.saveHeroesMatcherFormTemplate;
  loadHeroesMatcherFormTemplate = this.facade.loadHeroesMatcherFormTemplate;
  removeHeroesMatcherFormTemplate = this.facade.removeHeroesMatcherFormTemplate;

  filteredTemplateOptions = this.facade.filteredTemplateOptions;

  showNewTemplate = input<boolean>(true);
  showRemoveTemplateBtn = input<boolean>(true);
  heroesMatcherContextName = input(HeroesSelectNames.heroesMatcherCollection);

  ngOnInit() {
    this.facade.contextName = this.heroesMatcherContextName();
  }
}
