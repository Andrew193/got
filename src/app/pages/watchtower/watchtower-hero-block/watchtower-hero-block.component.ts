import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { StatsComponent } from '../../../components/views/stats/stats.component';

@Component({
  selector: 'app-watchtower-hero-block',
  imports: [SkillsRenderComponent, StatsComponent],
  templateUrl: './watchtower-hero-block.component.html',
  styleUrl: './watchtower-hero-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchtowerHeroBlockComponent {
  heroName = input.required<HeroesNamesCodes>();

  private heroesService = inject(HeroesFacadeService);

  heroUnit = computed(() => this.heroesService.allUnits.find(u => u.name === this.heroName()));
  tileUnit = computed(() =>
    this.heroesService.getTileUnits().find(u => u.name === this.heroName()),
  );
}
