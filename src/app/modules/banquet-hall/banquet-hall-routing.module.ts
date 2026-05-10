import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { frontRoutes } from '../../constants';
import { BanquetHallEntryComponent } from './banquet-hall-entry/banquet-hall-entry.component';
import { BanquetHallLobbyComponent } from './banquet-hall-lobby/banquet-hall-lobby.component';
import { BanquetBattlefieldComponent } from './banquet-battlefield/banquet-battlefield.component';

export const banquetHallRoutes: Routes = [
  {
    path: frontRoutes.base,
    component: BanquetHallEntryComponent,
    children: [
      { path: frontRoutes.base, component: BanquetHallLobbyComponent },
      { path: frontRoutes.banquetBattle, component: BanquetBattlefieldComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(banquetHallRoutes)],
  exports: [RouterModule],
})
export class BanquetHallRoutingModule {}
