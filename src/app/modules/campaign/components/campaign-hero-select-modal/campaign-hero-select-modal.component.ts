import { Component, computed, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DYNAMIC_COMPONENT_DATA } from '../../../../models/tokens';
import { CampaignBattleConfig } from '../../models/campaign.models';
import {
  HeroesNamesCodes,
  PreviewUnit,
  UnitName,
} from '../../../../models/units-related/unit.model';
import { BasicHeroSelectComponent } from '../../../../components/abstract/basic-hero-select/basic-hero-select.component';
import { HeroesSelectNames } from '../../../../constants';
import { selectUnits } from '../../../../store/reducers/units-configurator.reducer';
import { CampaignFacadeService } from '../../services/campaign-facade.service';
import { BattleSimulatorService } from '../../../../services/battle-simulator.service';
import { HeroesSelectComponent } from '../../../../components/heroes-related/heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { HasFooterHost } from '../../../../components/modal-window/modal-interfaces';
import { RewardService } from '../../../../services/reward/reward.service';
import { Store } from '@ngrx/store';
import { GameBoardActions } from '../../../../store/actions/game-board.actions';
import { Coordinate, TileUnit } from '../../../../models/field.model';
import { AI_POSITIONS, USER_POSITIONS } from '../../campaign.constants';
import { calcCampaignReward } from '../../campaign.utils';

export type CampaignHeroSelectModalData = {
  battleConfig: CampaignBattleConfig;
  difficulty: number;
  onFight: (userUnits: UnitName[], aiUnits: HeroesNamesCodes[]) => void;
  onAutoFight: (userUnits: UnitName[], aiUnits: HeroesNamesCodes[]) => void;
  close?: (response?: boolean) => void;
};

@Component({
  selector: 'app-campaign-hero-select-modal',
  standalone: true,
  imports: [HeroesSelectComponent, HeroesSelectPreviewComponent],
  templateUrl: './campaign-hero-select-modal.component.html',
  styleUrl: './campaign-hero-select-modal.component.scss',
})
export class CampaignHeroSelectModalComponent
  extends BasicHeroSelectComponent<PreviewUnit>
  implements HasFooterHost
{
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  name = 'campaign-hero-select-modal';

  private campaignFacade = inject(CampaignFacadeService);
  private battleSimulator = inject(BattleSimulatorService);
  private rewardService = inject(RewardService);
  private ngrxStore = inject(Store);

  protected data = inject(DYNAMIC_COMPONENT_DATA) as CampaignHeroSelectModalData;

  override context = HeroesSelectNames.campaignCollection;
  override maxHeroes = this.data.battleConfig.maxUserUnits;
  override chosenUnits = this.store.selectSignal(selectUnits(this.context));

  isFightReady = computed(
    () =>
      this.chosenUnits().length >= 1 &&
      this.chosenUnits().length <= this.data.battleConfig.maxUserUnits,
  );

  constructor() {
    super();
  }

  get isSimulating() {
    return this.battleSimulator.isSimulating;
  }

  fight() {
    if (!this.isFightReady()) return;

    const { userUnits, aiUnits } = this.buildUnitNames();

    this.data.close?.();
    this.data.onFight(userUnits, aiUnits);
  }

  autoFight() {
    if (!this.isFightReady() || this.isSimulating()) return;

    this.isSimulating.set(true);

    const { userUnits, aiUnits, userTileUnits, aiTileUnits } = this.buildTileUnits();
    const reward = this.data.battleConfig.reward;

    const currency = this.battleSimulator.simulate(
      userTileUnits,
      aiTileUnits,
      (resultAiUnits: TileUnit[], userWon: boolean) => {
        const totalDmg = resultAiUnits.reduce((sum, u) => sum + (u.maxHealth - u.health), 0);

        return calcCampaignReward(reward, totalDmg, userWon);
      },
    );

    this.rewardService.mostResentRewardCurrency = currency;
    this.ngrxStore.dispatch(GameBoardActions.setBattleReward({ data: currency }));

    this.isSimulating.set(false);
    this.data.onAutoFight(userUnits, aiUnits);
  }

  private buildUnitNames(): { userUnits: UnitName[]; aiUnits: HeroesNamesCodes[] } {
    return {
      userUnits: this.chosenUnits().map(u => u.name),
      aiUnits: this.campaignFacade.selectOpponents(
        this.data.battleConfig.opponentPool,
        this.data.battleConfig.aiUnitsCount,
      ),
    };
  }

  private buildTileUnits() {
    const { userUnits, aiUnits } = this.buildUnitNames();
    const getTileUnitCover = (name: UnitName, pos: Coordinate, isUser = true) =>
      this.heroesService.getTileUnit(this.heroesService.getUnitByName(name), {
        user: isUser,
        x: pos.x,
        y: pos.y,
      });

    const userTileUnits = userUnits.map((name, index) =>
      getTileUnitCover(name, USER_POSITIONS[index] ?? { x: index, y: 1 }),
    );
    const aiTileUnits = aiUnits.map((name, index) =>
      getTileUnitCover(name, AI_POSITIONS[index] ?? { x: index % 5, y: 8 }, false),
    );

    return { userTileUnits, aiTileUnits, userUnits, aiUnits };
  }
}
