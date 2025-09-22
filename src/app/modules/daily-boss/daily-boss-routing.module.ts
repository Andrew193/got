import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DailyBossLobbyComponent } from './lobby/daily-boss-lobby.component';
import { DailyBossBattlefieldComponent } from './battlefield/daily-boss-battlefield.component';
import { frontRoutes } from '../../constants';
import { DailyBossEntryComponent } from './daily-boss-entry/daily-boss-entry.component';

export const dailyBossRoutes: Routes = [
  {
    path: frontRoutes.base,
    component: DailyBossEntryComponent,
    children: [
      { component: DailyBossLobbyComponent, path: frontRoutes.base },
      {
        component: DailyBossBattlefieldComponent,
        path: `${frontRoutes.dailyBossBattle}/:bossLevel`,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(dailyBossRoutes)],
  exports: [RouterModule],
})
export class DailyBossRoutingModule {}
