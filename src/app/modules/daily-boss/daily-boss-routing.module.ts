import {RouterModule, Routes} from "@angular/router";
import {frontRoutes} from "../../app.routes";
import {NgModule} from "@angular/core";
import {DailyBossLobbyComponent} from "./lobby/daily-boss-lobby.component";
import {DailyBossBattlefieldComponent} from "./battlefield/daily-boss-battlefield.component";


const routes: Routes = [
  {component: DailyBossLobbyComponent, path: frontRoutes.base},
  {component: DailyBossBattlefieldComponent, path: frontRoutes.dailyBossBattle},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyBossRoutingModule { }
