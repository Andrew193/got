import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  BossDifficulty,
} from '../../../services/abstract/battle-rewards/battle-rewards.service';
import {
  AfterBattleComponent,
  AfterBattleData,
} from '../../../components/modal-window/after-battle/after-battle.component';
import { RewardService } from '../../../services/reward/reward.service';
import { BossReward } from '../../../models/reward-based.model';
import { CampaignProgressService } from '../services/campaign-progress.service';
import { UserProgress } from '../models/campaign.models';

const SCREENS_COUNT = 5;

@Component({
  selector: 'app-campaign-lobby',
  standalone: true,
  imports: [MatPaginator, CampaignDifficultySelectorComponent, CampaignScreenComponent],
  templateUrl: './campaign-lobby.component.html',
  styleUrl: './campaign-lobby.component.scss',
})
export class CampaignLobbyComponent extends BattleRewardsService implements OnInit {
  bossReward: Record<BossDifficulty, BossReward> = {} as Record<BossDifficulty, BossReward>;
  private campaignFacade = inject(CampaignFacadeService);
  private modalWindowService = inject(ModalWindowService);
  private nav = inject(NavigationService);
  private rewardService = inject(RewardService);
  private campaignProgressService = inject(CampaignProgressService);

  readonly screensCount = SCREENS_COUNT;

  selectedDifficulty = signal<BossDifficulty | null>(null);
  currentPage = signal<number>(0);
  selectedBattle = signal<CampaignBattleConfig | null>(null);
  userProgress = signal<UserProgress | null>(null);
  isLoading = signal<boolean>(false);
  progressError = signal<string | null>(null);

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
    const page = this.currentPage();

    if (!progress || difficulty === null) return null;

    const diffKey = BossDifficulty[difficulty];
    const diffProgress = progress.difficulties[diffKey];

    if (!diffProgress) return null;
    if (diffProgress.screenIndex !== page) return null;

    return `${diffKey}-s${diffProgress.screenIndex}-b${diffProgress.battleIndex}`;
  });

  unlockedDifficulties = computed<BossDifficulty[]>(() => {
    const progress = this.userProgress();

    if (!progress) return [];

    return progress.unlockedDifficulties.map(d => BossDifficulty[d as keyof typeof BossDifficulty]);
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
  }

  selectDifficulty(level: BossDifficulty) {
    this.selectedDifficulty.set(level);
    this.currentPage.set(0);
    this.selectedBattle.set(null);
  }

  onPageChanged(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.selectedBattle.set(null);
  }

  onBattleSelected(battle: CampaignBattleConfig) {
    if (battle.id !== this.unlockedBattleIdForCurrentScreen()) return;
    const current = this.selectedBattle();

    this.selectedBattle.set(current?.id === battle.id ? null : battle);
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
}
