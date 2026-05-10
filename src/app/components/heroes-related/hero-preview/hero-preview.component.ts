import { Component, computed, effect, inject, ModelSignal, OnInit, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { ActivatedRoute } from '@angular/router';
import { StatsComponent } from '../../views/stats/stats.component';
import { EqName, HeroesNamesCodes, Unit } from '../../../models/units-related/unit.model';
import { SkillsRenderComponent } from '../../views/skills-render/skills-render.component';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { RatingComponent } from '../../common/rating/rating.component';
import { TavernaPagesFooterComponent } from '../../../modules/taverna/views/taverna-pages-footer/taverna-pages-footer.component';
import { UsersService } from '../../../services/users/users.service';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { EquipmentCardComponent } from './equipment-card/equipment-card.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UpgradeService } from '../../../services/upgrade/upgrade.service';
import { MAX_UNIT_LEVEL } from '../../../constants';
import { toSignal } from '@angular/core/rxjs-interop';
import { Currency } from '../../../services/users/users.interfaces';
import { PriceLabelComponent } from '../../common/price-label/price-label.component';
import { Store } from '@ngrx/store';
import { HeroPowerComponent } from '../../common/hero-power/hero-power.component';

@Component({
  selector: 'app-hero-preview',
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    RatingComponent,
    TavernaPagesFooterComponent,
    EquipmentCardComponent,
    AsyncPipe,
    MatIcon,
    MatButtonModule,
    PriceLabelComponent,
    HeroPowerComponent,
  ],
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss',
  providers: [UpgradeService],
})
export class HeroPreviewComponent implements OnInit {
  nav = inject(NavigationService);
  route = inject(ActivatedRoute);
  facade = inject(HeroesFacadeService);
  upgradeService = inject(UpgradeService);
  store = inject(Store);

  private usersService = inject(UsersService);
  private localStorageService = inject(LocalStorageService);

  selectedHero = signal<Unit | null>(null);
  selectedTileHero = computed(() => {
    const selectedHero = this.selectedHero();

    return selectedHero ? this.facade.getTileUnit(selectedHero, []) : null;
  });
  getGearDescription = (name: EqName) => this.facade.helper.getGearDescription(name);
  getGearLevelByName = (name: EqName) =>
    this.facade.helper.getGearLevelByName(name, this.selectedHero() as Unit);

  gearParts = this.facade.helper.gearParts;
  currency$ = this.usersService.$user.pipe(
    map(u => u?.currency ?? { gold: 0, silver: 0, copper: 0 }),
  );
  currencySignal = toSignal(this.currency$);
  MAX_UNIT_LEVEL = MAX_UNIT_LEVEL;
  userId = this.localStorageService.getUserId();

  readonly eqNames: EqName[] = ['eq1', 'eq2', 'eq3', 'eq4'];

  constructor() {
    effect(() => {
      const selectedHero = this.selectedHero();

      if (selectedHero) {
        this.upgradeService.currentLevel.set(selectedHero.level);
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const heroName = params['name'];

      if (heroName) {
        this.selectedHero.set(this.facade.getUnitByName(heroName));

        this.upgradeService.init(
          this.selectedHero()!.level,
          this.facade.heroProgressService.getLevelUpgradeCost.bind(this.facade.heroProgressService),
          this.currencySignal as ModelSignal<Currency>,
          this.MAX_UNIT_LEVEL,
        );
      } else {
        this.backToTavern();
      }
    });
  }

  getIncrement = (type: 'attackIncrement' | 'defenceIncrement' | 'healthIncrement') => {
    return this.selectedHero()![type];
  };

  onEquipmentUpgraded() {
    this.selectedHero.set(this.facade.getUnitByName(this.selectedHero()!.name));
  }

  upgradeLevel() {
    const selectedHero = this.selectedHero();

    selectedHero &&
      this.upgradeService.execute(
        this.facade.heroProgressService.upgradeLevel(
          this.userId,
          selectedHero.name as HeroesNamesCodes,
          selectedHero.level,
        ),
        () => {
          this.selectedHero.set(this.facade.getUnitByName(selectedHero.name));
        },
      );
  }

  backToTavern = () => this.nav.goToTaverna();
}
