import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { TrainingConfigComponent } from './training-config/training-config.component';
import { TrainingBattleComponent } from './training-battle/training-battle.component';
import { frontRoutes } from '../../constants';
import { TrainingComponent } from './training/training.component';

export const trainingRoutes: Routes = [
  {
    path: frontRoutes.base,
    component: TrainingComponent,
    children: [
      { component: TrainingConfigComponent, path: frontRoutes.base },
      { component: TrainingBattleComponent, path: frontRoutes.trainingBattle },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(trainingRoutes)],
  exports: [RouterModule],
})
export class TrainingRoutingModule {}
