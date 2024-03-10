import {Injectable} from '@angular/core';
import {Effect, GameFieldService, Skill, Unit} from "../game-field/game-field.service";
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
                private fieldService: GameFieldService) {
    }

    getFixedDefence(defence: number, unit: Unit) {
        const defReducedEffect = unit.effects.find((effect)=>effect.type === this.heroService.effects.defBreak)
        return !!defReducedEffect ? defence * this.heroService.getMultForEffect(defReducedEffect): defence
    }

    getFixedAttack(attack: number, unit: Unit) {
        const attackReducedEffect = unit.effects.find((effect)=>effect.type === this.heroService.effects.attackBreak)
        return !!attackReducedEffect ? attack * this.heroService.getMultForEffect(attackReducedEffect): attack
    }

    //Check buffs ( health restore )
    checkRestorePassiveSkills(units: Unit[], logs: LogRecord[]) {
        for (let index = 0; index < units.length; index++) {
            const unit = units[index];
            if (unit.health) {
                unit.skills.forEach((skill) => {
                    if (skill.passive && skill.restoreSkill) {
                        const buffs = skill.buffs || [];
                        for (let i = 0; i < buffs.length; i++) {
                            units[index] = this.restoreHealthForUnit(unit, buffs[i], logs, skill);
                        }
                    }
                })
            }
        }
    }

    restoreHealthForUnit(unit: Unit, buff: Effect, logs: LogRecord[], skill: Skill) {
        const restoredHealth = this.heroService.getNumberForCommonEffects(unit.maxHealth, buff.m);
        this.logRestoreHealth(logs, skill, unit, restoredHealth);
        unit.health = this.heroService.getHealthAfterRestore(unit.health + restoredHealth, unit.maxHealth)
        return unit;
    }

    logRestoreHealth(logs: LogRecord[], skill: Skill, unit: Unit, restoredHealth: number) {
        logs.push({
            info: true, imgSrc: skill.imgSrc,
            message: `${unit.user ? 'Игрок' : 'Бот'} ${unit.name} восстановил ${restoredHealth} ед. !`
        })
    }

    checkEffectsForHealthRestore(unit: Unit, logs: LogRecord[]) {
        unit.effects.forEach((effect) => {
            if (effect.type === this.heroService.effects.healthRestore) {
                unit = this.restoreHealthForUnit(unit, effect, logs, {imgSrc: effect.imgSrc} as Skill)
            }
        })
    }

    getReducedDmgForEffects(unit: Unit, dmg: number, debuff?: Effect) {
        let isDmgReduced = false;
        if (debuff) {
            isDmgReduced = unit.reducedDmgFromDebuffs.includes(debuff.type);
        }
        const dmgAfterReductionByPassiveSkills = !!unit.dmgReducedBy ? dmg - dmg * unit.dmgReducedBy : dmg;
        return +(isDmgReduced ? dmgAfterReductionByPassiveSkills - dmgAfterReductionByPassiveSkills * 0.25 : dmgAfterReductionByPassiveSkills).toFixed(0);
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
        return {...unit, skills: this.fieldService.recountSkillsCooldown(createDeepCopy(unit.skills))};
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
