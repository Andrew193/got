import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { HeroProgressFeature } from '../../../store/reducers/hero-progress.reducer';
import { HeroesNamesCodes, UnitName } from '../../../models/units-related/unit.model';
import { BanquetHallCampaignComponent } from '../banquet-hall-campaign/banquet-hall-campaign.component';
import { UNLOCK_THRESHOLD } from '../banquet-hall.constants';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-banquet-hall-lobby',
  standalone: true,
  imports: [BanquetHallCampaignComponent],
  templateUrl: './banquet-hall-lobby.component.html',
  styleUrl: './banquet-hall-lobby.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BanquetHallLobbyComponent {
  private heroesService = inject(HeroesFacadeService);
  private nav = inject(NavigationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  private allProgressHeroes = this.store.selectSignal(HeroProgressFeature.selectProgress);

  selectedHero = signal<HeroesNamesCodes | null>(null);
  readonly unlockThreshold = UNLOCK_THRESHOLD;

  heroes = this.heroesService.getContent();

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['name']) {
        this.selectedHero.set(params['name'] as HeroesNamesCodes);
      }
    });
  }

  getHeroShards(name: UnitName): number {
    const progress = this.allProgressHeroes();

    if (!progress) return 0;

    return progress.heroes.find(h => h.heroName === name)?.shards ?? 0;
  }

  selectHero(name: UnitName) {
    this.selectedHero.set(name as HeroesNamesCodes);
    this.router.navigate([], {
      queryParams: {
        name: name,
      },
    });
  }

  backToCarousel() {
    this.selectedHero.set(null);
  }

  goBack() {
    this.nav.goToMainPage();
  }
}
