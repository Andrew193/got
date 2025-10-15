import { inject, Injectable } from '@angular/core';
import { frontRoutes as FrontRoutes } from '../../../constants';
import { Unit } from '../../../models/unit.model';
import { Router } from '@angular/router';

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

  goToTrainingBattle(state: { userUnits: Unit[]; aiUnits: Unit[] }) {
    this.router.navigate([FrontRoutes.training, FrontRoutes.trainingBattle], {
      state: state,
    });
  }

  goToDailyBossBattle(level: number, units: string[]) {
    this.router.navigate([FrontRoutes.dailyBoss, FrontRoutes.dailyBossBattle, level], {
      queryParams: {
        units: units,
      },
    });
  }
}
