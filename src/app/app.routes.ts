import { Routes } from '@angular/router';
import {SiteComponent} from "./pages/site/site.component";
import {LobbyComponent} from "./pages/lobby/lobby.component";
import {TavernaComponent} from "./components/taverna/taverna.component";
import {GameBoardComponent} from "./components/game-board/game-board.component";

export const routes: Routes = [
  {component: SiteComponent, path: "", children: [
      {component: LobbyComponent, path: ""},
      {component: TavernaComponent, path: "taverna"},
      {component: GameBoardComponent, path: "test-b"}
    ]}
];
