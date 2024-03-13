import {Injectable} from '@angular/core';
import {Effect, Skill, Unit} from "../game-field/game-field.service";
import {EffectsService} from "../effects/effects.service";

@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  constructor(private effectsService: EffectsService) {
  }

  getLadyOfDragonStone(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 1,
      ignoredDebuffs: [this.effectsService.effects.burning],
      reducedDmgFromDebuffs: [this.effectsService.effects.bleeding],
      dmgReducedBy: 0.1,
      canCross: 2,
      maxCanCross: 2,
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
          debuffs: [this.effectsService.getBurning(1)],
          inRangeDebuffs: [this.effectsService.getDefBreak(1)],
          description: "Наносит противнику урон в размере 100% от показателя атаки и накладывает на него штраф "
            + this.effectsService.effects.burning + " на 1 ход. Также атакует врагов в радиусе 1 клетки на 50% от показателя атаки,"
            + " накладывает на них штраф " + this.effectsService.effects.defBreak + " на 1 ход."
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
          buffs: [this.effectsService.getAttackBuff(), this.effectsService.getDefBuff()],
          debuffs: [this.effectsService.getBurning(2), this.effectsService.getBurning(2), this.effectsService.getDefBreak()],
          inRangeDebuffs: [this.effectsService.getBleeding(2)],
          description: "Наносит целевому врагу урон в размере 200% от показателя атаки, накладывает на него 2 штрафа "
            + this.effectsService.effects.burning + " и " + this.effectsService.effects.defBreak + " на 2 хода. Наносит 90% от атаки врагам в радиусе 2 клеток и накладывает на них штраф "
            + this.effectsService.effects.bleeding + " на 2 хода. Перед атакой накладывает на себя " + this.effectsService.effects.attackBuff + " и " + this.effectsService.effects.defBuff + " на 2 хода."
        },
        {
          name: "Таргариен",
          imgSrc: "../../../assets/resourses/imgs/heroes/lds/skills/UI_PassiveAbility_FerventDevotion.jpeg",
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [this.effectsService.getHealthRestore()],
          passive: true,
          restoreSkill: true,
          description: "Получает на 10% меньше урона от атак противников. Получает на 25% меньше урона от штрафа" + this.effectsService.effects.bleeding + ". На этого героя невозможно наложить штраф "
            + this.effectsService.effects.burning + ". В начале игры получает бонус " + this.effectsService.effects.healthRestore + " на 2 раунда. Имеет шанс воскреснуть после смертельного удара. "
            + "Перед началом каждого хода получает бонус " + this.effectsService.effects.healthRestore + " на 1 ход и мгновенно активирует его."
        }
      ],
      effects: [this.effectsService.getHealthRestore(2)]
    }
  }

  getTargaryenKnight(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 1,
      ignoredDebuffs: [this.effectsService.effects.burning],
      reducedDmgFromDebuffs: [this.effectsService.effects.bleeding, this.effectsService.effects.poison],
      dmgReducedBy: 0.25,
      canCross: 2,
      maxCanCross: 2,
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
          debuffs: [this.effectsService.getAttackBreak()],
          inRangeDebuffs: [this.effectsService.getAttackBreak()],
          description: "Наносит противнику и врагам в радиусе 1 клетки урон в размере 90% от показателя атаки и накладывает на них штраф"
            + this.effectsService.effects.attackBreak + "на 2 хода."
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
          buffs: [this.effectsService.getDefBuff()],
          debuffs: [],
          inRangeDebuffs: [this.effectsService.getDefBreak()],
          description: "Наносит целевому врагу урон в размере 150% от показателя атаки. Наносит 90% от атаки врагам в радиусе 2 клеток и накладывает на них штраф "
            + this.effectsService.effects.defBreak + " на 2 хода. Перед атакой накладывает на себя " + this.effectsService.effects.defBuff + " на 2 хода."
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
          description: "Получает на 25% меньше урона от атак противников. Получает на 25% меньше урона от штрафов " + this.effectsService.effects.bleeding + " и " + this.effectsService.effects.poison +
            ". На этого героя невозможно наложить штраф " + this.effectsService.effects.burning + "."
        }
      ],
      effects: [this.effectsService.getHealthRestore(2)]
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
      maxCanCross: 3,
      health: 5837,
      attack: 1029,
      defence: 785,
      maxHealth: 5837,
      rage: 15,
      willpower: 10,
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
          debuffs: [this.effectsService.getBleeding(1)],
          description: "Наносит противнику урон в размере 100% от показателя атаки, накладывает на врага штраф "
            + this.effectsService.effects.bleeding + " на 1 ход."
        },
        {
          name: "Рваная рана",
          imgSrc: "../../../assets/resourses/imgs/heroes/wolf/skills/wolf_def_attack.png",
          dmgM: 1.2,
          cooldown: 3,
          remainingCooldown: 0,
          debuffs: [this.effectsService.getDefBreak()],
          description: "Наносит врагу урон в размере 120% от показателя атаки, накладывает на врага штраф "
            + this.effectsService.effects.defBreak + " на 2 хода."
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
      maxCanCross: 1,
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

  getIceRiverHunter(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 8370,
      attack: 1199,
      defence: 985,
      maxHealth: 8370,
      rage: 15,
      willpower: 20,
      imgSrc: "../../../assets/resourses/imgs/heroes/iceriver_hunter/UI_Avatar_Unit_IceRiverHunters.png",
      fullImgSrc: "../../../assets/resourses/imgs/heroes/iceriver_hunter/UI_Icon_Avatar_FullBody_Wildling_02_IceRiverHunters.png",
      name: "Охотник ледяной реки",
      description: "Молодой охотник из земель за стеной. Ледяная река - его место охоты.",
      skills: [
        {
          name: "Ледяная стрела",
          imgSrc: "../../../assets/resourses/imgs/heroes/iceriver_hunter/skills/iceriver_h_c_s.png",
          dmgM: 2.1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.effectsService.getFreezing()],
          description: "Наносит противнику урон в размере 210% от показателя атаки, накладывает на врага штраф "
            + this.effectsService.effects.freezing + " на 2 хода."
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
      reducedDmgFromDebuffs: [this.effectsService.effects.poison],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
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
          debuffs: [this.effectsService.getPoison(1)],
          description: "Наносит противнику урон в размере 150% от показателя атаки, накладывает штраф " + this.effectsService.effects.poison + " на 1 ход."
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
          debuffs: [this.effectsService.getBleeding(), this.effectsService.getDefBreak()],
          buffs: [],
          inRangeDebuffs: [],
          description: "Наносит противнику урон в размере 200% от показателя атаки, накладывает на врага штрафы: "
            + this.effectsService.effects.bleeding + " и " + this.effectsService.effects.defBreak + " на 2 хода. Также атакует противников в радиусе 1 клетки на 50% от атаки."
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
          description: "Этот герой получает на 25% меньше урона от штрафа " + this.effectsService.effects.poison + "."
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
      maxCanCross: 1,
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
          debuffs: [this.effectsService.getAttackBreak()],
          inRangeDebuffs: [],
          description: "Наносит противнику урон в размере 300% от показателя атаки и накладывает на него штраф "
            + this.effectsService.effects.attackBreak + " на 2 хода."
        },
        {
          name: "Крошитель",
          imgSrc: "../../../assets/resourses/imgs/heroes/giant/skills/giant_active_skill.png",
          dmgM: 5,
          cooldown: 6,
          remainingCooldown: 0,
          buffs: [this.effectsService.getAttackBuff()],
          debuffs: [this.effectsService.getDefBreak()],
          inRangeDebuffs: [],
          description: "Наносит врагу урон в размере 500% от показателя атаки, накладывает на него штраф "
            + this.effectsService.effects.defBreak + " на 2 хода. Перед атакой накладывает на себя " + this.effectsService.effects.attackBuff + " на 2 хода."
        }
      ],
      effects: []
    }
  }

  getNightKing(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 2,
      ignoredDebuffs: [this.effectsService.effects.freezing],
      reducedDmgFromDebuffs: [this.effectsService.effects.bleeding, this.effectsService.effects.poison],
      dmgReducedBy: 0.5,
      canCross: 4,
      maxCanCross: 4,
      health: 19937,
      attack: 2329,
      defence: 2085,
      maxHealth: 19937,
      rage: 35,
      willpower: 50,
      imgSrc: "../../../assets/resourses/imgs/heroes/night_king/UI_Avatar_Unit_WhiteWalker.png",
      fullImgSrc: "../../../assets/resourses/imgs/heroes/night_king/UI_Icon_Avatar_FullBody_WhiteWalker.png",
      name: "Король Ночи",
      description: "Ужасный враг. Сильнейший из белых ходоков и король Края Вечной Зимы. Создан для защиты живых, сейчас пытается погрузить мир во тьму и вечную ночь.",
      skills: [
        {
          name: "Ветер Севера",
          imgSrc: "../../../assets/resourses/imgs/heroes/night_king/skills/night_king_c_s.png",
          dmgM: 2.4,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 1.5,
          debuffs: [this.effectsService.getFreezing()],
          inRangeDebuffs: [this.effectsService.getFreezing()],
          description: "Наносит противнику урон в размере 240% от показателя атаки и накладывает на него штраф "
            + this.effectsService.effects.freezing + " на 2 хода. Также атакует всех врагов на поле на 150% от показателя атаки,"
            + " накладывает на них штраф " + this.effectsService.effects.freezing + " на 2 ходa."
        },
        {
          name: "Сковывающий холод",
          imgSrc: "../../../assets/resourses/imgs/heroes/night_king/skills/night_king_a_s.png",
          dmgM: 2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 2,
          attackInRangeM: 0.9,
          buffs: [this.effectsService.getAttackBuff()],
          debuffs: [this.effectsService.getDefenceDestroy(), this.effectsService.getDefBreak()],
          inRangeDebuffs: [this.effectsService.getDefenceDestroy()],
          description: "Наносит целевому врагу урон в размере 200% от показателя атаки, накладывает на него штраф "
            + this.effectsService.effects.defDestroy + " и " + this.effectsService.effects.defBreak + " на 2 хода. Наносит 90% от атаки врагам в радиусе 2 клеток и накладывает на них штраф "
            + this.effectsService.effects.defDestroy + " на 2 хода. Перед атакой накладывает на себя " + this.effectsService.effects.attackBuff + " и " + this.effectsService.effects.defBuff + " на 2 хода."
        },
        {
          name: "Король Ночи",
          imgSrc: "../../../assets/resourses/imgs/heroes/night_king/skills/night_king_p_s.png",
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          passive: true,
          description: "Получает на 50% меньше урона от атак противников. Получает на 25% меньше урона от штрафов " + this.effectsService.effects.bleeding + " и " + this.effectsService.effects.poison + ". На этого героя невозможно наложить штраф "
            + this.effectsService.effects.freezing + "."
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
