import { Component, computed, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DYNAMIC_COMPONENT_DATA } from '../../../../models/tokens';
import { CampaignBattleConfig } from '../../../campaign/models/campaign.models';
import {
  HeroesNamesCodes,
  PreviewUnit,
  UnitName,
} from '../../../../models/units-related/unit.model';
import { BasicHeroSelectComponent } from '../../../../components/abstract/basic-hero-select/basic-hero-select.component';
import { HeroesSelectNames } from '../../../../constants';
import { selectUnits } from '../../../../store/reducers/units-configurator.reducer';
import { CampaignFacadeService } from '../../../campaign/services/campaign-facade.service';
import { HeroesSelectComponent } from '../../../../components/heroes-related/heroes-select/heroes-select.component';
import { HeroesSelectPreviewComponent } from '../../../../components/heroes-related/heroes-select-preview/heroes-select-preview.component';
import { HasFooterHost } from '../../../../components/modal-window/modal-interfaces';
import { selectUnlockedHeroes } from '../../../../store/selectors/hero-progress.selectors';

export type BanquetHeroSelectModalData = {
  battleConfig: CampaignBattleConfig;
  onFight: (userUnits: UnitName[], aiUnits: HeroesNamesCodes[]) => void;
  close?: (response?: boolean) => void;
};

@Component({
  selector: 'app-banquet-hero-select-modal',
  standalone: true,
  imports: [HeroesSelectComponent, HeroesSelectPreviewComponent],
  templateUrl: './banquet-hero-select-modal.component.html',
  styleUrls: [
    '../../../campaign/components/campaign-hero-select-modal/campaign-hero-select-modal.component.scss',
  ],
})
export class BanquetHeroSelectModalComponent
  extends BasicHeroSelectComponent<PreviewUnit>
  implements HasFooterHost, OnInit
{
  @ViewChild('footerHost', { read: ViewContainerRef, static: true })
  footerHost!: ViewContainerRef;

  name = 'banquet-hero-select-modal';

  private campaignFacade = inject(CampaignFacadeService);

  protected data = inject(DYNAMIC_COMPONENT_DATA) as BanquetHeroSelectModalData;

  override context = HeroesSelectNames.campaignCollection;
  override maxHeroes = this.data.battleConfig.maxUserUnits;
  override chosenUnits = this.store.selectSignal(selectUnits(this.context));

  unlockedHeroes = this.store.selectSignal(selectUnlockedHeroes);

  isFightReady = computed(
    () =>
      this.chosenUnits().length >= 1 &&
      this.chosenUnits().length <= this.data.battleConfig.maxUserUnits,
  );

  hasNoHeroes = computed(() => this.unlockedHeroes().length === 0);

  constructor() {
    super();
  }

  ngOnInit() {
    const unlockedUnits = this.unlockedHeroes()
      .map(record => this.heroesService.getUnitByName(record.heroName))
      .filter(Boolean);

    this.init(unlockedUnits);
  }

  fight() {
    if (!this.isFightReady()) return;

    const userUnits = this.chosenUnits().map(u => u.name);
    const aiUnits = this.campaignFacade.selectOpponents(this.data.battleConfig);

    this.data.close?.();
    this.data.onFight(userUnits, aiUnits);
  }
}
