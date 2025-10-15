import { Component, inject } from '@angular/core';
import { Unit } from '../../../models/unit.model';
import { Router } from '@angular/router';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { TileUnit } from '../../../models/field.model';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-training-battle',
  imports: [GameEntryPointComponent],
  templateUrl: './training-battle.component.html',
})
export class TrainingBattleComponent {
  nav = inject(NavigationService);
  heroesService = inject(HeroesService);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor(
    private router: Router,
    private modalService: ModalWindowService,
  ) {
    const navigation = this.router.getCurrentNavigation();

    if (navigation) {
      const config = navigation.extras.state as {
        aiUnits: Unit[] | undefined;
        userUnits: Unit[] | undefined;
      } | null;

      if (config?.aiUnits && config.userUnits) {
        this.aiUnits = config.aiUnits.map(el => this.heroesService.getTileUnit(el));
        this.userUnits = config.userUnits.map(el => this.heroesService.getTileUnit(el));
      } else {
        this.redirectToTraining();
      }
    } else {
      this.redirectToTraining();
    }
  }

  redirectToTraining() {
    setTimeout(() => {
      this.modalService.openModal(
        this.modalService.getModalConfig('red-b', 'Something went wrong', 'Ok', {
          callback: this.victoryRedirect,
          open: true,
          strategy: ModalStrategiesTypes.base,
        }),
      );
    }, 300);
  }

  public victoryRedirect = () => {
    this.nav.goToTraining();
  };
}
