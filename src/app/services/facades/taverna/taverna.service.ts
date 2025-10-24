import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TavernaHeroesBarSearchForm } from '../../../models/taverna.model';
import { map, Observable, of, startWith } from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { HeroesFacadeService } from '../heroes/heroes.service';

@Injectable({
  providedIn: 'root',
})
export class TavernaFacadeService {
  nav = inject(NavigationService);
  private heroesService = inject(HeroesFacadeService);

  private options: string[] = [];
  filteredOptions: Observable<string[]> = of([]);

  formGroup = new FormGroup<TavernaHeroesBarSearchForm>({
    unitName: new FormControl('', { nonNullable: true }),
  });

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  init() {
    this.options = this.heroesService.getAllHeroes().map(hero => hero.name);

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
}
