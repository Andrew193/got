import { Injectable } from '@angular/core';
import { Scene } from '../../../../models/interfaces/scenes/scene.interface';
import { WelcomeComponent } from '../stages/welcome/welcome.component';
import { ChooseFirstHeroComponent } from '../stages/choose-first-hero/choose-first-hero.component';

@Injectable({
  providedIn: 'root',
})
export class AdventureScenesHelperService {
  scenes: Scene[] = [{ component: WelcomeComponent }, { component: ChooseFirstHeroComponent }];
}
