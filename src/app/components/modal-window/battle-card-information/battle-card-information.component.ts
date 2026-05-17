import { Component, computed, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { DynamicComponentConfig, HasFooterHost, ModalBase } from '../modal-interfaces';
import { DYNAMIC_COMPONENT_DATA } from '../../../models/tokens';
import { CampaignBattleConfig } from '../../../modules/campaign/models/campaign.models';
import { HeroesSelectPreviewComponent } from '../../heroes-related/heroes-select-preview/heroes-select-preview.component';
import { HeroesService } from '../../../services/facades/heroes/heroes.service';
import { UnitShortEqpInformationComponent } from '../../common/unit-short-eqp-information/unit-short-eqp-information.component';
import { Unit } from '../../../models/units-related/unit.model';
import { BattleRewardsService } from '../../../services/abstract/battle-rewards/battle-rewards.service';
import { BattleRewardsBarComponent } from '../../views/battle-rewards-bar/battle-rewards-bar.component';

@Component({
  selector: 'app-battle-card-information',
  imports: [
    HeroesSelectPreviewComponent,
    UnitShortEqpInformationComponent,
    BattleRewardsBarComponent,
  ],
  templateUrl: './battle-card-information.component.html',
  styleUrl: './battle-card-information.component.scss',
})
export class BattleCardInformationComponent implements Partial<HasFooterHost> {
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  private readonly heroesService = inject(HeroesService);
  private readonly battleRewardsService = inject(BattleRewardsService);
  data =
    inject<DynamicComponentConfig<ModalBase & { battleInformation: CampaignBattleConfig }>>(
      DYNAMIC_COMPONENT_DATA,
    );

  getRewardDescription = computed(() =>
    this.battleRewardsService.getRewardDescription(this.data.battleInformation.reward),
  );
  hero: Unit;

  chosenUnits = computed(() => {
    return this.data.battleInformation.opponentPool.map(name =>
      this.heroesService.getPreviewUnit(name),
    );
  });

  constructor() {
    console.log(this.data);
    this.hero = this.data.battleInformation.baseOpponent as unknown as Unit;
  }
}
