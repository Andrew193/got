import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { CampaignFacadeService } from '../../campaign/services/campaign-facade.service';
import { CampaignProgressService } from '../../campaign/services/campaign-progress.service';
import { BanquetHallFacadeService } from '../services/banquet-hall-facade.service';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { HeroProgressFeature } from '../../../store/reducers/hero-progress.reducer';
import { CampaignBattleConfig } from '../../campaign/models/campaign.models';
import { UserProgress } from '../../campaign/models/campaign.models';
import { HeroesNamesCodes, UnitName } from '../../../models/units-related/unit.model';
import { BattleDifficulty } from '../../../services/abstract/battle-rewards/battle-rewards.service';
import { CampaignScreenComponent } from '../../campaign/components/campaign-screen/campaign-screen.component';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import {
  BanquetHeroSelectModalComponent,
  BanquetHeroSelectModalData,
} from '../components/banquet-hero-select-modal/banquet-hero-select-modal.component';
import { UNLOCK_THRESHOLD } from '../banquet-hall.constants';

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
  private campaignProgressService = inject(CampaignProgressService);
  private banquetFacade = inject(BanquetHallFacadeService);
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
  userProgress = signal<UserProgress | null>(null);
  isLoading = signal<boolean>(false);
  progressError = signal<string | null>(null);

  currentScreenBattles = computed(() => {
    if (this.isPostUnlockMode()) {
      return this.allScreens()[4] ?? [];
    }

    return this.allScreens()[this.currentPage()] ?? [];
  });

  unlockedBattleIdForCurrentScreen = computed<string | null>(() => {
    const progress = this.userProgress();

    if (!progress) return null;

    const diffKey = BattleDifficulty[BattleDifficulty.easy];
    const diffProgress = progress.difficulties[diffKey];

    if (!diffProgress) return null;

    return `${diffKey}-s${diffProgress.screenIndex}-b${diffProgress.battleIndex}`;
  });

  isFightEnabled = computed(() => {
    const battle = this.selectedBattle();

    if (!battle) return false;

    if (this.isPostUnlockMode()) {
      return battle.isBoss && battle.screenIndex === 4 && battle.battleIndex === 5;
    }

    return true;
  });

  ngOnInit() {
    const userId = this.localStorageService.getUserId();

    this.isLoading.set(true);
    this.campaignProgressService.getProgress(userId).subscribe({
      next: progress => {
        this.userProgress.set(progress);
        this.isLoading.set(false);
      },
      error: () => {
        this.progressError.set('Failed to load campaign progress. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onPageChanged(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.selectedBattle.set(null);
  }

  onBattleSelected(battle: CampaignBattleConfig) {
    if (this.isPostUnlockMode() && !(battle.isBoss && battle.screenIndex === 4)) {
      return;
    }

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
    this.ngOnInit();
  }

  goBack() {
    this.backClicked.emit();
  }
}
