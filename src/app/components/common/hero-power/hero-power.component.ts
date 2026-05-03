import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { HeroesNamesCodes, Unit } from '../../../models/units-related/unit.model';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';

@Component({
  selector: 'app-hero-power',
  imports: [DecimalPipe],
  templateUrl: './hero-power.component.html',
  styleUrl: './hero-power.component.scss',
})
export class HeroPowerComponent {
  hero = input<Unit>();
  heroesService = inject(HeroesFacadeService);

  getHeroPower(hero: Unit) {
    if (!this.heroesService.isHeroLocked(hero.name as HeroesNamesCodes)) {
      const heroWithProgress = this.heroesService.getUnitByName(hero.name);

      return this.heroesService.helper.calculateHeroPower(heroWithProgress);
    }

    return 0;
  }
}
