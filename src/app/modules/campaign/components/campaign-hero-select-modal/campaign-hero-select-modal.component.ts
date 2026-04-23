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
import { HeroesSelectComponent } from '../../../../components/heroes-related/heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { HasFooterHost } from '../../../../components/modal-window/modal-interfaces';

export type CampaignHeroSelectModalData = {
  battleConfig: CampaignBattleConfig;
  difficulty: number;
  onFight: (userUnits: UnitName[], aiUnits: HeroesNamesCodes[]) => void;
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

  fight() {
    if (!this.isFightReady()) return;

    const userUnits = this.chosenUnits().map(u => u.name);
    const aiUnits = this.campaignFacade.selectOpponents(
      this.data.battleConfig.opponentPool,
      this.data.battleConfig.aiUnitsCount,
    );

    this.data.close?.();
    this.data.onFight(userUnits, aiUnits);
  }
}
