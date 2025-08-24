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
        loadChildren: () => import('./modules/taverna/taverna-routing.module').then(m => m.tavernaRoutes)
      },
      {
        path: frontRoutes.training,
        loadChildren: () => import('./modules/training/training-routing.module').then(m => m.tavernaRoutes)
      },
      {
        path: frontRoutes.dailyBoss,
        loadChildren: () => import('./modules/daily-boss/daily-boss-routing.module').then(m => m.dailyBossRoutes)
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
      }
    ]
  },
  {
    path: frontRoutes.login,
    loadChildren: () => import('./login.routes').then(r => r.LoginRoutes)
  }
];
