import {Routes} from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {TavernaComponent} from "./components/taverna/taverna.component";
import {GameEntryPointComponent} from "./components/game-entry-point/game-entry-point.component";
import {TavernaHeroesBarComponent} from "./components/taverna-heroes-bar/taverna-heroes-bar.component";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {HeroPreviewComponent} from "./components/hero-preview/hero-preview.component";
import {TavernaInnerContainerComponent} from "./components/taverna-inner-container/taverna-inner-container.component";
import {TrainingComponent} from "./components/training/training.component";
import {SummonTreeComponent} from "./components/summon-tree/summon-tree.component";
import {GiftStoreComponent} from "./components/gift-store/gift-store.component";

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
    component: SiteComponent, path: frontRoutes.base, children: [
      {component: LobbyComponent, path: frontRoutes.base},
      {
        component: TavernaComponent, path: frontRoutes.taverna, children: [
          {component: TavernaInnerContainerComponent, path: frontRoutes.base},
          {component: HeroPreviewComponent, path: frontRoutes.preview}
        ]
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
