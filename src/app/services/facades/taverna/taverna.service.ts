import { inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  TavernaActivities,
  TavernaHeroesBarSearchForm,
} from '../../../models/taverna/taverna.model';
import { map, Observable, of, startWith } from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { HeroesFacadeService } from '../heroes/heroes.service';
import { PreviewUnit, SelectableUnit, Unit } from '../../../models/units-related/unit.model';
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
import { HeroesSelectNames } from '../../../constants';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class TavernaFacadeService implements AssistantFacadeService {
  nav = inject(NavigationService);
  store = inject(Store);

  protected heroesService = inject(HeroesFacadeService);
  private heroesTableHelper = inject(TavernaHeroesTableHelperService);
  assistantService = inject(TavernaAssistantService);

  getTileUnits = () => this.heroesService.getTileUnits();

  //Heroes matcher
  contextName = HeroesSelectNames.heroesMatcher;
  chosenUnits = signal<PreviewUnit[]>([]);

  public addUserUnit = (unit: SelectableUnit): boolean => {
    const index = this.chosenUnits().findIndex(el => el.name === unit.name);

    if (index !== -1) {
      this.chosenUnits.update(model => model.filter((_, i) => _.name !== unit.name));
    } else {
      this.chosenUnits.update(model => {
        if (model[0]) {
          this.store.dispatch(
            HeroesSelectActions.removeHeroFromCollection({
              name: this.contextName,
              itemName: model[0].name,
            }),
          );
        }

        return [this.heroesService.getPreviewUnit(unit.name)];
      });
    }

    return index === -1;
  };

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

  private options: string[] = [];
  private readonly originalOptions: Unit[] = [];

  filteredOptions: Observable<string[]> = of([]);

  private readonly _heroBarFormGroup;

  constructor() {
    this._heroBarFormGroup = new FormGroup<TavernaHeroesBarSearchForm>({
      unitName: new FormControl('', { nonNullable: true }),
    });

    this.originalOptions = this.heroesService.getAllHeroes();
    this.datasource = new TavernaTableDatabase(this.originalOptions);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  init() {
    this.options = this.originalOptions.map(hero => hero.name);

    this.filteredOptions = this._heroBarFormGroup.get('unitName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
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
