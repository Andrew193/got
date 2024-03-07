import {Injectable} from '@angular/core';
import {Effect, Skill, Unit} from "../game/game-field.service";

@Injectable({
    providedIn: 'root'
})
export class HeroesService {

    constructor() {
    }

    getEffectsWithIgnoreFilter(unit: Unit, skill: Skill) {
        const debuffsToSet = skill.debuffs?.filter((debuff) => !unit.ignoredDebuffs.includes(debuff.type))
        return [...unit.effects, ...(debuffsToSet || [])]
    }

    getHealthAfterDmg(health: number, dmg: number) {
        return +((health - dmg) > 0 ? health - dmg : 0).toFixed(0);
    }

    getHealthAfterRestore(health: number, maxHealth: number) {
        return +(health > maxHealth ? maxHealth : health).toFixed(0);
    }

    getRestoredHealth(health: number, m: number) {
        return health * m;
    }

    getHealthRestore(turns = 1): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/health_restore_buff.png",
            type: "Восстановление",
            duration: turns,
            m: 0.05
        }
    }

    getBurning(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/burning.png",
            type: "Горение",
            duration: turns,
            m: 0.05
        }
    }

    getDebuffDmg(name: string, health: number, m: number): number {
        return {
            "Горение": this.getBurningDmg(health, m),
            "Восстановление": this.getRestoredHealth(health, m)
        }[name] as number
    }

    getBurningDmg(health: number, m: number) {
        return +(health * m).toFixed(0)
    }

    getLadyOfDragonStone(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 1,
            ignoredDebuffs: [this.getBurning().type],
            dmgReducedBy: 0.1,
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
                    name: "Сожжение",
                    imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_HeroicAbility_BloodOfTheDragon.jpeg",
                    dmgM: 0.7,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [this.getBurning(1)]
                },
                {
                    name: "Дракарис",
                    imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_ActiveAbility_Dracarys.jpeg",
                    dmgM: 2,
                    cooldown: 3,
                    remainingCooldown: 0,
                    attackInRange: true,
                    attackRange: 2,
                    attackInRangeM: 0.9,
                    debuffs: [this.getBurning(2), this.getBurning(2)]
                },
                {
                    name: "Таргариен",
                    imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_PassiveAbility_FerventDevotion.jpeg",
                    dmgM: 0,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [],
                    buffs: [this.getHealthRestore()],
                    passive: true,
                    restoreSkill: true
                }
            ],
            effects: []
        }
    }

    getBasicUserConfig() {
        return {
            x: 3, y: 6, user: true, canMove: true, canAttack: true
        }
    }
}
