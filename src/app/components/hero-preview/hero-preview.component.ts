import { Component, inject, OnInit } from '@angular/core';
import { HeroesService } from '../../services/heroes/heroes.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StatsComponent } from '../views/stats/stats.component';
import { Unit } from '../../models/unit.model';
import { SkillsRenderComponent } from '../views/skills-render/skills-render.component';
import { NgTemplateOutlet } from '@angular/common';
import { TileUnit } from '../../models/field.model';
import { NavigationService } from '../../services/facades/navigation/navigation.service';
import { RatingComponent } from '../common/rating/rating.component';

type EqName = 'eq1' | 'eq2' | 'eq3' | 'eq4';

@Component({
  selector: 'app-hero-preview',
  imports: [FormsModule, StatsComponent, SkillsRenderComponent, NgTemplateOutlet, RatingComponent],
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss',
})
export class HeroPreviewComponent implements OnInit {
  nav = inject(NavigationService);

  name = '';
  selectedHero!: Unit;
  selectedTileHero!: TileUnit;

  itemDescriptions: Record<EqName, string> = {
    eq1: 'The breastplate is a very important piece of armor for any warrior.',
    eq2: "Scrags are a very important piece of armor for any warrior. You can't fight much with bare feet.",
    eq3: 'An amulet is a very important piece of armor for any warrior. Fortitude and faith are very important.',
    eq4: 'A relic of this hero. Gives a bonus to parameters.',
  };

  constructor(
    public heroService: HeroesService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.name = params['name'];
      this.selectedHero = this.heroService.getUnitByName(this.name, {
        level: 1,
        rank: 1,
        eq1Level: 1,
        eq2Level: 1,
        eq3Level: 1,
        eq4Level: 1,
      });

      this.selectedTileHero = this.heroService.getTileUnit(this.selectedHero);
    });
  }

  backToTavern() {
    this.nav.goToTaverna();
  }

  getLevelByName(name: EqName) {
    const h = this.selectedHero;

    return (
      {
        eq1: h.eq1Level,
        eq2: h.eq2Level,
        eq3: h.eq3Level,
        eq4: h.eq4Level,
      } satisfies Record<EqName, number>
    )[name];
  }

  getItemDescription(name: EqName) {
    return this.itemDescriptions[name];
  }
}
