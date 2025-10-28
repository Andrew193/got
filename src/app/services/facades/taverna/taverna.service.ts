import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TavernaHeroesBarSearchForm } from '../../../models/taverna.model';
import { delay, map, Observable, of, startWith } from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { HeroesFacadeService } from '../heroes/heroes.service';
import { HeroType, Rarity, Unit } from '../../../models/units-related/unit.model';
import { DataSource, TableApiResponse } from '../../../models/table/abstract-table.model';
import { SortDirection } from '@angular/material/sort';

@Injectable()
export class TavernaFacadeService {
  nav = inject(NavigationService);
  protected heroesService = inject(HeroesFacadeService);
  private datasource: DataSource<Unit>;
  private pageSize = 10;

  private options: string[] = [];
  private readonly originalOptions: Unit[] = [];

  filteredOptions: Observable<string[]> = of([]);

  private formGroup;

  constructor() {
    this.formGroup = new FormGroup<TavernaHeroesBarSearchForm>({
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

    this.filteredOptions = this.formGroup.get('unitName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    return {
      options: this.options,
      filteredOptions: this.filteredOptions,
      source$: this.formGroup.get('unitName')!.valueChanges,
    };
  }

  get unitOptions() {
    return this.originalOptions;
  }

  getFormGroup() {
    return this.formGroup;
  }

  getDataSource() {
    return this.datasource;
  }

  setPageSize(pageSize: number) {
    this.pageSize = pageSize;
  }

  getUnitRarityLabel(level: Rarity) {
    return {
      [Rarity.LEGENDARY]: 'Legendary',
      [Rarity.EPIC]: 'Epic',
      [Rarity.RARE]: 'Rare',
      [Rarity.COMMON]: 'Common',
    }[level];
  }

  getUnitTypeLabel(type: HeroType) {
    return {
      [HeroType.ATTACK]: 'Attack',
      [HeroType.DEFENCE]: 'Defence',
    }[type];
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
