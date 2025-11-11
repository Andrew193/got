import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TavernaHeroesBarContainerComponent } from './taverna-inner-container/taverna-inner-container.component';
import { HeroPreviewComponent } from '../../components/heroes-related/hero-preview/hero-preview.component';
import { frontRoutes } from '../../constants';
import { TavernaComponent } from './taverna/taverna.component';
import { TavernaHeroesShortInformationComponent } from './taverna-heroes-short-information/taverna-heroes-short-information.component';
import { TavernaSynergyOverviewComponent } from './taverna-heroes-skill-overview/taverna-synergy-overview.component';

export const tavernaRoutes: Routes = [
  { component: TavernaComponent, path: frontRoutes.base },
  { component: TavernaHeroesShortInformationComponent, path: frontRoutes.shortInformation },
  { component: TavernaHeroesBarContainerComponent, path: frontRoutes.tavernaHeroesBar },
  { component: HeroPreviewComponent, path: frontRoutes.preview },
  { component: TavernaSynergyOverviewComponent, path: frontRoutes.tavernaSynergyOverview },
];

@NgModule({
  imports: [RouterModule.forChild(tavernaRoutes)],
  exports: [RouterModule],
})
export class TavernaRoutingModule {}
