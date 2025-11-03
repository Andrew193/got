import { Component, inject } from '@angular/core';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { TavernaHeroesTableComponent } from '../taverna-heroes-table/taverna-heroes-table.component';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { StoresConfig } from '../../../models/stores/stores.model';
import { MatIcon } from '@angular/material/icon';
import { TavernaPagesFooterComponent } from '../views/taverna-pages-footer/taverna-pages-footer.component';

@Component({
  selector: 'app-taverna-heroes-short-information',
  imports: [
    MatIcon,
    SkillsRenderComponent,
    TavernaHeroesTableComponent,
    TavernaPagesFooterComponent,
  ],
  templateUrl: './taverna-heroes-short-information.component.html',
  styleUrl: './taverna-heroes-short-information.component.scss',
})
export class TavernaHeroesShortInformationComponent {
  nav = inject(NavigationService);

  skillsRenderConfig: StoresConfig = {
    bordered: false,
    withBackground: false,
  };

  openHeroPreview = (name: string) => this.nav.goToHeroPreview(name);
}
