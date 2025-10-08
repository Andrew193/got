import { inject, Injectable } from '@angular/core';
import { frontRoutes } from '../../../constants';
import { Unit } from '../../../models/unit.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);

  goToMainPage() {
    this.router.navigate([frontRoutes.base]);
  }

  goToLogin() {
    this.router.navigate([frontRoutes.login]);
  }

  goToTaverna() {
    this.router.navigate([frontRoutes.taverna]);
  }

  goToTraining() {
    this.router.navigate([frontRoutes.training]);
  }

  goToGiftLand() {
    this.router.navigateByUrl(frontRoutes.giftStore);
  }

  goToIronBank() {
    this.router.navigateByUrl(frontRoutes.ironBank);
  }

  goToSummonTree() {
    this.router.navigateByUrl(frontRoutes.summonTree);
  }

  goToDailyBoss() {
    this.router.navigateByUrl(frontRoutes.dailyBoss);
  }

  goToTrainingBattle(state: { userUnits: Unit[]; aiUnits: Unit[] }) {
    this.router.navigate([frontRoutes.training, frontRoutes.trainingBattle], {
      state: state,
    });
  }

  goToDailyBossBattle(level: number, units: string[]) {
    this.router.navigate([frontRoutes.dailyBoss, frontRoutes.dailyBossBattle, level], {
      queryParams: {
        units: units,
      },
    });
  }
}
