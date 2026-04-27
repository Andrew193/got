import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
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
import { HeroProgressFeature } from '../../../store/reducers/hero-progress.reducer';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACKBAR_CONFIG } from '../../../constants';

type DataType = Unit & { name: HeroesNamesCodes };

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
export class TavernaHeroesBarComponent extends BasePaginationComponent<DataType> {
  private helper = inject(TavernaFacadeService);
  private store = inject(Store);
  private localStorageService = inject(LocalStorageService);
  private snackBar = inject(MatSnackBar);

  private unlockedHeroes = this.store.selectSignal(selectUnlockedHeroes);
  private allHeroes = this.store.selectSignal(HeroProgressFeature.selectProgress);

  formGroup = this.helper.formGroup;
  config = this.helper.init();
  filteredOptions = this.config.filteredOptions;
  options = this.config.options;

  constructor(public heroesService: HeroesFacadeService) {
    super();

    effect(() => {
      this.allHeroes();
      const freshContent = this.heroesService.getContent() as DataType[];

      this.contentArray = freshContent;
    });

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

  getRank = this.heroesService.helper.getRank;
  getRarityShadowClass = this.helper.getRarityShadowClass;
  getRankCost = this.heroesService.heroProgressService.getUnlockCost;

  isHeroLocked(name: HeroesNamesCodes) {
    return !this.unlockedHeroes().find(el => el.heroName === name);
  }

  getHeroesShards(name: HeroesNamesCodes) {
    return (this.allHeroes()?.heroes || []).filter(el => el.heroName === name)[0].shards ?? 0;
  }

  openHeroPreview(name: string, _isHeroLocked: boolean) {
    !_isHeroLocked && this.helper.nav.goToHeroPreview(name);
  }

  upgradeRank(event: PointerEvent, name: HeroesNamesCodes, neededAmountOfShards: number) {
    event.stopPropagation();

    const userId = this.localStorageService.getUserId();
    const hero = this.allHeroes()!.heroes.find(el => el.heroName === name);

    if (hero) {
      if (hero.shards >= neededAmountOfShards) {
        if (hero.isUnlocked) {
          this.heroesService.heroProgressService
            .updateHeroProgress(userId, hero.heroName, {
              ...hero,
              rank: hero.rank + 1,
              shards: hero.shards - neededAmountOfShards,
            })
            .subscribe(() => {
              this.snackBar.open(`Hero "${name}" has been upgraded!`, 'Great');
            });
        } else {
          this.heroesService.heroProgressService.unlockHero(userId, hero.heroName).subscribe(() => {
            this.snackBar.open(`Hero "${name}" has been unlocked!`, 'Great');
          });
        }
      } else {
        this.snackBar.open(
          `Not enough shards to ${hero.isUnlocked ? 'upgrade' : 'unlock'} "${name}"!`,
          'Ok',
          SNACKBAR_CONFIG,
        );
      }
    }
  }
}
