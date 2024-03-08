import {Injectable} from '@angular/core';
import {GameFieldService, Skill, Unit} from "../game-field/game-field.service";
import {HeroesService} from "../heroes/heroes.service";
import {LogRecord} from "../../interface";
import {createDeepCopy} from "../../helpers";
import {ModalWindowService} from "../modal/modal-window.service";

@Injectable({
  providedIn: 'root',
})
export class GameService {
  gameResult = {
    headerMessage: "",
    headerClass: "",
    closeBtnLabel: ""
  }

  constructor(private heroService: HeroesService,
              private modalWindowService: ModalWindowService,
              private fieldService: GameFieldService) { }

  //Check buffs ( health restore )
  checkRestorePassiveSkills(units: Unit[], logs: LogRecord[]) {
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];
      if (unit.health) {
        unit.skills.forEach((skill) => {
          if (skill.passive && skill.restoreSkill) {
            const buffs = skill.buffs || [];
            for (let i = 0; i < buffs.length; i++) {
              const restoredHealth = this.heroService.getRestoredHealth(unit.maxHealth, buffs[i].m);
              logs.push({
                info: true, imgSrc: skill.imgSrc,
                message: `${unit.user ? 'Игрок' : 'Бот'} ${unit.name} восстановил ${restoredHealth} ед. !`
              })
              unit.health = this.heroService.getHealthAfterRestore(unit.health + restoredHealth, unit.maxHealth)
              units[index] = unit;
            }
          }
        })
      }
    }
  }

  //Shows skills in attack bar ( user units ) and decreases cooldonws by 1 for used skills
  selectSkillsAndRecountCooldown(units: Unit[], selectedUnit: Unit, recountCooldown = true) {
    const unitIndex = this.fieldService.findUnitIndex(units, selectedUnit);
    let skills: Skill[] = createDeepCopy(selectedUnit?.skills as Skill[]);
    if (recountCooldown) {
      skills = this.fieldService.recountSkillsCooldown(skills);
    }
    units[unitIndex] = {...units[unitIndex], skills: skills};
    return skills;
  }

  recountCooldownForUnit(unit: Unit) {
    return  {...unit, skills: this.fieldService.recountSkillsCooldown(createDeepCopy(unit.skills))};
  }

  checkCloseFight(userUnits: Unit[], aiUnits: Unit[]) {
    const allUserUnitsDead = userUnits.every((userUnit) => !userUnit.health);
    const allAiUnitsDead = aiUnits.every((aiUnit) => !aiUnit.health);
    if (allUserUnitsDead || allAiUnitsDead) {
      this.gameResult = {
        headerClass: allUserUnitsDead ? "red-b" : "green-b",
        headerMessage: allUserUnitsDead ? "Вы проиграли" : "Вы победили",
        closeBtnLabel: allUserUnitsDead ? "Попробовать позже" : "Отлично"
      }
      this.modalWindowService.openModal({...this.gameResult, open: true})
    }
  }
}
