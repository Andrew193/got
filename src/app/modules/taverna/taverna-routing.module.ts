import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TavernaInnerContainerComponent } from './taverna-inner-container/taverna-inner-container.component';
import { HeroPreviewComponent } from '../../components/hero-preview/hero-preview.component';
import { frontRoutes } from '../../constants';

export const tavernaRoutes: Routes = [
  { component: TavernaInnerContainerComponent, path: frontRoutes.base },
  { component: HeroPreviewComponent, path: frontRoutes.preview },
];

@NgModule({
  imports: [RouterModule.forChild(tavernaRoutes)],
  exports: [RouterModule],
})
export class TavernaRoutingModule {}
