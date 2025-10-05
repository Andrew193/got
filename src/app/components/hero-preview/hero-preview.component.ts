import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../services/heroes/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RatingModule } from 'ngx-bootstrap/rating';
import { FormsModule } from '@angular/forms';
import { StatsComponent } from '../views/stats/stats.component';
import { Unit } from '../../models/unit.model';
import { SkillsRenderComponent } from '../views/skills-render/skills-render.component';
import { frontRoutes } from '../../constants';
import { NgTemplateOutlet } from '@angular/common';
import { TileUnit } from '../../models/field.model';

@Component({
  selector: 'app-hero-preview',
  imports: [RatingModule, FormsModule, StatsComponent, SkillsRenderComponent, NgTemplateOutlet],
  templateUrl: './hero-preview.component.html',
  styleUrl: './hero-preview.component.scss',
})
export class HeroPreviewComponent implements OnInit {
  name = '';
  selectedHero!: Unit;
  selectedTileHero!: TileUnit;

  itemDescriptions: Record<string, string> = {
    eq1: 'The breastplate is a very important piece of armor for any warrior.',
    eq2: "Scrags are a very important piece of armor for any warrior. You can't fight much with bare feet.",
    eq3: 'An amulet is a very important piece of armor for any warrior. Fortitude and faith are very important.',
    eq4: 'A relic of this hero. Gives a bonus to parameters.',
  };

  constructor(
    public heroService: HeroesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(console.log);

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
    this.router.navigate([frontRoutes.taverna]);
  }
}
