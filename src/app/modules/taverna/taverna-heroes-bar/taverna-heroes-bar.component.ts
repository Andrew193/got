import { Component, inject } from '@angular/core';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AutocompleteMatInputComponent } from '../../../components/data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';
import { BasePaginationComponent } from '../../../components/abstract/base-pagination/base-pagination.component';
import { MatPaginator } from '@angular/material/paginator';
import { RatingComponent } from '../../../components/common/rating/rating.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { PAGINATION_SERVICE } from '../../../models/tokens';
import { Unit } from '../../../models/units-related/unit.model';

@Component({
  selector: 'app-taverna-heroes-bar',
  imports: [
    MatPaginator,
    AutocompleteMatInputComponent,
    ReactiveFormsModule,
    RatingComponent,
    MatProgressSpinner,
  ],
  providers: [{ provide: PAGINATION_SERVICE, useClass: HeroesFacadeService }],
  templateUrl: './taverna-heroes-bar.component.html',
  styleUrl: './taverna-heroes-bar.component.scss',
})
export class TavernaHeroesBarComponent extends BasePaginationComponent<Unit> {
  helper = inject(TavernaFacadeService);

  formGroup = this.helper.formGroup;
  filteredOptions;
  options;

  constructor(public heroesService: HeroesFacadeService) {
    super();
    const config = this.helper.init();

    this.options = config.options;
    this.filteredOptions = config.filteredOptions;

    config.source$.subscribe(newName => {
      const openFirstPage = () => {
        this.pageChanged({
          pageSize: this.itemsPerPage,
          pageIndex: 0,
        });
      };

      openFirstPage();
      if (newName) {
        this.returnedArray = this.contentArray.filter(item => item.name === newName);
        this.totalElements = this.returnedArray.length;
      } else {
        this.totalElements = this.contentArray.length;
      }
    });
  }

  getRank = this.heroesService.helper.getRank;

  openHeroPreview(name: string) {
    this.helper.nav.goToHeroPreview(name);
  }
}
