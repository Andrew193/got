import { Component, inject, OnInit } from '@angular/core';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { ActivatedRoute } from '@angular/router';
import { StatsComponent } from '../../views/stats/stats.component';
import { EqName, Unit } from '../../../models/units-related/unit.model';
import { SkillsRenderComponent } from '../../views/skills-render/skills-render.component';
import { NgTemplateOutlet } from '@angular/common';
import { TileUnit } from '../../../models/field.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { RatingComponent } from '../../common/rating/rating.component';
import { TavernaPagesFooterComponent } from '../../../modules/taverna/views/taverna-pages-footer/taverna-pages-footer.component';

@Component({
  selector: 'app-hero-preview',
  imports: [
    StatsComponent,
    SkillsRenderComponent,
    NgTemplateOutlet,
    RatingComponent,
    TavernaPagesFooterComponent,
  ],
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss',
})
export class HeroPreviewComponent implements OnInit {
  nav = inject(NavigationService);
  route = inject(ActivatedRoute);
  facade = inject(HeroesFacadeService);

  selectedHero!: Unit;
  selectedTileHero!: TileUnit;
  getGearDescription = (name: EqName) => this.facade.helper.getGearDescription(name);
  getGearLevelByName = (name: EqName) =>
    this.facade.helper.getGearLevelByName(name, this.selectedHero);
  gearParts = this.facade.helper.gearParts;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['name']) {
        this.selectedHero = this.facade.getUnitByName(params['name'], {
          level: 1,
          rank: 1,
          eq1Level: 1,
          eq2Level: 1,
          eq3Level: 1,
          eq4Level: 1,
        });

        this.selectedTileHero = this.facade.getTileUnit(this.selectedHero);
      } else {
        this.backToTavern();
      }
    });
  }

  getIncrement(type: 'attackIncrement' | 'defenceIncrement' | 'healthIncrement') {
    return this.selectedHero[type];
  }

  backToTavern = () => this.nav.goToTaverna();
}
