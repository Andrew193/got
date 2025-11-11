import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { TileUnit } from '../../../models/field.model';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { Store } from '@ngrx/store';
import {
  selectAiUnits,
  selectTrainingFieldConfig,
  selectUserUnits,
} from '../../../store/reducers/training.reducer';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { HeroesSelectNames } from '../../../constants';
import { FieldConfigActions } from '../../../store/actions/field-config.actions';

@Component({
  selector: 'app-training-battle',
  imports: [GameEntryPointComponent],
  templateUrl: './training-battle.component.html',
  styleUrl: './training-battle.component.scss',
})
export class TrainingBattleComponent implements OnDestroy, OnInit {
  store = inject(Store);

  aiUnitsFromStore = this.store.selectSignal(selectAiUnits);
  userUnitsFromStore = this.store.selectSignal(selectUserUnits);
  gridConfig = this.store.selectSignal(selectTrainingFieldConfig());

  nav = inject(NavigationService);
  heroesService = inject(HeroesFacadeService);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor(private modalService: ModalWindowService) {
    const aiUnitsFromStore = this.aiUnitsFromStore();
    const userUnitsFromStore = this.userUnitsFromStore();

    if (aiUnitsFromStore.length && userUnitsFromStore.length) {
      const userUnits = this.heroesService.getUnitsForTrainingBattle(true, userUnitsFromStore);
      const aiUnits = this.heroesService.getUnitsForTrainingBattle(false, aiUnitsFromStore);

      this.aiUnits = aiUnits.map(el => this.heroesService.getTileUnit(el));
      this.userUnits = userUnits.map(el => this.heroesService.getTileUnit(el));
    } else {
      this.redirectToTraining();
    }
  }

  ngOnInit() {
    this.store.dispatch(FieldConfigActions.setFieldConfig(this.gridConfig()));
  }

  redirectToTraining() {
    this.modalService.openModal(
      this.modalService.getModalConfig('red-b', 'Something went wrong', 'Ok', {
        callback: this.victoryRedirect,
        open: true,
        strategy: ModalStrategiesTypes.base,
      }),
    );
  }

  public victoryRedirect = () => {
    this.nav.goToTraining();
  };

  ngOnDestroy() {
    this.store.dispatch(
      HeroesSelectActions.resetHeroCollection({ name: HeroesSelectNames.dailyBoss }),
    );
  }
}
