import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HeroesMatcherFrom } from '../../../../models/taverna/taverna.model';
import { HeroesSelectNames, MATCHER_TOKEN, SNACKBAR_CONFIG } from '../../../../constants';
import {
  selectAllUnitConfigs,
  selectUnits,
} from '../../../../store/reducers/units-configurator.reducer';
import {
  AddUserUnitCallbackReturnValue,
  PreviewUnit,
  SelectableUnit,
} from '../../../../models/units-related/unit.model';
import { UnitsConfiguratorFeatureActions } from '../../../../store/actions/units-configurator.actions';
import { HeroesFacadeService } from '../../heroes/heroes.service';
import { Store } from '@ngrx/store';
import { HeroesSelectActions } from '../../../../store/actions/heroes-select.actions';
import { LocalStorageService } from '../../../localStorage/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeroesMatcherInterface } from '../../../../models/interfaces/heroes-matcher.interface';

@Injectable({
  providedIn: 'root',
})
export class HeroesMatcherService implements HeroesMatcherInterface {
  private heroesService = inject(HeroesFacadeService);
  private localStorageService = inject(LocalStorageService);
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);

  public saveHeroesMatcherFormTemplate = (templateName?: string) => {
    const name = this.heroesMatcherForm.value.newTemplate || templateName;

    if (name) {
      const config = this.getUnitsConfig();
      const existing = this.getTemplates();

      this.localStorageService.setItem(MATCHER_TOKEN, {
        ...existing,
        [name]: config,
      });

      this.openSnackBarCover(
        `Template has been ${existing[name] ? 'updates' : 'created'} successfully!`,
      );

      if (!templateName) {
        this.getForm().patchValue({ newTemplate: '' });
        this.setTemplateOptions();
      }
    }
  };

  public removeHeroesMatcherFormTemplate = () => {
    const existing = this.getTemplates();

    if (this.heroesMatcherForm.value.template && existing[this.heroesMatcherForm.value.template]) {
      delete existing[this.heroesMatcherForm.value.template];

      this.localStorageService.setItem(MATCHER_TOKEN, existing);
      this.openSnackBarCover('This template has been removed successfully!');

      this.getForm().patchValue({ template: '' });
      this.setTemplateOptions();
    } else {
      this.openSnackBarCover('Can not remove this template or this template does not exist!');
    }
  };

  public loadHeroesMatcherFormTemplate = () => {
    if (this.heroesMatcherForm.value.template) {
      const existing = this.getTemplates();
      const template = existing[this.heroesMatcherForm.value.template];

      if (!template) {
        this.openSnackBarCover('This template does not exist!');
      } else {
        this.drop();
        const selectedUnit = template.units[0];

        if (selectedUnit) {
          this.store.dispatch(
            UnitsConfiguratorFeatureActions.setUnits({
              units: [
                {
                  ...this.heroesService.getPreviewUnit(selectedUnit.name),
                  collection: this.contextName,
                },
              ],
            }),
          );
        }

        this.store.dispatch(
          UnitsConfiguratorFeatureActions.setUnitArrayConfig({
            collection: this.contextName,
            data: template.unitsConfig,
          }),
        );

        this.restoreDataFromLocalStorage(signal(template.unitsConfig), template.units);
        this.openSnackBarCover('Template has been loaded successfully!');
      }
    }
  };

  drop() {
    this.store.dispatch(UnitsConfiguratorFeatureActions.drop({ collections: [this.contextName] }));
    this.chosenUnits.set([]);
    this.matchedPreviewUnits.set([]);
  }

  openSnackBarCover(message: string) {
    this.snackBar.open(message, '', SNACKBAR_CONFIG);
  }

  getUnitsConfig = () => {
    return {
      units: this.store.selectSignal(selectUnits(this.contextName))(),
      unitsConfig: this.selectAllUnitConfig(),
    };
  };

  getTemplates() {
    return (this.localStorageService.getItem(MATCHER_TOKEN) || {}) as Record<
      string,
      ReturnType<typeof this.getUnitsConfig>
    >;
  }

  private heroesMatcherForm = new FormGroup<HeroesMatcherFrom>({
    newTemplate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(5), Validators.maxLength(20)],
    }),
    template: new FormControl('', { nonNullable: true }),
  });

  getForm() {
    return this.heroesMatcherForm;
  }

  contextName = HeroesSelectNames.heroesMatcherCollection;
  templateOptions: string[] = [];

  selectAllUnitConfig = this.store.selectSignal(selectAllUnitConfigs(this.contextName));
  getTileUnits = () => this.heroesService.getTileUnits();

  onUiErrorNames = {
    newTemplate: 'New Template',
    template: 'Template',
  };

  stashedUnits = this.store.selectSignal(selectUnits(this.contextName))();

  chosenUnits = signal<PreviewUnit[]>([]);
  matchedPreviewUnits = signal<ReturnType<typeof this.getTileUnits>>([]);
  synergyUnits = computed(() => {
    const chosenUnit = this.chosenUnits()[0];
    const matchedPreviewUnits = untracked(() => this.matchedPreviewUnits());

    return chosenUnit
      ? chosenUnit.synergy
          .filter(name => !matchedPreviewUnits.find(_ => _.name === name))
          .map(_ => this.heroesService.getPreviewUnit(_))
      : [];
  });

  constructor() {
    //Restore data from localStorage (Fetch selection from NgRx)
    let initiated = false;

    effect(() => {
      if (
        this.stashedUnits &&
        this.stashedUnits.length &&
        !this.chosenUnits().length &&
        !initiated
      ) {
        this.restoreDataFromLocalStorage();
        initiated = true;
      }
    });

    this.setTemplateOptions();
  }

  setTemplateOptions() {
    this.templateOptions = Object.keys(this.getTemplates());
  }

  restoreDataFromLocalStorage(
    _unitsConfig?: typeof this.selectAllUnitConfig,
    _stashedUnits?: typeof this.stashedUnits,
  ) {
    const stashedUnits = _stashedUnits || this.stashedUnits;
    const unitsConfig = _unitsConfig || this.selectAllUnitConfig;

    const preParsed = unitsConfig().filter(_ => !_.active);
    const stashedUnitsWithoutMatchedPreviewUnits = stashedUnits.filter(
      _ => !preParsed.find(el => el.name === _.name),
    );

    this.chosenUnits.update(() => stashedUnitsWithoutMatchedPreviewUnits);
    this.matchedPreviewUnits.set(
      preParsed.map(_ => this.heroesService.getTileUnit(this.heroesService.getUnitByName(_.name))),
    );

    this.store.dispatch(
      HeroesSelectActions.setHeroesSelectState({
        data: stashedUnitsWithoutMatchedPreviewUnits.map(el => ({
          name: el.name,
          collection: this.contextName,
        })),
      }),
    );
  }

  public addUserUnit = (unit: SelectableUnit): AddUserUnitCallbackReturnValue => {
    const index = this.chosenUnits().findIndex(el => el.name === unit.name);

    if (index !== -1) {
      this.chosenUnits.update(model => model.filter(_ => _.name !== unit.name));
      this.store.dispatch(
        UnitsConfiguratorFeatureActions.removeUnit({
          key: unit.name,
          collection: this.contextName,
        }),
      );

      return { shouldAdd: false };
    } else {
      const prevSelection = this.chosenUnits()[0];

      this.chosenUnits.update(() => [this.heroesService.getPreviewUnit(unit.name)]);
      this.store.dispatch(
        UnitsConfiguratorFeatureActions.addUnit({
          data: {
            ...this.heroesService.getPreviewUnit(unit.name),
            collection: this.contextName,
          },
        }),
      );

      if (prevSelection) {
        this.store.dispatch(
          UnitsConfiguratorFeatureActions.removeUnit({
            key: prevSelection.name,
            collection: this.contextName,
          }),
        );
      }

      return prevSelection ? { shouldAdd: true, name: prevSelection.name } : { shouldAdd: true };
    }
  };
}
