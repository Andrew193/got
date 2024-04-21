import {Routes} from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {TavernaComponent} from "./modules/taverna/taverna/taverna.component";
import {GameEntryPointComponent} from "./components/game-entry-point/game-entry-point.component";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {TrainingComponent} from "./components/training/training.component";
import {SummonTreeComponent} from "./components/summon-tree/summon-tree.component";
import {GiftStoreComponent} from "./components/gift-store/gift-store.component";
import {AuthGuard} from "./guards/canActivate";

export const frontRoutes = {
  base: "",
  taverna: "taverna",
  preview: "preview",
  battleField: "test-b",
  training: "training",
  login: "login",
  summonTree: "summon-tree",
  giftStore: "gift-lands"
}

export const routes: Routes = [
  {
    component: SiteComponent, path: frontRoutes.base, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      {component: LobbyComponent, path: frontRoutes.base},
      {
        component: TavernaComponent, path: frontRoutes.taverna,
        loadChildren: () => import('./modules/taverna/taverna.module').then(m => m.TavernaModule)
      },
      {component: TrainingComponent, path: frontRoutes.training},
      {component: SummonTreeComponent, path: frontRoutes.summonTree},
      {component: GameEntryPointComponent, path: frontRoutes.battleField},
      {component: GiftStoreComponent, path: frontRoutes.giftStore}
    ]
  },
  {
    component: LoginPageComponent, path: frontRoutes.login
  }
];
