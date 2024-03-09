import {Injectable} from '@angular/core';
import {Effect, Skill, Unit} from "../game-field/game-field.service";

@Injectable({
    providedIn: 'root'
})
export class HeroesService {
    effects = {
        burning: "Горение",
        healthRestore: "Восстановление",
        defBreak: "Разлом брони",
        bleeding: "Кровотечение"
    }

    constructor() {
    }

    getMultForEffect(effect: Effect) {
        return {
            [this.effects.defBreak]: this.getDefBreak().m
        }[effect.type]
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

    getNumberForCommonEffects(health: number, m: number) {
        return +(health * m).toFixed(0)
    }

    getHealthRestore(turns = 1): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/health_restore_buff.png",
            type: this.effects.healthRestore,
            duration: turns,
            m: 0.05,
            restore: true
        }
    }

    getBurning(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/burning.png",
            type: this.effects.burning,
            duration: turns,
            m: 0.1
        }
    }

    getBleeding(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/bleeding.png",
            type: this.effects.bleeding,
            duration: turns,
            m: 0.05
        }
    }

    getDefBreak(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/def_break.png",
            type: this.effects.defBreak,
            duration: turns,
            passive: true,
            m: 0.5
        }
    }

    getDebuffDmg(name: string, health: number, m: number): number {
        return {
            [this.effects.burning]: this.getNumberForCommonEffects(health, m),
            [this.effects.bleeding]: this.getNumberForCommonEffects(health, m),
            [this.effects.healthRestore]: this.getNumberForCommonEffects(health, m)
        }[name] as number
    }

    getLadyOfDragonStone(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 1,
            ignoredDebuffs: [this.effects.burning],
            reducedDmgFromDebuffs: [],
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
                    debuffs: [this.getBurning(1)],
                    description: "Наносит противнику урон в размере 70% от показателя атаки и накладывает на него штраф "
                        + this.effects.burning + " на 1 ход."
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
                    debuffs: [this.getBurning(2), this.getBurning(2)],
                    description: "Наносит целевому врагу урон в размере 200% от показателя атаки и 90% от атаки врагам в радиусе 2 клеток и накладывает на них штраф "
                        + this.effects.burning + " на 2 хода."
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
                    restoreSkill: true,
                    description: "Перед началом хода восстанавливает 5% от максимального здоровья. Получает на 10% меньше урона от атак противников. На этого героя невозможно наложить штраф "
                        + this.effects.burning + ". В начале игры получает бонус " + this.effects.healthRestore + " на 2 раунда."
                }
            ],
            effects: [this.getHealthRestore(2)]
        }
    }

    getWhiteWolf(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 1,
            ignoredDebuffs: [],
            reducedDmgFromDebuffs: [],
            dmgReducedBy: 0,
            canCross: 3,
            health: 5837,
            attack: 1029,
            defence: 785,
            maxHealth: 5837,
            imgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaDireWolf.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaDireWolf.png",
            name: "Белый Волк",
            skills: [
                {
                    name: "Укус зверя",
                    imgSrc: "../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png",
                    dmgM: 1,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [this.getBleeding(1)],
                    description: "Наносит противнику урон в размере 100% от показателя атаки, накладывает на врага штраф "
                        + this.effects.bleeding + " на 1 ход."
                },
                {
                    name: "Рваная рана",
                    imgSrc: "../../../assets/resourses/imgs/heroes/wolf/skills/wolf_def_attack.png",
                    dmgM: 1.2,
                    cooldown: 3,
                    remainingCooldown: 0,
                    debuffs: [this.getDefBreak()],
                    description: "Наносит врагу урон в размере 120% от показателя атаки, накладывает на врага штраф "
                        + this.effects.defBreak + " на 2 хода."
                }
            ],
            effects: []
        }
    }

    getBrownWolf(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 1,
            ignoredDebuffs: [],
            reducedDmgFromDebuffs: [],
            dmgReducedBy: 0,
            canCross: 2,
            health: 4837,
            attack: 899,
            defence: 685,
            maxHealth: 4837,
            imgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaWolf.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaWolf.png",
            name: "Бурый Волк",
            skills: [
                {
                    name: "Укус",
                    imgSrc: "../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png",
                    dmgM: 1,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [],
                    description: "Наносит противнику урон в размере 100% от показателя атаки."
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
