import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CampaignFacadeService } from '../services/campaign-facade.service';
import { CampaignBattleConfig } from '../models/campaign.models';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { CampaignDifficultySelectorComponent } from '../components/campaign-difficulty-selector/campaign-difficulty-selector.component';
import { CampaignScreenComponent } from '../components/campaign-screen/campaign-screen.component';
import {
  CampaignHeroSelectModalComponent,
  CampaignHeroSelectModalData,
} from '../components/campaign-hero-select-modal/campaign-hero-select-modal.component';
import { HeroesNamesCodes, UnitName } from '../../../models/units-related/unit.model';
import {
  BattleRewardsService,
  BattleDifficulty,
  BattleDifficultyNumbers,
  BattleDifficultyNumbersKeys,
} from '../../../services/abstract/battle-rewards/battle-rewards.service';
import {
  AfterBattleComponent,
  AfterBattleData,
} from '../../../components/modal-window/after-battle/after-battle.component';
import { RewardService } from '../../../services/reward/reward.service';
import { BossReward } from '../../../models/reward-based.model';
import { CampaignProgressService } from '../services/campaign-progress.service';
import { UserProgress } from '../models/campaign.models';
import { PageLoaderComponent } from '../../../components/views/page-loader/page-loader.component';
import { LoaderService } from '../../../services/resolver-loader/loader.service';
import { frontRoutes } from '../../../constants';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgClass } from '@angular/common';
import { DailyQuestService } from '../../../services/facades/daily-quest/daily-quest.service';
import { QuestId } from '../../../../../server/types';
import { MatDivider } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';

const SCREENS_COUNT = 5;

@Component({
  selector: 'app-campaign-lobby',
  standalone: true,
  imports: [
    MatPaginator,
    CampaignDifficultySelectorComponent,
    CampaignScreenComponent,
    PageLoaderComponent,
    ReactiveFormsModule,
    MatProgressBar,
    NgClass,
    MatDivider,
  ],
  templateUrl: './campaign-lobby.component.html',
  styleUrl: './campaign-lobby.component.scss',
})
export class CampaignLobbyComponent extends BattleRewardsService implements OnInit {
  bossReward: Record<BattleDifficulty, BossReward> = {} as Record<BattleDifficulty, BossReward>;
  private campaignFacade = inject(CampaignFacadeService);
  private modalWindowService = inject(ModalWindowService);
  private nav = inject(NavigationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rewardService = inject(RewardService);
  private campaignProgressService = inject(CampaignProgressService);
  private loaderService = inject(LoaderService);
  private dailyQuestService = inject(DailyQuestService);
  loader = this.loaderService.getPageLoader(frontRoutes.campaign);

  readonly screensCount = SCREENS_COUNT;
  wonBattlesForm = this.campaignFacade.wonBattlesForm;

  private wonBattlesValues = toSignal(this.wonBattlesForm.valueChanges, {
    initialValue: this.wonBattlesForm.value,
  });

  selectedDifficulty = signal<BattleDifficulty | null>(null);
  currentPage = signal<number>(0);
  selectedBattle = signal<CampaignBattleConfig | null>(null);
  userProgress = signal<UserProgress | null>(null);
  isLoading = signal<boolean>(false);
  progressError = signal<string | null>(null);
  memoizedBattleId = '';

  constructor() {
    super();

    this.route.queryParams.subscribe(params => {
      const battleIndex = params['battleIndex'];

      if (battleIndex) {
        this.memoizedBattleId = battleIndex;
        const [difficulty, screenIndex] = this.memoizedBattleId.split('-');

        this.currentPage.set(+screenIndex.replace(/\D/g, ''));
        this.selectedDifficulty.set(
          BattleDifficultyNumbers[difficulty as BattleDifficultyNumbersKeys] as BattleDifficulty,
        );

        // this.currentPage.set(Number(screenIndex.slice(1)));
        // this.selectedBattle.set(this.currentScreenBattles().find());
      }
    });

    effect(() => {
      const [difficulty, screenIndex, battleId] = this.memoizedBattleId.split('-');
      const battle = this.currentScreenBattles().find(el => el.id === this.memoizedBattleId);

      if (battle && !this.selectedBattle()) {
        this.selectedBattle.set(battle);
      }
    });
  }

  currentWonBattles = computed(() => {
    const difficulty = this.selectedDifficulty();

    if (difficulty === null) return 0;

    const values = this.wonBattlesValues();
    const key = BattleDifficulty[difficulty] as keyof typeof values;

    return values[key] ?? 0;
  });

  progressValue = computed(() => Math.min(100, (this.currentWonBattles() / 10) * 100));

  canCollect = computed(() => this.currentWonBattles() >= 10);

  allScreens = computed(() => {
    const difficulty = this.selectedDifficulty();

    if (difficulty === null) return [];

    return this.campaignFacade.getScreens(difficulty);
  });

  currentScreenBattles = computed(() => {
    const screens = this.allScreens();
    const page = this.currentPage();

    return screens[page] ?? [];
  });

  isFightEnabled = computed(() => this.selectedBattle() !== null);

  unlockedBattleIdForCurrentScreen = computed<string | null>(() => {
    const progress = this.userProgress();
    const difficulty = this.selectedDifficulty();

    if (!progress || difficulty === null) return null;

    const diffKey = BattleDifficulty[difficulty];
    const diffProgress = progress.difficulties[diffKey];

    if (!diffProgress) return null;

    return `${diffKey}-s${diffProgress.screenIndex}-b${diffProgress.battleIndex}`;
  });

  unlockedDifficulties = computed<BattleDifficulty[]>(() => {
    const progress = this.userProgress();

    if (!progress) return [];

    return progress.unlockedDifficulties.map(
      d => BattleDifficulty[d as keyof typeof BattleDifficulty],
    );
  });

  ngOnInit() {
    const userId = this.campaignFacade.usersService.userId;

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

    this.campaignFacade.loadVictories();
  }

  selectDifficulty(level: BattleDifficulty) {
    this.selectedDifficulty.set(level);
    this.currentPage.set(0);
    this.selectedBattle.set(null);
  }

  onPageChanged(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.selectedBattle.set(null);
  }

  onBattleSelected(battle: CampaignBattleConfig) {
    this.router.navigate([], {
      queryParams: { battleIndex: battle.id },
    });
    this.selectedBattle.update(current => (current?.id === battle.id ? null : battle));
  }

  openFightModal() {
    const selectedBattle = this.selectedBattle();
    const difficulty = this.selectedDifficulty();

    if (!selectedBattle || difficulty === null) return;

    this.modalWindowService.openModal(
      this.modalWindowService.getModalConfig<CampaignHeroSelectModalData>(
        '',
        'Select your heroes',
        { closeBtnLabel: 'Close' },
        {
          strategy: ModalStrategiesTypes.component,
          component: CampaignHeroSelectModalComponent,
          data: {
            battleConfig: selectedBattle,
            difficulty,
            onFight: (userUnits: UnitName[], aiUnits: HeroesNamesCodes[]) => {
              this.campaignFacade.startBattle(
                selectedBattle,
                difficulty,
                userUnits,
                aiUnits,
                this.campaignFacade.usersService.userId,
              );
            },
            onAutoFight: (_userUnits: UnitName[], _aiUnits: HeroesNamesCodes[]) => {
              const reward = this.rewardService.mostResentRewardCurrency;

              this.modalWindowService.openModal(
                this.modalWindowService.getModalConfig<AfterBattleData>(
                  '',
                  'Battle Result',
                  { closeBtnLabel: 'Great' },
                  {
                    strategy: ModalStrategiesTypes.component,
                    component: AfterBattleComponent,
                    data: {
                      reward,
                      headerMessage: 'Auto Fight Complete',
                      headerClass: 'green-b',
                    },
                    callback: () => {
                      this.campaignFacade.usersService.updateCurrency(reward).subscribe();
                    },
                  },
                ),
              );
            },
          },
        },
      ),
    );
  }

  goBack() {
    this.nav.goToMainPage();
  }

  onCollectReward() {
    const difficulty = this.selectedDifficulty();
    const screenIndex = this.currentPage();

    if (difficulty === null) return;

    if (this.canCollect()) {
      this.dailyQuestService.markQuestAsCompleted(QuestId.campaign_chest);
    }

    this.campaignFacade.collectVictoryReward(difficulty, screenIndex);
  }
}
