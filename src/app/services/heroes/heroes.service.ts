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
        bleeding: "Кровотечение",
        poison: "Отравление",
        attackBuff: "Бонус атаки",
        defBuff: "Бонус защиты",
        attackBreak: "Заржавелый Меч"
    }

    get effectsToHighlight() {
        return Object.values(this.effects)
    }

    constructor() {
    }

    getMultForEffect(effect: Effect) {
        return {
            [this.effects.defBreak]: this.getDefBreak().m,
            [this.effects.attackBreak]: this.getAttackBreak().m
        }[effect.type]
    }

    getEffectsWithIgnoreFilter(unit: Unit, skill: Skill, addRangeEffects = false) {
        const debuffsToSet = (addRangeEffects ? skill.inRangeDebuffs : skill.debuffs)?.filter((debuff) => !unit.ignoredDebuffs.includes(debuff.type))
        return [...unit.effects, ...(debuffsToSet || [])]
    }

    getBoostedAttack(attack: number, effects: Effect[]) {
        const shouldBoostAttack = effects.findIndex((effect) => effect.type === this.effects.attackBuff);
        return shouldBoostAttack !== -1 ? attack * 1.5 : attack;
    }

    getBoostedDefence(defence: number, effects: Effect[]) {
        const shouldBoostAttack = effects.findIndex((effect) => effect.type === this.effects.defBuff);
        return shouldBoostAttack !== -1 ? defence * 1.5 : defence;
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

    getPoison(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/poison.png",
            type: this.effects.poison,
            duration: turns,
            m: 0.075
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

    getAttackBreak(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/attack_break.png",
            type: this.effects.attackBreak,
            duration: turns,
            passive: true,
            m: 0.5
        }
    }

    getAttackBuff(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/attack_buff.png",
            type: this.effects.attackBuff,
            duration: turns,
            passive: true,
            m: 1.5
        }
    }

    getDefBuff(turns = 2): Effect {
        return {
            imgSrc: "../../../assets/resourses/imgs/icons/def_buff.png",
            type: this.effects.defBuff,
            duration: turns,
            passive: true,
            m: 1.5
        }
    }

    getDebuffDmg(name: string, health: number, m: number): number {
        return {
            [this.effects.burning]: this.getNumberForCommonEffects(health, m),
            [this.effects.bleeding]: this.getNumberForCommonEffects(health, m),
            [this.effects.poison]: this.getNumberForCommonEffects(health, m),
            [this.effects.healthRestore]: this.getNumberForCommonEffects(health, m)
        }[name] as number
    }

    getLadyOfDragonStone(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 1,
            ignoredDebuffs: [this.effects.burning],
            reducedDmgFromDebuffs: [this.effects.bleeding],
            dmgReducedBy: 0.1,
            canCross: 2,
            health: 9837,
            attack: 1529,
            defence: 1385,
            maxHealth: 9837,
            rage: 25,
            willpower: 25,
            imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/lds/LadyOfDragonstone_DaenarysTargaryen.png",
            name: "Дейнерис Таргариен ( Леди Драконьего Камня )",
            description: "По мере того как ее влияние растет, способность Дейенерис направлять огонь своего сердца через свой народ заставляет ее совершать великие военные подвиги.",
            skills: [
                {
                    name: "Сожжение",
                    imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_HeroicAbility_BloodOfTheDragon.jpeg",
                    dmgM: 1,
                    cooldown: 0,
                    remainingCooldown: 0,
                    attackInRange: true,
                    attackRange: 1,
                    attackInRangeM: 0.5,
                    debuffs: [this.getBurning(1)],
                    inRangeDebuffs: [this.getDefBreak(1)],
                    description: "Наносит противнику урон в размере 100% от показателя атаки и накладывает на него штраф "
                        + this.effects.burning + " на 1 ход. Также атакует врагов в радиусе 1 клетки на 50% от показателя атаки,"
                        + " накладывает на них штраф " + this.effects.defBreak + " на 1 ход."
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
                    buffs: [this.getAttackBuff(), this.getDefBuff()],
                    debuffs: [this.getBurning(2), this.getBurning(2), this.getDefBreak()],
                    inRangeDebuffs: [this.getBleeding(2)],
                    description: "Наносит целевому врагу урон в размере 200% от показателя атаки, накладывает на него 2 штрафа "
                        + this.effects.burning + " и " + this.effects.defBreak + " на 2 хода. Наносит 90% от атаки врагам в радиусе 2 клеток и накладывает на них штраф "
                        + this.effects.bleeding + " на 2 хода. Перед атакой накладывает на себя " + this.effects.attackBuff + " и " + this.effects.defBuff + " на 2 хода."
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
                    description: "Получает на 10% меньше урона от атак противников. Получает на 25% меньше урона от штрафа" + this.effects.bleeding + ". На этого героя невозможно наложить штраф "
                        + this.effects.burning + ". В начале игры получает бонус " + this.effects.healthRestore + " на 2 раунда. Имеет шанс воскреснуть после смертельного удара. "
                        + "Перед началом каждого хода получает бонус " + this.effects.healthRestore + " на 1 ход и мгновенно активирует его."
                }
            ],
            effects: [this.getHealthRestore(2)]
        }
    }

    getTargaryenKnight(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 1,
            ignoredDebuffs: [this.effects.burning],
            reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
            dmgReducedBy: 0.25,
            canCross: 2,
            health: 15837,
            attack: 829,
            defence: 2385,
            maxHealth: 15837,
            rage: 25,
            willpower: 50,
            imgSrc: "../../../assets/resourses/imgs/heroes/targaryen_knight/UI_Avatar_Unit_21.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/targaryen_knight/UI_UnitFull_21.png",
            name: "Рыцарь Таргариенов",
            description: "Всесторонний воин Таргариенов из Королевских земель, этот рыцарь превосходен как в нападении, так и в защите.",
            skills: [
                {
                    name: "Ярость дракона",
                    imgSrc: "../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_ActiveAbility_Intimidate.webp",
                    dmgM: 0.9,
                    cooldown: 0,
                    remainingCooldown: 0,
                    attackInRange: true,
                    attackRange: 1,
                    attackInRangeM: 0.9,
                    debuffs: [this.getAttackBreak()],
                    inRangeDebuffs: [this.getAttackBreak()],
                    description: "Наносит противнику и врагам в радиусе 1 клетки урон в размере 90% от показателя атаки и накладывает на них штраф"
                    + this.effects.attackBreak + "на 2 хода."
                },
                {
                    name: "За Короля",
                    imgSrc: "../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_HeroicAbility_ShieldMastery.webp",
                    dmgM: 1.5,
                    cooldown: 3,
                    remainingCooldown: 0,
                    attackInRange: true,
                    attackRange: 2,
                    attackInRangeM: 0.9,
                    buffs: [this.getDefBuff()],
                    debuffs: [],
                    inRangeDebuffs: [this.getDefBreak()],
                    description: "Наносит целевому врагу урон в размере 150% от показателя атаки. Наносит 90% от атаки врагам в радиусе 2 клеток и накладывает на них штраф "
                        + this.effects.defBreak + " на 2 хода. Перед атакой накладывает на себя " + this.effects.defBuff + " на 2 хода."
                },
                {
                    name: "Щит короны",
                    imgSrc: "../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_PassiveAbility_ScaledArmor.webp",
                    dmgM: 0,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [],
                    buffs: [],
                    passive: true,
                    restoreSkill: true,
                    description: "Получает на 25% меньше урона от атак противников. Получает на 25% меньше урона от штрафов " + this.effects.bleeding + " и " + this.effects.poison +
                        ". На этого героя невозможно наложить штраф " + this.effects.burning + "."
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
            rage: 15,
            willpower: 0,
            imgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaDireWolf.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Icon_Avatar_FullBody_AlphaDireWolf.png",
            name: "Белый Волк",
            description: "Альфа стаи за стеной. Вселяет ужас в сердца людей и наносит ужасные раны в гневе.",
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
            rage: 0,
            willpower: 0,
            imgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaWolf.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/wolf/UI_Icon_Avatar_FullBody_AlphaWolf.png",
            name: "Бурый Волк",
            description: "Волк стаи за стеной.",
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

    getFreeTrapper(): Unit {
        return {
            ...this.getBasicUserConfig(),
            attackRange: 2,
            ignoredDebuffs: [],
            reducedDmgFromDebuffs: [this.effects.poison],
            dmgReducedBy: 0,
            canCross: 2,
            health: 8169,
            attack: 1299,
            defence: 995,
            maxHealth: 8169,
            rage: 20,
            willpower: 20,
            imgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/UI_Avatar_Unit_FreeFolksTrappers.png",
            fullImgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/UI_Icon_Avatar_FullBody_Wildling_08_FreeFolksTrappers.png",
            name: "Лучник Вольного Народа",
            description: "Лучник вольного народа изучал мастерство убийства с рождения. Он мастерски владеет природными ядами и умеет ставить капканы на животных и людей.",
            skills: [
                {
                    name: "Токсичный выстрел",
                    imgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_c_skill.png",
                    dmgM: 1.5,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [this.getPoison(1)],
                    description: "Наносит противнику урон в размере 150% от показателя атаки, накладывает штраф " + this.effects.poison + " на 1 ход."
                },
                {
                    name: "Ловушка",
                    imgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_a_skill.png",
                    dmgM: 2,
                    cooldown: 3,
                    remainingCooldown: 0,
                    attackInRange: true,
                    attackRange: 2,
                    attackInRangeM: 0.5,
                    debuffs: [this.getBleeding(), this.getDefBreak()],
                    buffs: [],
                    inRangeDebuffs: [],
                    description: "Наносит противнику урон в размере 200% от показателя атаки, накладывает на врага штрафы: "
                        + this.effects.bleeding + " и " + this.effects.defBreak + " на 2 хода. Также атакует противников в радиусе 1 клетки на 50% от атаки."
                },
                {
                    name: "Вольный человек",
                    imgSrc: "../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_passive.png",
                    dmgM: 0,
                    cooldown: 0,
                    remainingCooldown: 0,
                    debuffs: [],
                    buffs: [],
                    passive: true,
                    description: "Этот герой получает на 25% меньше урона от штрафа " + this.effects.poison + "."
                }
            ],
            effects: []
        }
    }

     getGiant(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0.5,
      canCross: 1,
      health: 93837,
      attack: 3529,
      defence: 7385,
      maxHealth: 93837,
      rage: 10,
      willpower: 15,
      imgSrc: "../../../assets/resourses/imgs/heroes/giant/UI_Avatar_Unit_Giant.png",
      fullImgSrc: "../../../assets/resourses/imgs/heroes/giant/UI_ChallengeBossBGAndIcon_Giant_FullBody.png",
      name: "Гигант",
      description: "Невероятно сильный враг. Мифическое существо из сказаний. Его шкуру почти невозможно пробить оружием, но он уязвим к ослаблениям.",
      skills: [
        {
          name: "Могучий удар",
          imgSrc: "../../../assets/resourses/imgs/heroes/giant/skills/giant_c_skill.png",
          dmgM: 3,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.getAttackBreak()],
          inRangeDebuffs: [],
          description: "Наносит противнику урон в размере 300% от показателя атаки и накладывает на него штраф "
            + this.effects.attackBreak + " на 2 хода."
        },
        {
          name: "Крошитель",
          imgSrc: "../../../assets/resourses/imgs/heroes/giant/skills/giant_active_skill.png",
          dmgM: 5,
          cooldown: 6,
          remainingCooldown: 0,
          buffs: [this.getAttackBuff()],
          debuffs: [this.getDefBreak()],
          inRangeDebuffs: [],
          description: "Наносит врагу урон в размере 500% от показателя атаки, накладывает на него штраф "
            + this.effects.defBreak + " на 2 хода. Перед атакой накладывает на себя " + this.effects.attackBuff + " на 2 хода."
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
