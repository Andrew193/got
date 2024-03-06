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
      attack: 1529,
      defence: 1185,
      maxHealth: 9837,
      imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png",
      fullImgSrc: "../../../assets/resourses/imgs/heroes/lds/LadyOfDragonstone_DaenarysTargaryen.png",
      name: "Дейнерис Таргариен ( Леди Драконьего Камня )",
      skills: [
        {
          name: "Дракарис",
          imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_ActiveAbility_Dracarys.jpeg",
          dmgM: 2,
          cooldown: 3,
          remainingCooldown: 0,
          debuffs: []
        },
        {
          name: "Сожжение",
          imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_PassiveAbility_FerventDevotion.jpeg",
          dmgM: 0.7,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: []
        }
      ]
    }
  }

  getBasicUserConfig() {
    return {
      x: 3, y: 6, user: true, canMove: true, canAttack: true
    }
  }
}
