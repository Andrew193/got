import {Routes} from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {AuthGuard, GiftGuard} from "./guards/canActivate";
import {frontRoutes} from "./constants";

export const routes: Routes = [
  {
    component: SiteComponent, path: frontRoutes.base, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      {component: LobbyComponent, path: frontRoutes.base},
      {
        path: frontRoutes.taverna,
        loadChildren: () => import('./modules/taverna/taverna.module').then(m => m.TavernaModule)
      },
      {
        path: frontRoutes.training,
        loadChildren: () => import('./modules/training/training.module').then(m => m.TrainingModule)
      },
      {
        path: frontRoutes.dailyBoss,
        loadChildren: () => import('./modules/daily-boss/daily-boss.module').then(m => m.DailyBossModule)
      },
      {
        path: frontRoutes.summonTree,
        loadComponent: () => import('./pages/summon-tree/summon-tree.component').then(c => c.SummonTreeComponent)
      },
      {
        path: frontRoutes.battleField,
        loadComponent: () => import('./components/game-entry-point/game-entry-point.component').then(c => c.GameEntryPointComponent)
      },
      {
        path: frontRoutes.giftStore,
        canActivate: [GiftGuard],
        loadComponent: () => import('./pages/gift-store/gift-store.component').then(c => c.GiftStoreComponent)
      },
      {
        path: frontRoutes.ironBank,
        loadComponent: () => import('./pages/iron-bank/iron-bank.component').then(c => c.IronBankComponent)
      },
    ]
  },
  {
    path: frontRoutes.login,
    loadChildren: () => import('./login.routes').then(r => r.LoginRoutes)
  }
];
