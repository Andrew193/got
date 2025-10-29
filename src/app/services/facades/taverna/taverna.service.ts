import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TavernaHeroesBarSearchForm } from '../../../models/taverna.model';
import { delay, map, Observable, of, startWith } from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { HeroesFacadeService } from '../heroes/heroes.service';
import { Unit } from '../../../models/units-related/unit.model';
import { DataSource, TableApiResponse } from '../../../models/table/abstract-table.model';
import { SortDirection } from '@angular/material/sort';
import { TavernaHeroesTableHelperService } from './helpers/heroes-table-helper.service';

@Injectable()
export class TavernaFacadeService {
  nav = inject(NavigationService);

  protected heroesService = inject(HeroesFacadeService);
  private heroesTableHelper = inject(TavernaHeroesTableHelperService);

  datasource = this.heroesTableHelper.datasource;
  getUnitRarityLabel = this.heroesTableHelper.getUnitRarityLabel;
  getUnitTypeLabel = this.heroesTableHelper.getUnitTypeLabel;
  pageSize = this.heroesTableHelper.pageSize;
  isExpanded = this.heroesTableHelper.isExpanded;
  trackBy = this.heroesTableHelper.trackBy;

  private options: string[] = [];
  private readonly originalOptions: Unit[] = [];

  filteredOptions: Observable<string[]> = of([]);

  private readonly _formGroup;

  constructor() {
    this._formGroup = new FormGroup<TavernaHeroesBarSearchForm>({
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

    this.filteredOptions = this._formGroup.get('unitName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    return {
      options: this.options,
      filteredOptions: this.filteredOptions,
      source$: this._formGroup.get('unitName')!.valueChanges,
    };
  }

  get unitOptions() {
    return this.originalOptions;
  }

  get formGroup() {
    return this._formGroup;
  }
}

export class TavernaTableDatabase<T> implements DataSource<T> {
  constructor(public originalOptions: T[]) {}

  fetchContent(
    sort: keyof T,
    order: SortDirection,
    page: number,
    itemsPerPage: number,
  ): Observable<TableApiResponse<T>> {
    const sortedItems = [...this.originalOptions].sort((a, b) => {
      const aValue = a[sort];
      const bValue = b[sort];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return order === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    const startItem = page * itemsPerPage;
    const endItem = startItem + itemsPerPage;

    return of({
      total_count: sortedItems.length,
      items: sortedItems.slice(startItem, endItem),
    }).pipe(delay(500));
  }
}
