import { Component, computed, inject, signal } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  BossDifficulty,
  DailyBossFacadeService,
} from '../../../services/facades/daily-boss/daily-boss.service';
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
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';

const SCREENS_COUNT = 5;

@Component({
  selector: 'app-campaign-lobby',
  standalone: true,
  imports: [MatPaginator, CampaignDifficultySelectorComponent, CampaignScreenComponent],
  templateUrl: './campaign-lobby.component.html',
  styleUrl: './campaign-lobby.component.scss',
})
export class CampaignLobbyComponent {
  private campaignFacade = inject(CampaignFacadeService);
  private dailyBossFacade = inject(DailyBossFacadeService);
  private modalWindowService = inject(ModalWindowService);
  private nav = inject(NavigationService);

  readonly screensCount = SCREENS_COUNT;

  selectedDifficulty = signal<BossDifficulty | null>(null);
  currentPage = signal<number>(0);
  selectedBattle = signal<CampaignBattleConfig | null>(null);

  difficultyConfigs = this.dailyBossFacade.difficultyConfigs;

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
            onFight: (userUnits: string[], aiUnits: HeroesNamesCodes[]) => {
              this.campaignFacade.startBattle(selectedBattle, difficulty, userUnits, aiUnits);
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
