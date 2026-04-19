import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { frontRoutes } from '../../constants';
import { CampaignEntryComponent } from './campaign-entry/campaign-entry.component';
import { CampaignLobbyComponent } from './campaign-lobby/campaign-lobby.component';
import { CampaignBattlefieldComponent } from './campaign-battlefield/campaign-battlefield.component';

export const campaignRoutes: Routes = [
  {
    path: frontRoutes.base,
    component: CampaignEntryComponent,
    children: [
      { path: frontRoutes.base, component: CampaignLobbyComponent },
      { path: 'battle', component: CampaignBattlefieldComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(campaignRoutes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
