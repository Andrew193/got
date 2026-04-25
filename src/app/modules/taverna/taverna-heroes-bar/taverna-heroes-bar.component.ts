import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AutocompleteMatInputComponent } from '../../../components/data-inputs/autocomplete-mat-input/autocomplete-mat-input.component';
import { BasePaginationComponent } from '../../../components/abstract/base-pagination/base-pagination.component';
import { MatPaginator } from '@angular/material/paginator';
import { RatingComponent } from '../../../components/common/rating/rating.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { PAGINATION_SERVICE } from '../../../models/tokens';
import { HeroesNamesCodes, Unit } from '../../../models/units-related/unit.model';
import { Store } from '@ngrx/store';
import { selectUnlockedHeroes } from '../../../store/selectors/hero-progress.selectors';
import { ContainerLabelComponent } from '../../../components/views/container-label/container-label.component';

@Component({
  selector: 'app-taverna-heroes-bar',
  imports: [
    MatPaginator,
    AutocompleteMatInputComponent,
    ReactiveFormsModule,
    RatingComponent,
    MatProgressSpinner,
    ContainerLabelComponent,
  ],
  providers: [{ provide: PAGINATION_SERVICE, useClass: HeroesFacadeService }],
  templateUrl: './taverna-heroes-bar.component.html',
  styleUrl: './taverna-heroes-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TavernaHeroesBarComponent extends BasePaginationComponent<
  Unit & { name: HeroesNamesCodes }
> {
  helper = inject(TavernaFacadeService);
  store = inject(Store);
  private unlockedHeroes = this.store.selectSignal(selectUnlockedHeroes);

  formGroup = this.helper.formGroup;
  config = this.helper.init();
  filteredOptions = this.config.filteredOptions;
  options = this.config.options;

  constructor(public heroesService: HeroesFacadeService) {
    super();
    this.config.source$.subscribe(newName => {
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

  isHeroLocked(name: HeroesNamesCodes) {
    return !this.unlockedHeroes().find(el => el.heroName === name);
  }

  getRank = this.heroesService.helper.getRank;
  getRarityShadowClass = this.helper.getRarityShadowClass;

  openHeroPreview(name: string, _isHeroLocked: boolean) {
    !_isHeroLocked && this.helper.nav.goToHeroPreview(name);
  }
}
