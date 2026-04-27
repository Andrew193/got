import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { ActivatedRoute } from '@angular/router';
import { StatsComponent } from '../../views/stats/stats.component';
import { EqName, Unit } from '../../../models/units-related/unit.model';
import { SkillsRenderComponent } from '../../views/skills-render/skills-render.component';
import { TileUnit } from '../../../models/field.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { RatingComponent } from '../../common/rating/rating.component';
import { TavernaPagesFooterComponent } from '../../../modules/taverna/views/taverna-pages-footer/taverna-pages-footer.component';
import { UsersService } from '../../../services/users/users.service';
import { LocalStorageService } from '../../../services/localStorage/local-storage.service';
import { EquipmentCardComponent } from './equipment-card/equipment-card.component';

@Component({
  selector: 'app-hero-preview',
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    RatingComponent,
    TavernaPagesFooterComponent,
    EquipmentCardComponent,
    AsyncPipe,
  ],
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss',
})
export class HeroPreviewComponent implements OnInit {
  nav = inject(NavigationService);
  route = inject(ActivatedRoute);
  facade = inject(HeroesFacadeService);

  private usersService = inject(UsersService);
  private localStorageService = inject(LocalStorageService);

  selectedHero!: Unit;
  selectedTileHero!: TileUnit;
  getGearDescription = (name: EqName) => this.facade.helper.getGearDescription(name);
  getGearLevelByName = (name: EqName) =>
    this.facade.helper.getGearLevelByName(name, this.selectedHero);
  gearParts = this.facade.helper.gearParts;

  currency$ = this.usersService.$user.pipe(
    map(u => u?.currency ?? { gold: 0, silver: 0, copper: 0 }),
  );

  userId = this.localStorageService.getUserId();

  readonly eqNames: EqName[] = ['eq1', 'eq2', 'eq3', 'eq4'];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const heroName = params['name'];

      if (heroName) {
        this.selectedHero = this.facade.getUnitByName(heroName);

        this.selectedTileHero = this.facade.getTileUnit(this.selectedHero);
      } else {
        this.backToTavern();
      }
    });
  }

  getIncrement = (type: 'attackIncrement' | 'defenceIncrement' | 'healthIncrement') => {
    return this.selectedHero[type];
  };

  onEquipmentUpgraded() {
    this.selectedHero = this.facade.getUnitByName(this.selectedHero.name);
    this.selectedTileHero = this.facade.getTileUnit(this.selectedHero);
  }

  backToTavern = () => this.nav.goToTaverna();
}
