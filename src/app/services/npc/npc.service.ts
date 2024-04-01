import { Injectable } from '@angular/core';
import {HeroesService} from "../heroes/heroes.service";
import {Unit} from "../../interface";

@Injectable({
  providedIn: 'root'
})
export class NpcService {

  constructor(private heroService: HeroesService) { }

  getChest(): Unit {
    return {
      ...this.heroService.getBasicUserConfig(),
      attackRange: 1,
      rank: 1,
      eq1Level: 1,
      eq2Level: 1,
      eq3Level: 1,
      eq4Level: 1,
      rankBoost: 1,
      level: 1,
      healthIncrement: 0,
      attackIncrement: 0,
      defenceIncrement: 0,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 0,
      maxCanCross: 0,
      health: 1,
      attack: 1,
      defence: 1,
      maxHealth: 1,
      rage: 0,
      willpower: 0,
      imgSrc: "../../../assets/resourses/imgs/icons/chest.png",
      fullImgSrc: "../../../assets/resourses/imgs/icons/chest.png",
      name: "Chest",
      description: "Сундук со случайной наградой. Был давно потерян в этих краях.",
      skills: [],
      effects: []
    }
  }
}
