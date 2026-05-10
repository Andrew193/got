import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { CampaignFacadeService } from '../../campaign/services/campaign-facade.service';
import { BanquetHallFacadeService } from '../services/banquet-hall-facade.service';
import { BanquetHallProgressService } from '../services/banquet-hall-progress.service';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { HeroProgressFeature } from '../../../store/reducers/hero-progress.reducer';
import { CampaignBattleConfig } from '../../campaign/models/campaign.models';
import { HeroesNamesCodes, UnitName } from '../../../models/units-related/unit.model';
import { BattleDifficulty } from '../../../services/abstract/battle-rewards/battle-rewards.service';
import { CampaignScreenComponent } from '../../campaign/components/campaign-screen/campaign-screen.component';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import {
  BanquetHeroSelectModalComponent,
  BanquetHeroSelectModalData,
} from '../components/banquet-hero-select-modal/banquet-hero-select-modal.component';
import { makeBanquetBattleId, UNLOCK_THRESHOLD } from '../banquet-hall.constants';
import { HeroBattleProgress } from '../services/banquet-hall-progress.service';

const SCREENS_COUNT = 5;

@Component({
  selector: 'app-banquet-hall-campaign',
  standalone: true,
  imports: [CampaignScreenComponent, MatPaginator],
  templateUrl: './banquet-hall-campaign.component.html',
  styleUrl: './banquet-hall-campaign.component.scss',
})
export class BanquetHallCampaignComponent implements OnInit {
  heroName = input.required<HeroesNamesCodes>();
  backClicked = output<void>();

  private campaignFacade = inject(CampaignFacadeService);
  private banquetFacade = inject(BanquetHallFacadeService);
  private banquetProgressService = inject(BanquetHallProgressService);
  private modalWindowService = inject(ModalWindowService);
  private localStorageService = inject(LocalStorageService);
  private store = inject(Store);

  readonly screensCount = SCREENS_COUNT;
  readonly unlockThreshold = UNLOCK_THRESHOLD;

  private allProgressHeroes = this.store.selectSignal(HeroProgressFeature.selectProgress);

  heroShards = computed(() => {
    const progress = this.allProgressHeroes();

    if (!progress) return 0;

    return progress.heroes.find(h => h.heroName === this.heroName())?.shards ?? 0;
  });

  isPostUnlockMode = computed(() => this.heroShards() >= UNLOCK_THRESHOLD);

  allScreens = computed(() => this.campaignFacade.getScreens(BattleDifficulty.easy));

  currentPage = signal<number>(0);
  selectedBattle = signal<CampaignBattleConfig | null>(null);
  heroBattleProgress = signal<HeroBattleProgress | null>(null);
  isLoading = signal<boolean>(false);
  progressError = signal<string | null>(null);

  currentScreenBattles = computed(() => {
    if (this.isPostUnlockMode()) {
      return this.allScreens()[4] ?? [];
    }

    return this.allScreens()[this.currentPage()] ?? [];
  });

  unlockedBattleId = computed<string | null>(() => {
    if (this.isPostUnlockMode()) {
      return makeBanquetBattleId(this.heroName(), 4, 5);
    }

    const progress = this.heroBattleProgress();
    const heroName = this.heroName();

    if (!progress) {
      return makeBanquetBattleId(heroName, 0, 0);
    }

    for (let s = 0; s <= 4; s++) {
      const maxBattle = s === 4 ? 4 : 5;

      for (let b = 0; b <= maxBattle; b++) {
        const id = makeBanquetBattleId(heroName, s, b);

        if (!progress.completedBattles.includes(id)) {
          return id;
        }
      }
    }

    return makeBanquetBattleId(heroName, 4, 5);
  });

  isLockedFn = computed(() => {
    const unlockedId = this.unlockedBattleId();

    return (battle: CampaignBattleConfig) => battle.id !== unlockedId;
  });

  isFightEnabled = computed(() => {
    const battle = this.selectedBattle();

    if (!battle) return false;

    return battle.id === this.unlockedBattleId();
  });

  ngOnInit() {
    this.loadProgress();
  }

  private loadProgress() {
    const userId = this.localStorageService.getUserId();

    this.isLoading.set(true);
    this.banquetProgressService.getHeroProgress(userId, this.heroName()).subscribe({
      next: progress => {
        this.heroBattleProgress.set(progress);
        this.isLoading.set(false);
      },
      error: () => {
        this.progressError.set('Failed to load progress. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChanged(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.selectedBattle.set(null);
  }

  onBattleSelected(battle: CampaignBattleConfig) {
    if (battle.id !== this.unlockedBattleId()) return;

    this.selectedBattle.update(current => (current?.id === battle.id ? null : battle));
  }

  openFightModal() {
    const selectedBattle = this.selectedBattle();

    if (!selectedBattle) return;

    const userId = this.localStorageService.getUserId();
    const heroName = this.heroName();
    const isPostUnlockMode = this.isPostUnlockMode();

    this.modalWindowService.openModal(
      this.modalWindowService.getModalConfig<BanquetHeroSelectModalData>(
        '',
        'Select your heroes',
        { closeBtnLabel: 'Close' },
        {
          strategy: ModalStrategiesTypes.component,
          component: BanquetHeroSelectModalComponent,
          data: {
            battleConfig: selectedBattle,
            onFight: (userUnits: UnitName[], aiUnits: HeroesNamesCodes[]) => {
              this.banquetFacade.startBattle(
                selectedBattle,
                heroName,
                userUnits,
                aiUnits,
                userId,
                isPostUnlockMode,
              );
            },
          },
        },
      ),
    );
  }

  retryLoadProgress() {
    this.progressError.set(null);
    this.loadProgress();
  }

  goBack() {
    this.backClicked.emit();
  }
}
