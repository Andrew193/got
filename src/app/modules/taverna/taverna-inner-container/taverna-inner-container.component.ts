import { Component, inject } from '@angular/core';
import { TavernaHeroesBarComponent } from '../taverna-heroes-bar/taverna-heroes-bar.component';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { TavernaHeroesTableComponent } from '../taverna-heroes-table/taverna-heroes-table.component';
import { MatIcon } from '@angular/material/icon';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { StoresConfig } from '../../../models/stores/stores.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';

@Component({
  selector: 'app-taverna-inner-container',
  imports: [TavernaHeroesBarComponent, TavernaHeroesTableComponent, MatIcon, SkillsRenderComponent],
  providers: [TavernaFacadeService],
  templateUrl: './taverna-inner-container.component.html',
  styleUrl: './taverna-inner-container.component.scss',
})
export class TavernaInnerContainerComponent {
  nav = inject(NavigationService);

  skillsRenderConfig: StoresConfig = {
    bordered: false,
    withBackground: false,
  };

  backToMainPage = () => this.nav.goToMainPage();
}
