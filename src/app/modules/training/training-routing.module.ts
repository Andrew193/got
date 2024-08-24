import {RouterModule, Routes} from "@angular/router";
import {frontRoutes} from "../../app.routes";
import {NgModule} from "@angular/core";
import {TrainingConfigComponent} from "./training-config/training-config.component";
import {TrainingBattleComponent} from "./training-battle/training-battle.component";


const routes: Routes = [
    {component: TrainingConfigComponent, path: frontRoutes.base},
    {component: TrainingBattleComponent, path: frontRoutes.trainingBattle},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TavernaRoutingModule { }