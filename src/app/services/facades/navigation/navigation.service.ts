import { inject, Injectable } from '@angular/core';

import { frontRoutes, frontRoutes as FrontRoutes } from '../../../constants';
import { Router } from '@angular/router';
import { CampaignBattleState } from '../../../modules/campaign/campaign-battlefield/campaign-battlefield.component';
import { BattleDifficulty } from '../../abstract/battle-rewards/battle-rewards.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);

  goToMainPage() {
    this.router.navigate([FrontRoutes.base]);
  }

  goToLogin() {
    this.router.navigate([FrontRoutes.login]);
  }

  goToTaverna() {
    this.router.navigate([FrontRoutes.taverna]);
  }

  getToTavernaShortInformation() {
    this.router.navigate([FrontRoutes.taverna, FrontRoutes.shortInformation]);
  }

  getToTavernaHeroesBar() {
    this.router.navigate([FrontRoutes.taverna, FrontRoutes.tavernaHeroesBar]);
  }

  getToTavernaSynergyBar() {
    this.router.navigate([FrontRoutes.taverna, FrontRoutes.tavernaSynergyOverview]);
  }

  goToTraining() {
    this.router.navigate([FrontRoutes.training]);
  }

  goToGiftLand() {
    this.router.navigateByUrl(FrontRoutes.giftStore);
  }

  goToIronBank() {
    this.router.navigateByUrl(FrontRoutes.ironBank);
  }

  goToSummonTree() {
    this.router.navigateByUrl(FrontRoutes.summonTree);
  }

  goToDailyBoss() {
    this.router.navigateByUrl(FrontRoutes.dailyBoss);
  }

  goToTrainingBattle() {
    this.router.navigate([FrontRoutes.training, FrontRoutes.trainingBattle]);
  }

  goToDailyBossBattle(level: BattleDifficulty, units: string[]) {
    this.router.navigate([FrontRoutes.dailyBoss, FrontRoutes.dailyBossBattle, level], {
      queryParams: {
        units: units,
      },
    });
  }

  goToHeroPreview(name: string) {
    this.router.navigate([frontRoutes.taverna, frontRoutes.preview], {
      queryParams: {
        name,
      },
    });
  }

  goToCampaign() {
    this.router.navigateByUrl(FrontRoutes.campaign);
  }

  goToCampaignBattle(state: CampaignBattleState) {
    this.router.navigate([FrontRoutes.campaign, FrontRoutes.campaignBattle], { state });
  }

  goToWatchtower() {
    this.router.navigateByUrl(FrontRoutes.watchtower);
  }
}
