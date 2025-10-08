import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { AutocompleteMatInputComponent } from '../../../components/data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';
import { BasePaginationComponent } from '../../../components/abstract/base-pagination/base-pagination.component';
import { frontRoutes } from '../../../constants';
import { MatPaginator } from '@angular/material/paginator';
import { RatingComponent } from '../../../components/common/rating/rating.component';

@Component({
  selector: 'app-taverna-heroes-bar',
  imports: [MatPaginator, AutocompleteMatInputComponent, ReactiveFormsModule, RatingComponent],
  templateUrl: './taverna-heroes-bar.component.html',
  styleUrl: './taverna-heroes-bar.component.scss',
})
export class TavernaHeroesBarComponent extends BasePaginationComponent implements OnInit {
  formGroup;
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  constructor(
    public heroesService: HeroesService,
    private router: Router,
  ) {
    super(heroesService);
    this.formGroup = new FormGroup({
      unitName: new FormControl(''),
    });

    this.filteredOptions = this.formGroup.get('unitName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.formGroup.get('unitName')!.valueChanges.subscribe(newName => {
      const openFirstPage = () => {
        this.currentPage = 0;
        this.pageChanged({
          pageSize: this.itemsPerPage,
          pageIndex: this.currentPage,
        });
      };

      if (!newName) {
        openFirstPage();
      } else {
        openFirstPage();
        this.returnedArray = this.contentArray.filter(item => item.name === newName);
      }
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnInit(): void {
    this.options = this.heroesService.getAllHeroes().map(hero => hero.name);
  }

  openHeroPreview(name: string) {
    this.router.navigate([[frontRoutes.taverna, frontRoutes.preview].join('/')], {
      queryParams: {
        name,
      },
    });
  }

  backToMainPage() {
    this.router.navigate([frontRoutes.base]);
  }
}
