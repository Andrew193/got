import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  TavernaActivities,
  TavernaHeroesBarSearchForm,
} from '../../../models/taverna/taverna.model';
import { Observable, of } from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { HeroesFacadeService } from '../heroes/heroes.service';
import { Rarity, Unit } from '../../../models/units-related/unit.model';
import {
  DataSource,
  FilterValue,
  TableApiResponse,
} from '../../../models/table/abstract-table.model';
import { SortDirection } from '@angular/material/sort';
import { TavernaHeroesTableHelperService } from './helpers/heroes-table-helper.service';
import { TableService } from '../../table/table.service';
import { TavernaAssistantService } from './helpers/taverna-assistant.service';
import { AssistantFacadeService } from '../../../models/interfaces/assistant.interface';
import { Store } from '@ngrx/store';
import { HeroesMatcherService } from './helpers/heroes-matcher.service';
import { LocalFiltersService } from '../../local-filters/local-filters.service';
import { HeroesMatcherInterfaceFacade } from '../../../models/interfaces/heroes-matcher.interface';

@Injectable()
export class TavernaFacadeService implements AssistantFacadeService, HeroesMatcherInterfaceFacade {
  nav = inject(NavigationService);
  localFiltersService = inject(LocalFiltersService);
  heroesMatcherService = inject(HeroesMatcherService);
  store = inject(Store);

  heroesService = inject(HeroesFacadeService);
  private heroesTableHelper = inject(TavernaHeroesTableHelperService);
  assistantService = inject(TavernaAssistantService);

  getTileUnits = () => this.heroesService.getTileUnits();

  //Heroes matcher
  heroesMatcherForm = this.heroesMatcherService.getForm();
  onUiErrorNames = this.heroesMatcherService.onUiErrorNames;
  contextName = this.heroesMatcherService.contextName;

  filteredTemplateOptions = this.localFiltersService.filterOptionsByValueCover(
    this.heroesMatcherService.templateOptions,
    this.heroesMatcherForm.get('template'),
  );

  addUserUnit = this.heroesMatcherService.addUserUnit;
  saveHeroesMatcherFormTemplate = this.heroesMatcherService.saveHeroesMatcherFormTemplate;
  loadHeroesMatcherFormTemplate = this.heroesMatcherService.loadHeroesMatcherFormTemplate;
  removeHeroesMatcherFormTemplate = this.heroesMatcherService.removeHeroesMatcherFormTemplate;

  chosenUnits = this.heroesMatcherService.chosenUnits;
  matchedPreviewUnits = this.heroesMatcherService.matchedPreviewUnits;
  synergyUnits = this.heroesMatcherService.synergyUnits;

  //Root taverna
  readonly activities: TavernaActivities[] = [
    {
      label: 'Short Information',
      imgSrc: 'aemon_young',
      click: () => this.nav.getToTavernaShortInformation(),
      filterColor: 'gray',
    },
    {
      label: 'Heroes Bar',
      imgSrc: 'mayla_young',
      click: () => this.nav.getToTavernaHeroesBar(),
    },
    {
      label: 'Synergy Overview',
      imgSrc: 'water_dancer',
      click: () => this.nav.getToTavernaSynergyBar(),
      filterColor: '#bcf5c7',
    },
  ];

  //Taverna table
  datasource = this.heroesTableHelper.datasource;
  getUnitRarityLabel = this.heroesTableHelper.getUnitRarityLabel;
  getUnitTypeLabel = this.heroesTableHelper.getUnitTypeLabel;
  pageSize = this.heroesTableHelper.pageSize;
  pageSizeOptions = this.heroesTableHelper.pageSizeOptions;

  isExpanded = this.heroesTableHelper.isExpanded;
  trackBy = this.heroesTableHelper.trackBy;

  private readonly originalOptions: Unit[] = [];
  private options: string[] = [];
  filteredOptions: Observable<typeof this.options> = of([]);

  private readonly _heroBarFormGroup;

  constructor() {
    this._heroBarFormGroup = new FormGroup<TavernaHeroesBarSearchForm>({
      unitName: new FormControl('', { nonNullable: true }),
    });

    this.originalOptions = this.heroesService.getAllHeroes();
    this.datasource = new TavernaTableDatabase(this.originalOptions);
  }

  init() {
    this.options = this.originalOptions.map(hero => hero.name);
    this.filteredOptions = this.localFiltersService.filterOptionsByValueCover(
      this.options,
      this._heroBarFormGroup.get('unitName'),
    );

    return {
      options: this.options,
      filteredOptions: this.filteredOptions,
      source$: this._heroBarFormGroup.get('unitName')!.valueChanges,
    };
  }

  get unitOptions() {
    return this.originalOptions;
  }

  get formGroup() {
    return this._heroBarFormGroup;
  }

  getAssistantFormGroup() {
    return this.assistantService.getForm();
  }

  //Heroes bar
  getRarityShadowClass(unit: Pick<Unit, 'rarity'>) {
    const rarityMap: Record<Rarity, string> = {
      [Rarity.COMMON]: 'common-shadow',
      [Rarity.RARE]: 'rare-shadow',
      [Rarity.EPIC]: 'epic-shadow',
      [Rarity.LEGENDARY]: 'legendary-shadow',
    };

    return rarityMap[unit.rarity];
  }
}

export class TavernaTableDatabase<T> implements DataSource<T> {
  constructor(public originalOptions: T[]) {}

  fetchContent(
    sort: (keyof T)[],
    order: SortDirection[],
    page: number,
    itemsPerPage: number,
    filters: Partial<Record<keyof T, FilterValue<T, keyof T>>>,
    tableService: TableService<T>,
  ): Observable<TableApiResponse<T>> {
    return tableService.fetchContent(
      sort,
      order,
      page,
      itemsPerPage,
      filters,
      this.originalOptions,
    );
  }
}
