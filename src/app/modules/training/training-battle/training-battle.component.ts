import { Component } from '@angular/core';
import { Unit } from '../../../models/unit.model';
import { Router } from '@angular/router';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { CommonModule } from '@angular/common';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { frontRoutes } from '../../../constants';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';

@Component({
  selector: 'training-battle',
  imports: [CommonModule, GameEntryPointComponent],
  templateUrl: './training-battle.component.html',
  styleUrl: './training-battle.component.scss',
})
export class TrainingBattleComponent {
  aiUnits: Unit[] = [];
  userUnits: Unit[] = [];

  constructor(
    private route: Router,
    private modalService: ModalWindowService
  ) {
    const navigation = this.route.getCurrentNavigation();
    if (navigation) {
      const config = navigation.extras.state as {
        aiUnits: Unit[] | undefined;
        userUnits: Unit[] | undefined;
      } | null;
      if (config?.aiUnits && config.userUnits) {
        this.aiUnits = config.aiUnits;
        this.userUnits = config.userUnits;
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
        this.modalService.getModalConfig(
          'red-b',
          'Something went wrong',
          'Ok',
          {
            callback: this.victoryRedirect,
            open: true,
            strategy: ModalStrategiesTypes.base,
          }
        )
      );
    }, 300);
  }

  public victoryRedirect = () => {
    this.route.navigate([frontRoutes.training]);
  };
}
