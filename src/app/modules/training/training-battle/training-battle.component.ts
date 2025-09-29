import { Component, inject } from '@angular/core';
import { Unit } from '../../../models/unit.model';
import { Router } from '@angular/router';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { frontRoutes } from '../../../constants';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { TileUnit } from '../../../models/field.model';
import { HeroesService } from '../../../services/heroes/heroes.service';

@Component({
  selector: 'app-training-battle',
  imports: [GameEntryPointComponent],
  templateUrl: './training-battle.component.html',
})
export class TrainingBattleComponent {
  heroesService = inject(HeroesService);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor(
    private route: Router,
    private modalService: ModalWindowService,
  ) {
    const navigation = this.route.getCurrentNavigation();

    if (navigation) {
      const config = navigation.extras.state as {
        aiUnits: Unit[] | undefined;
        userUnits: Unit[] | undefined;
      } | null;

      if (config?.aiUnits && config.userUnits) {
        this.aiUnits = config.aiUnits.map(el => ({
          ...this.heroesService.getTileUnit(el),
          inBattle: true,
        }));
        this.userUnits = config.userUnits.map(el => ({
          ...this.heroesService.getTileUnit(el),
          inBattle: true,
        }));
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
    this.route.navigate([frontRoutes.training]);
  };
}
