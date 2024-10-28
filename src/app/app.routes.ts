import {Routes} from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {TavernaComponent} from "./modules/taverna/taverna/taverna.component";
import {TrainingComponent} from "./modules/training/training/training.component";
import {AuthGuard} from "./guards/canActivate";
import {DailyBossEntryComponent} from "./modules/daily-boss/daily-boss-entry/daily-boss-entry.component";

export const frontRoutes = {
  base: "",
  taverna: "taverna",
  preview: "preview",
  battleField: "test-b",
  training: "training",
  trainingBattle: "training-battle",
  dailyBoss: "daily-boss",
  dailyBossBattle: "fight",
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
        component: TavernaComponent,
        path: frontRoutes.taverna,
        loadChildren: () => import('./modules/taverna/taverna.module').then(m => m.TavernaModule)
      },
      {
        component: TrainingComponent,
        path: frontRoutes.training,
        loadChildren: () => import('./modules/training/training.module').then(m => m.TrainingModule)
      },
      {
        component: DailyBossEntryComponent,
        path: frontRoutes.dailyBoss,
        loadChildren: () => import('./modules/daily-boss/daily-boss.module').then(m => m.DailyBossModule)
      },
      {
        path: frontRoutes.summonTree,
        loadComponent: () => import('./components/summon-tree/summon-tree.component').then(c => c.SummonTreeComponent)
      },
      {
        path: frontRoutes.battleField,
        loadComponent: () => import('./components/game-entry-point/game-entry-point.component').then(c => c.GameEntryPointComponent)
      },
      {
        path: frontRoutes.giftStore,
        loadComponent: () => import('./components/gift-store/gift-store.component').then(c => c.GiftStoreComponent)
      }
    ]
  },
  {
    path: frontRoutes.login,
    loadChildren: () => import('./login.routes').then(r => r.LoginRoutes)
  }
];
