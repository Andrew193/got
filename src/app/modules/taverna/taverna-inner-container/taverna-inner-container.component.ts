import { Component, inject } from '@angular/core';
import { TavernaHeroesBarComponent } from '../taverna-heroes-bar/taverna-heroes-bar.component';
import { TavernaFacadeService } from '../../../services/facades/taverna/taverna.service';
import { TavernaHeroesTableComponent } from '../taverna-heroes-table/taverna-heroes-table.component';
import { MatIcon } from '@angular/material/icon';
import { SkillsRenderComponent } from '../../../components/views/skills-render/skills-render.component';
import { StoresConfig } from '../../../models/stores/stores.model';
import { NavigationService } from '../../../services/facades/navigation/navigation.service';
import { PageLoaderComponent } from '../../../components/views/page-loader/page-loader.component';
import { LoaderService } from '../../../services/resolver-loader/loader.service';
import { frontRoutes } from '../../../constants';

@Component({
  selector: 'app-taverna-inner-container',
  imports: [
    TavernaHeroesBarComponent,
    TavernaHeroesTableComponent,
    MatIcon,
    SkillsRenderComponent,
    PageLoaderComponent,
  ],
  providers: [TavernaFacadeService],
  templateUrl: './taverna-inner-container.component.html',
  styleUrl: './taverna-inner-container.component.scss',
})
export class TavernaInnerContainerComponent {
  loaderService = inject(LoaderService);
  loader = this.loaderService.getPageLoader(frontRoutes.taverna);

  nav = inject(NavigationService);

  skillsRenderConfig: StoresConfig = {
    bordered: false,
    withBackground: false,
  };

  backToMainPage = () => this.nav.goToMainPage();
  openHeroPreview = (name: string) => this.nav.goToHeroPreview(name);
}
