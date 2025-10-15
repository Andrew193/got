import { Injectable } from '@angular/core';
import { Scenario, Scene } from '../../../../models/interfaces/scenes/scene.interface';
import { WelcomeComponent } from '../stages/welcome/welcome.component';
import { ChooseFirstHeroComponent } from '../stages/choose-first-hero/choose-first-hero.component';
import { SceneNames } from '../../../../constants';
import { FirstBattleComponent } from '../stages/first-battle/first-battle.component';
import { FinalComponent } from '../stages/final/final.component';

@Injectable({
  providedIn: 'root',
})
export class ScenariosHelperService {
  private scenes: Scene[] = [
    { component: WelcomeComponent, name: SceneNames.welcome },
    { component: ChooseFirstHeroComponent, name: SceneNames.firstHero },
    {
      component: FirstBattleComponent,
      name: SceneNames.firstBattle,
      contextName: SceneNames.firstHero,
    },
    { component: FinalComponent, name: SceneNames.finalAuth, contextName: SceneNames.firstBattle },
  ];

  adventureScenario: Scenario = {
    scenes: this.scenes,
  };
}
