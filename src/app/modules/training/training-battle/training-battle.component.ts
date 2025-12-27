import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { GameEntryPointComponent } from '../../../components/game-entry-point/game-entry-point.component';
import { ModalWindowService } from '../../../services/modal/modal-window.service';
import { ModalStrategiesTypes } from '../../../components/modal-window/modal-interfaces';
import { GameResultsRedirectType, TileUnit } from '../../../models/field.model';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { Store } from '@ngrx/store';
import {
  selectTrainingFieldConfig,
  selectUnits,
} from '../../../store/reducers/units-configurator.reducer';
import { HeroesSelectActions } from '../../../store/actions/heroes-select.actions';
import { HeroesSelectNames } from '../../../constants';
import { FieldConfigActions } from '../../../store/actions/field-config.actions';
import { RewardService } from '../../../services/reward/reward.service';
import { UsersService } from '../../../services/users/users.service';
import { Currency } from '../../../services/users/users.interfaces';

@Component({
  selector: 'app-training-battle',
  imports: [GameEntryPointComponent],
  templateUrl: './training-battle.component.html',
  styleUrl: './training-battle.component.scss',
})
export class TrainingBattleComponent implements OnDestroy, OnInit {
  store = inject(Store);

  aiUnitsFromStore = this.store.selectSignal(selectUnits(HeroesSelectNames.aiCollection));
  userUnitsFromStore = this.store.selectSignal(selectUnits(HeroesSelectNames.userCollection));
  gridConfig = this.store.selectSignal(selectTrainingFieldConfig());

  nav = inject(NavigationService);
  heroesService = inject(HeroesFacadeService);
  rewardService = inject(RewardService);
  usersService = inject(UsersService);

  aiUnits: TileUnit[] = [];
  userUnits: TileUnit[] = [];

  constructor(private modalService: ModalWindowService) {
    const aiUnitsFromStore = this.aiUnitsFromStore();
    const userUnitsFromStore = this.userUnitsFromStore();

    if (aiUnitsFromStore.length && userUnitsFromStore.length) {
      const userUnits = this.heroesService.getUnitsForTrainingBattle(true, userUnitsFromStore);
      const aiUnits = this.heroesService.getUnitsForTrainingBattle(false, aiUnitsFromStore);

      this.aiUnits = aiUnits.map(el =>
        this.heroesService.getTileUnit(this.heroesService.helper.getEquipmentForUnit(el)),
      );
      this.userUnits = userUnits.map(el =>
        this.heroesService.getTileUnit(this.heroesService.helper.getEquipmentForUnit(el)),
      );
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
        callback: () => this.nav.goToTraining(),
        strategy: ModalStrategiesTypes.base,
      }),
    );
  }

  public victoryRedirect: GameResultsRedirectType = (_, __, currency) => {
    this._victoryRedirect(currency);
  };

  protected _victoryRedirect = (currency?: Currency) => {
    this.usersService
      .updateCurrency(currency || this.rewardService.mostResentRewardCurrency)
      .subscribe(() => this.nav.goToTraining());
  };

  battleEndHandler(data: Parameters<GameResultsRedirectType>) {
    this.rewardService.setMostResentRewardCurrencyBasedOnDMG(data);
  }

  ngOnDestroy() {
    this.store.dispatch(
      HeroesSelectActions.resetHeroCollection({
        collections: [HeroesSelectNames.userCollection, HeroesSelectNames.aiCollection],
      }),
    );
  }
}
