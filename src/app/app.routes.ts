import {Routes} from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {TavernaComponent} from "./components/taverna/taverna.component";
import {GameBoardComponent} from "./components/game-board/game-board.component";
import {TavernaHeroesBarComponent} from "./components/taverna-heroes-bar/taverna-heroes-bar.component";
import {LoginPageComponent} from "./pages/login-page/login-page.component";

export const frontRoutes = {
  base: "",
  taverna: "taverna",
  battleField: "test-b",
  login: "login"
}

export const routes: Routes = [
  {
    component: SiteComponent, path: frontRoutes.base, children: [
      {component: LobbyComponent, path: frontRoutes.base},
      {
        component: TavernaComponent, path: frontRoutes.taverna, children: [
          {component: TavernaHeroesBarComponent, path: frontRoutes.base},
        ]
      },
      {component: GameBoardComponent, path: frontRoutes.battleField}
    ]
  },
  {
    component: LoginPageComponent, path: frontRoutes.login
  }
];
