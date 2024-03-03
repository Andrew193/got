import {Injectable} from '@angular/core';
import {Unit} from "../game/game-field.service";

@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  constructor() {
  }

  getLadyOfDragonStone(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 1,
      canCross: 2,
      health: 9837,
      imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png"
    }
  }

  getBasicUserConfig() {
    return {
      x: 3, y: 6, user: true, canMove: true, canAttack: true
    }
  }
}
