import { Injectable } from '@angular/core';
import { EffectsService } from '../effects/effects.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Unit } from '../../models/unit.model';
import { ContentService, ContentTypes } from '../abstract/content/content-service.service';
import { EffectsValues } from '../../constants';

interface UnitConfig {
  level: number;
  rank: number;
  eq1Level: number;
  eq2Level: number;
  eq3Level: number;
  eq4Level: number;
}

export enum heroType {
  ATTACK,
  DEFENCE,
}

export enum rarity {
  COMMON,
  RARE,
  EPIC,
  LEGENDARY,
}

@Injectable({
  providedIn: 'root',
})
export class HeroesService extends ContentService {
  constructor(
    private eS: EffectsService,
    private sanitizer: DomSanitizer,
  ) {
    super();
  }

  getEffectsToHighlight() {
    return this.eS.effectsToHighlight;
  }

  getEffectsDescription(effect: EffectsValues) {
    return this.eS.effectsDescriptions[effect];
  }

  highlightEffects(text: string) {
    const effects = this.eS.effectsToHighlight;

    for (const effect of effects) {
      text = text.replaceAll(effect, `<span${effect}</span`);
    }

    return this.sanitizer.bypassSecurityTrustHtml(
      text.replaceAll('<span', "<span class='highlight-effect'>").replaceAll('</span', '</span>'),
    );
  }

  getEffectsFromString(text: string) {
    const result = [];
    const effects = this.getEffectsToHighlight();

    for (const effect of effects) {
      if (text.includes(effect)) {
        result.push(`${effect} - ${this.getEffectsDescription(effect)}`);
      }
    }

    return result;
  }

  getRank(level: number) {
    return level <= 10
      ? 1
      : level <= 20
        ? 2
        : level <= 30
          ? 3
          : level <= 40
            ? 4
            : level <= 50
              ? 5
              : 6;
  }

  get effects() {
    return this.eS.effects;
  }

  getLadyOfDragonStone(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.LEGENDARY,
      attackRange: 2,
      rankBoost: 1.3,
      ignoredDebuffs: [this.effects.burning],
      reducedDmgFromDebuffs: [this.effects.bleeding],
      dmgReducedBy: 0.15,
      canCross: 2,
      maxCanCross: 2,
      health: 10237,
      healthIncrement: 195,
      attack: 1829,
      attackIncrement: 23,
      defence: 1485,
      defenceIncrement: 15,
      maxHealth: 10237,
      rage: 45,
      willpower: 25,
      imgSrc: '../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/lds/UI_HeroFull_Daenerys_2.png',
      name: 'Дейнерис Таргариен ( Леди Драконьего Камня )',
      description:
        'По мере того как ее влияние растет, способность Дейенерис направлять огонь своего сердца через свой народ заставляет её совершать великие военные подвиги.',
      skills: [
        {
          name: 'Сожжение',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/lds/skills/UI_HeroicAbility_BloodOfTheDragon.jpeg',
          dmgM: 1.8,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 2,
          attackInRangeM: 1.35,
          debuffs: [...this.eS.getEffect(this.effects.burning, 2, 3)],
          inRangeDebuffs: [this.eS.getEffect(this.effects.defBreak, 5)],
          description:
            'Наносит противнику урон в размере 180% от показателя атаки и накладывает на него 3 штрафa ' +
            this.effects.burning +
            ' на 2 ходa. Также атакует врагов в радиусе 2 клетoк на 135% от показателя атаки,' +
            ' накладывает на них штраф ' +
            this.effects.defBreak +
            ' на 5 ходов.',
        },
        {
          name: 'Дракарис',
          imgSrc: '../../../assets/resourses/imgs/heroes/lds/skills/UI_ActiveAbility_Dracarys.jpeg',
          dmgM: 2.9,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 3,
          addBuffsBeforeAttack: true,
          attackInRangeM: 1.9,
          buffs: [
            this.eS.getEffect(this.effects.attackBuff, 3),
            this.eS.getEffect(this.effects.defBuff, 3),
          ],
          debuffs: [
            ...this.eS.getEffect(this.effects.burning, 2, 5),
            this.eS.getEffect(this.effects.defBreak, 2),
          ],
          inRangeDebuffs: [...this.eS.getEffect(this.effects.bleeding, 2, 2)],
          description:
            'Наносит целевому врагу урон в размере 290% от показателя атаки, накладывает на него 5 штрафов ' +
            this.effects.burning +
            ' и ' +
            this.effects.defBreak +
            ' на 2 хода. Наносит 190% от атаки врагам в радиусе 3 клеток и накладывает на них 2 штрафa ' +
            this.effects.bleeding +
            ' на 2 хода. Перед атакой накладывает на себя ' +
            this.effects.attackBuff +
            ' и ' +
            this.effects.defBuff +
            ' на 3 хода.',
        },
        {
          name: 'Таргариен',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/lds/skills/UI_PassiveAbility_FerventDevotion.jpeg',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [this.eS.getEffect(this.effects.healthRestore, 1)],
          passive: true,
          restoreSkill: true,
          description:
            'Получает на 15% меньше урона от атак противников. Получает на 25% меньше урона от штрафа' +
            this.effects.bleeding +
            '. На этого героя невозможно наложить штраф ' +
            this.effects.burning +
            '. В начале игры получает бонус ' +
            this.effects.healthRestore +
            ' на 2 раунда. Имеет шанс воскреснуть после смертельного удара. ' +
            'Перед началом каждого хода получает бонус ' +
            this.effects.healthRestore +
            ' на 1 ход и мгновенно активирует его.',
        },
      ],
      effects: [this.eS.getEffect(this.effects.healthRestore)],
    };
  }

  getTargaryenKnight(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.DEFENCE,
      rarity: rarity.EPIC,
      attackRange: 1,
      rankBoost: 1.2,
      ignoredDebuffs: [this.effects.burning],
      reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
      dmgReducedBy: 0.25,
      canCross: 2,
      maxCanCross: 2,
      health: 18837,
      healthIncrement: 284,
      attack: 829,
      attackIncrement: 11,
      defence: 2985,
      defenceIncrement: 29,
      maxHealth: 15837,
      rage: 25,
      willpower: 50,
      imgSrc: '../../../assets/resourses/imgs/heroes/targaryen_knight/UI_Avatar_Unit_21.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/targaryen_knight/UI_UnitFull_21.png',
      name: 'Рыцарь Таргариенов',
      description:
        'Всесторонний воин Таргариенов из Королевских земель, этот рыцарь превосходен как в нападении, так и в защите.',
      skills: [
        {
          name: 'Ярость дракона',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_ActiveAbility_Intimidate.webp',
          dmgM: 1.1,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 1.1,
          debuffs: [this.eS.getEffect(this.effects.attackBreak)],
          inRangeDebuffs: [this.eS.getEffect(this.effects.attackBreak)],
          description:
            'Наносит противнику и врагам в радиусе 1 клетки урон в размере 110% от показателя атаки и накладывает на них штраф ' +
            this.effects.attackBreak +
            ' на 2 хода.',
        },
        {
          name: 'За Короля',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_HeroicAbility_ShieldMastery.webp',
          dmgM: 1.3,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 2,
          attackInRangeM: 1.3,
          buffs: [
            this.eS.getEffect(this.effects.defBuff),
            this.eS.getEffect(this.effects.healthRestore, 1),
          ],
          addBuffsBeforeAttack: false,
          debuffs: [],
          inRangeDebuffs: [this.eS.getEffect(this.effects.defBreak)],
          description:
            'Наносит целевому врагу урон в размере 130% от показателя атаки. Наносит 130% от атаки врагам в радиусе 2 клеток и накладывает на них штраф ' +
            this.effects.defBreak +
            ' на 2 хода. После атаки накладывает на себя ' +
            this.effects.defBuff +
            ' на 2 хода и ' +
            this.effects.healthRestore +
            ' на 1 ход.',
        },
        {
          name: 'Щит короны',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_PassiveAbility_ScaledArmor.webp',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          passive: true,
          restoreSkill: true,
          description:
            'Получает на 25% меньше урона от атак противников. Получает на 25% меньше урона от штрафов ' +
            this.effects.bleeding +
            ' и ' +
            this.effects.poison +
            '. На этого героя невозможно наложить штраф ' +
            this.effects.burning +
            '.' +
            ' В начале игры получает бонус ' +
            this.effects.healthRestore +
            ' на 2 раунда.',
        },
      ],
      effects: [this.eS.getEffect(this.effects.healthRestore)],
    };
  }

  getWhiteWolf(): Unit {
    return {
      ...this.getBasicUserConfig(),
      attackRange: 1,
      rarity: rarity.RARE,
      heroType: heroType.ATTACK,
      rankBoost: 1.1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 5837,
      healthIncrement: 98,
      attack: 1029,
      attackIncrement: 13,
      defence: 785,
      defenceIncrement: 6,
      maxHealth: 5837,
      rage: 15,
      willpower: 10,
      imgSrc: '../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaDireWolf.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/wolf/UI_Icon_Avatar_FullBody_AlphaDireWolf.png',
      name: 'Белый Волк',
      description:
        'Альфа стаи за стеной. Вселяет ужас в сердца людей и наносит ужасные раны в гневе.',
      skills: [
        {
          name: 'Укус зверя',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.eS.getEffect(this.effects.bleeding, 1)],
          description:
            'Наносит противнику урон в размере 100% от показателя атаки, накладывает на врага штраф ' +
            this.effects.bleeding +
            ' на 1 ход.',
        },
        {
          name: 'Рваная рана',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_def_attack.png',
          dmgM: 1.2,
          cooldown: 3,
          remainingCooldown: 0,
          debuffs: [this.eS.getEffect(this.effects.defBreak)],
          description:
            'Наносит врагу урон в размере 120% от показателя атаки, накладывает на врага штраф ' +
            this.effects.defBreak +
            ' на 2 хода.',
        },
      ],
      effects: [],
    };
  }

  getPriest(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.DEFENCE,
      healer: true,
      rarity: rarity.EPIC,
      onlyHealer: true,
      attackRange: 1,
      rankBoost: 1.15,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0.15,
      canCross: 2,
      maxCanCross: 2,
      health: 9737,
      healthIncrement: 37,
      attack: 699,
      attackIncrement: 4,
      defence: 1499,
      defenceIncrement: 9,
      maxHealth: 9737,
      rage: 0,
      willpower: 70,
      imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/UI_Avatar_Unit_Lokrand.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/healer-w/UI_HeroFull_Lokrand_1.png',
      name: 'Жрец',
      description: 'Жрец за стеной.',
      skills: [
        {
          name: 'Перевязка ран',
          imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/skills/health_restore_buff.png',
          dmgM: 0.15,
          healM: 0.1,
          cooldown: 0,
          remainingCooldown: 0,
          healAll: true,
          heal: true,
          debuffs: [],
          description:
            'Наносит противнику урон в размере 15% от показателя защиты. Перед атакой восстанавливает всем союзникам здоровье в размере 10% от своего максимального здоровья.',
        },
        {
          name: 'Великое исцеление',
          imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/skills/healer_2skill.png',
          dmgM: 1,
          healM: 0.25,
          cooldown: 5,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 3,
          attackInRangeM: 0.9,
          healAll: true,
          heal: true,
          debuffs: [],
          description:
            'Наносит противнику урон в размере 100% от показателя защиты. Перед атакой восстанавливает всем союзникам здоровье в размере 25% от своего максимального здоровья.' +
            ' Наносит 90% от атаки врагам в радиусе 3 клеток.',
        },
        {
          name: 'Локранд',
          imgSrc: '../../../assets/resourses/imgs/icons/aura.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          passive: true,
          restoreSkill: true,
          description:
            'Получает на 15% меньше урона от атак противников. В начале игры получает бонус ' +
            this.effects.healthRestore +
            ' на 2 раунда. Имеет шанс воскреснуть после смертельного удара.',
        },
      ],
      effects: [this.eS.getEffect(this.effects.healthRestore)],
    };
  }

  getBrownWolf(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      attackRange: 1,
      rarity: rarity.COMMON,
      rankBoost: 1.05,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 4837,
      healthIncrement: 47,
      attack: 899,
      attackIncrement: 9,
      defence: 685,
      defenceIncrement: 3,
      maxHealth: 4837,
      rage: 0,
      willpower: 0,
      imgSrc: '../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaWolf.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/wolf/UI_Icon_Avatar_FullBody_AlphaWolf.png',
      name: 'Бурый Волк',
      description: 'Волк стаи за стеной.',
      skills: [
        {
          name: 'Укус',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          description: 'Наносит противнику урон в размере 100% от показателя атаки.',
        },
      ],
      effects: [],
    };
  }

  getIceRiverHunter(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      attackRange: 1,
      rarity: rarity.COMMON,
      rankBoost: 1.1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 8370,
      healthIncrement: 100,
      attack: 1199,
      attackIncrement: 14,
      defence: 985,
      defenceIncrement: 12,
      maxHealth: 8370,
      rage: 15,
      willpower: 20,
      imgSrc:
        '../../../assets/resourses/imgs/heroes/iceriver_hunter/UI_Avatar_Unit_IceRiverHunters.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/iceriver_hunter/UI_Icon_Avatar_FullBody_Wildling_02_IceRiverHunters.png',
      name: 'Охотник ледяной реки',
      description: 'Молодой охотник из земель за стеной. Ледяная река - его место охоты.',
      skills: [
        {
          name: 'Ледяная стрела',
          imgSrc: '../../../assets/resourses/imgs/heroes/iceriver_hunter/skills/iceriver_h_c_s.png',
          dmgM: 2.1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.eS.getEffect(this.effects.freezing)],
          description:
            'Наносит противнику урон в размере 210% от показателя атаки, накладывает на врага штраф ' +
            this.effects.freezing +
            ' на 2 хода.',
        },
      ],
      effects: [],
    };
  }

  getRelinaShow(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.LEGENDARY,
      attackRange: 2,
      rankBoost: 1.1,
      ignoredDebuffs: [this.effects.poison, this.effects.freezing, this.effects.root],
      reducedDmgFromDebuffs: [this.effects.bleeding],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 19169,
      healthIncrement: 189,
      attack: 1999,
      attackIncrement: 23,
      defence: 1795,
      defenceIncrement: 19,
      maxHealth: 19169,
      rage: 35,
      willpower: 30,
      imgSrc: 'assets/resourses/imgs/heroes/relina-snow/UI_Avatar_Unit_Thosa_RelinaSnow.png',
      fullImgSrc: 'assets/resourses/imgs/heroes/relina-snow/UI_HeroFull_Relina_1.png',
      name: 'Релина Сноу',
      description: 'Релина Сноу это воительница Зачарованного Леса. Умелый и хитрый боец.',
      skills: [
        {
          name: 'Капкан',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_a1.png',
          dmgM: 1.9,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackInRangeM: 0,
          attackRange: 20,
          debuffs: [this.eS.getEffect(this.effects.poison), this.eS.getEffect(this.effects.root)],
          inRangeDebuffs: [this.eS.getEffect(this.effects.attackBreak)],
          description:
            'Наносит противнику урон в размере 190% от показателя атаки, накладывает штраф ' +
            this.effects.poison +
            ' на 2 ходa. ' +
            'Также накладывает штраф ' +
            this.effects.root +
            ' на 2 хода. Все враги на поле получают штраф ' +
            this.effects.attackBreak +
            ' на 2 ходa.',
        },
        {
          name: 'Засада',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_a2.png',
          dmgM: 1.5,
          cooldown: 2,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 3,
          attackInRangeM: 1.15,
          debuffs: [
            this.eS.getEffect(this.effects.bleeding),
            this.eS.getEffect(this.effects.defBreak),
          ],
          buffs: [],
          inRangeDebuffs: [],
          description:
            'Наносит противнику урон в размере 150% от показателя атаки, накладывает на врага штрафы: ' +
            this.effects.bleeding +
            ' и ' +
            this.effects.defBreak +
            ' на 2 ходa. Также атакует противников в радиусе 3 клетoк на 115% от атаки.',
        },
        {
          name: 'Воительница',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_p.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          passive: true,
          description:
            'Этот герой получает на 25% меньше урона от штрафа ' +
            this.effects.bleeding +
            '. Может атаковать с растояния в 2 клетки.' +
            ' На этого героя невозможно наложить штрафы: ' +
            this.effects.poison +
            ', ' +
            this.effects.freezing +
            ', ' +
            this.effects.root +
            '.',
        },
      ],
      effects: [],
    };
  }

  getFreeTrapper(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.RARE,
      attackRange: 2,
      rankBoost: 1.1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [this.effects.poison],
      dmgReducedBy: 0,
      canCross: 2,
      maxCanCross: 2,
      health: 8169,
      healthIncrement: 89,
      attack: 1299,
      attackIncrement: 12,
      defence: 995,
      defenceIncrement: 10,
      maxHealth: 8169,
      rage: 20,
      willpower: 20,
      imgSrc:
        '../../../assets/resourses/imgs/heroes/free-trapper/UI_Avatar_Unit_FreeFolksTrappers.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/free-trapper/UI_Icon_Avatar_FullBody_Wildling_08_FreeFolksTrappers.png',
      name: 'Лучник Вольного Народа',
      description:
        'Лучник вольного народа изучал мастерство убийства с рождения. Он мастерски владеет природными ядами и умеет ставить капканы на животных и людей.',
      skills: [
        {
          name: 'Токсичный выстрел',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_c_skill.png',
          dmgM: 1.5,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.eS.getEffect(this.effects.poison, 1)],
          description:
            'Наносит противнику урон в размере 150% от показателя атаки, накладывает штраф ' +
            this.effects.poison +
            ' на 1 ход.',
        },
        {
          name: 'Ловушка',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_a_skill.png',
          dmgM: 2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 0.5,
          debuffs: [
            this.eS.getEffect(this.effects.bleeding),
            this.eS.getEffect(this.effects.defBreak),
          ],
          buffs: [],
          inRangeDebuffs: [],
          description:
            'Наносит противнику урон в размере 200% от показателя атаки, накладывает на врага штрафы: ' +
            this.effects.bleeding +
            ' и ' +
            this.effects.defBreak +
            ' на 2 хода. Также атакует противников в радиусе 1 клетки на 50% от атаки.',
        },
        {
          name: 'Вольный человек',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_passive.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          passive: true,
          description:
            'Этот герой получает на 25% меньше урона от штрафа ' +
            this.effects.poison +
            '. Может атаковать с растояния в 2 клетки.',
        },
      ],
      effects: [],
    };
  }

  getGiant(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.LEGENDARY,
      attackRange: 1,
      rankBoost: 1.05,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0.5,
      canCross: 1,
      maxCanCross: 1,
      health: 33837,
      healthIncrement: 590,
      attack: 3529,
      attackIncrement: 19,
      defence: 6385,
      defenceIncrement: 29,
      maxHealth: 33837,
      rage: 60,
      willpower: 15,
      imgSrc: '../../../assets/resourses/imgs/heroes/giant/UI_Avatar_Unit_Giant.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/giant/UI_Icon_Avatar_FullBody_Giant.png',
      name: 'Гигант',
      description:
        'Невероятно сильный враг. Мифическое существо из сказаний. Его шкуру почти невозможно пробить оружием, но он уязвим к ослаблениям.',
      skills: [
        {
          name: 'Могучий удар',
          imgSrc: '../../../assets/resourses/imgs/heroes/giant/skills/giant_c_skill.png',
          dmgM: 3,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.eS.getEffect(this.effects.attackBreak)],
          inRangeDebuffs: [],
          description:
            'Наносит противнику урон в размере 300% от показателя атаки и накладывает на него штраф ' +
            this.effects.attackBreak +
            ' на 2 хода.',
        },
        {
          name: 'Крошитель',
          imgSrc: '../../../assets/resourses/imgs/heroes/giant/skills/giant_active_skill.png',
          dmgM: 5,
          cooldown: 6,
          remainingCooldown: 0,
          buffs: [this.eS.getEffect(this.effects.attackBuff)],
          addBuffsBeforeAttack: false,
          debuffs: [this.eS.getEffect(this.effects.defBreak)],
          inRangeDebuffs: [],
          description:
            'Наносит врагу урон в размере 500% от показателя атаки, накладывает на него штраф ' +
            this.effects.defBreak +
            ' на 2 хода. После атаки накладывает на себя ' +
            this.effects.attackBuff +
            ' на 2 хода.',
        },
        {
          name: 'Гигант',
          imgSrc: '../../../assets/resourses/imgs/icons/aura.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          passive: true,
          restoreSkill: true,
          description:
            'Получает на 50% меньше урона от атак противников, но крайне уязвим к ослаблениям и штрафам.',
        },
      ],
      effects: [],
    };
  }

  getNightKing(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.LEGENDARY,
      attackRange: 2,
      rankBoost: 1.3,
      ignoredDebuffs: [this.effects.freezing],
      reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
      dmgReducedBy: 0.5,
      canCross: 4,
      maxCanCross: 4,
      health: 19937,
      healthIncrement: 312,
      attack: 2329,
      attackIncrement: 25,
      defence: 2085,
      defenceIncrement: 19,
      maxHealth: 19937,
      rage: 125,
      willpower: 150,
      imgSrc: '../../../assets/resourses/imgs/heroes/night_king/UI_Avatar_Unit_WhiteWalker.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/night_king/UI_Icon_Avatar_FullBody_WhiteWalker.png',
      name: 'Король Ночи',
      description:
        'Ужасный враг. Сильнейший из белых ходоков и король Края Вечной Зимы. Создан для защиты живых, сейчас пытается погрузить мир во тьму и вечную ночь.',
      skills: [
        {
          name: 'Ветер Севера',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_c_s.png',
          dmgM: 2.4,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 1.5,
          debuffs: [this.eS.getEffect(this.effects.freezing)],
          inRangeDebuffs: [this.eS.getEffect(this.effects.freezing)],
          description:
            'Наносит противнику урон в размере 240% от показателя атаки и накладывает на него штраф ' +
            this.effects.freezing +
            ' на 2 хода. Также атакует всех врагов на поле на 150% от показателя атаки,' +
            ' накладывает на них штраф ' +
            this.effects.freezing +
            ' на 2 ходa.',
        },
        {
          name: 'Сковывающий холод',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_a_s.png',
          dmgM: 4.2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 3.3,
          buffs: [this.eS.getEffect(this.effects.attackBuff)],
          addBuffsBeforeAttack: true,
          debuffs: [
            this.eS.getEffect(this.effects.defDestroy),
            this.eS.getEffect(this.effects.defBreak),
          ],
          inRangeDebuffs: [this.eS.getEffect(this.effects.defDestroy)],
          description:
            'Наносит целевому врагу урон в размере 420% от показателя атаки, накладывает на него штраф ' +
            this.effects.defDestroy +
            ' и ' +
            this.effects.defBreak +
            ' на 2 хода. Наносит 330% от атаки всем врагам на поле боя и накладывает на них штраф ' +
            this.effects.defDestroy +
            ' на 2 хода. Перед атакой накладывает на себя ' +
            this.effects.attackBuff +
            ' и ' +
            this.effects.defBuff +
            ' на 2 хода.',
        },
        {
          name: 'Король Ночи',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_p_s.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [this.eS.getEffect(this.effects.attackBuff, 1)],
          passive: true,
          description:
            'Получает на 50% меньше урона от атак противников. Получает на 25% меньше урона от штрафов ' +
            this.effects.bleeding +
            ' и ' +
            this.effects.poison +
            '. На этого героя невозможно наложить штраф ' +
            this.effects.freezing +
            '. В начал хода получает бонус ' +
            this.effects.attackBuff +
            ' на 1 ход. Может атаковать с растояния в 2 клетки.',
        },
      ],
      effects: [],
    };
  }

  getWhiteWalkerGeneral(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.LEGENDARY,
      attackRange: 1,
      rankBoost: 1.2,
      ignoredDebuffs: [this.effects.freezing],
      reducedDmgFromDebuffs: [this.effects.bleeding, this.effects.poison],
      dmgReducedBy: 0.3,
      canCross: 3,
      maxCanCross: 3,
      health: 15937,
      healthIncrement: 219,
      attack: 2129,
      attackIncrement: 16,
      defence: 1985,
      defenceIncrement: 15,
      maxHealth: 15937,
      rage: 105,
      willpower: 120,
      imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/UI_Avatar_Unit_WhiteWalker1.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/white_walker/UI_Icon_Avatar_FullBody_WhiteWalker2.png',
      name: 'Генерал Ходок',
      description:
        'Ужасный враг. Сильный белый ходок и командир армии Короля Ночи. Создан своим господином для уничтожения живых, сейчас пытается погрузить мир во тьму и вечную ночь.',
      skills: [
        {
          name: 'Морозный Ветер',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_c_s.jpg',
          dmgM: 2.7,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 1.4,
          debuffs: [this.eS.getEffect(this.effects.defBreak, 1)],
          inRangeDebuffs: [],
          description:
            'Наносит противнику урон в размере 270% от показателя атаки и накладывает на него штраф ' +
            this.effects.defBreak +
            ' на 1 ход. Также атакует всех врагов на поле на 140% от показателя атаки.',
        },
        {
          name: 'Белый Ходок',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_p_s.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [this.eS.getEffect(this.effects.defBuff, 1)],
          passive: true,
          description:
            'Получает на 30% меньше урона от атак противников. Получает на 25% меньше урона от штрафов ' +
            this.effects.bleeding +
            ' и ' +
            this.effects.poison +
            '. На этого героя невозможно наложить штраф ' +
            this.effects.freezing +
            '. Перед началом хода получает ' +
            this.effects.defBuff +
            ' на 1 ход. Получает этот бонус в начале игры на 2 хода.',
        },
      ],
      effects: [this.eS.getEffect(this.effects.defBuff)],
    };
  }

  getWhiteWalkerCapitan(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      attackRange: 1,
      rarity: rarity.LEGENDARY,
      rankBoost: 1.1,
      ignoredDebuffs: [this.effects.freezing],
      reducedDmgFromDebuffs: [],
      dmgReducedBy: 0.15,
      canCross: 2,
      maxCanCross: 2,
      health: 11937,
      healthIncrement: 145,
      attack: 1829,
      attackIncrement: 15,
      defence: 1655,
      defenceIncrement: 12,
      maxHealth: 11937,
      rage: 75,
      willpower: 95,
      imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/UI_Avatar_Unit_WhiteWalker2.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/white_walker/UI_Icon_Avatar_FullBody_WhiteWalker3.png',
      name: 'Капитан Ходок',
      description:
        'Ужасный враг. Слабейший белый ходок и капитан армии Короля Ночи. Создан своим господином для уничтожения живых, сейчас пытается погрузить мир во тьму и вечную ночь.',
      skills: [
        {
          name: 'Морозный удар',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/white_walker_c_s.jpg',
          dmgM: 1.9,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          inRangeDebuffs: [],
          description: 'Наносит противнику урон в размере 190% от показателя атаки.',
        },
        {
          name: 'Белый Ходок',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_p_s.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [
            this.eS.getEffect(this.effects.defBuff),
            this.eS.getEffect(this.effects.attackBuff),
          ],
          passive: true,
          description:
            'Получает на 15% меньше урона от атак противников. На этого героя невозможно наложить штраф ' +
            this.effects.freezing +
            '. ' +
            'Каждый ход получает ' +
            this.effects.defBuff +
            ' и ' +
            this.effects.attackBuff +
            ' на 2 хода.',
        },
      ],
      effects: [],
    };
  }

  getJonKing(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      attackRange: 1,
      rankBoost: 1.3,
      rarity: rarity.LEGENDARY,
      ignoredDebuffs: [this.effects.freezing, this.effects.attackBreak],
      reducedDmgFromDebuffs: [this.effects.bleeding],
      dmgReducedBy: 0.1,
      canCross: 2,
      maxCanCross: 2,
      health: 12837,
      healthIncrement: 219,
      attack: 1729,
      attackIncrement: 18,
      defence: 1285,
      defenceIncrement: 14,
      maxHealth: 12837,
      rage: 25,
      willpower: 25,
      imgSrc: '../../../assets/resourses/imgs/heroes/jon_king/UI_Avatar_Unit_JonKingNorth.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/jon_king/UI_HeroFull_JonSnow_3.png',
      name: 'Джон Сноу ( Король Севера )',
      description:
        'Сильный, настоящий лидер, бесчисленные победы Джона Сноу на поле боя заставили его сверстников признать его королем Севера.',
      skills: [
        {
          name: 'Решающий удар',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_HeroicAbility_PathfindersBlade.webp',
          dmgM: 2,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1.1,
          attackInRangeM: 1,
          debuffs: [],
          inRangeDebuffs: [],
          description:
            'Наносит противнику урон в размере 200% от показателя атаки и 110% от атаки врагам в радиусе 1 клетки.',
        },
        {
          name: 'Клинок Первопроходца',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_ActiveAbility_DecisiveStrike.webp',
          dmgM: 3.1,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 2.5,
          buffs: [],
          debuffs: [
            this.eS.getEffect(this.effects.defBreak, 3),
            this.eS.getEffect(this.effects.bleeding, 3),
            this.eS.getEffect(this.effects.attackBreak, 3),
          ],
          inRangeDebuffs: [this.eS.getEffect(this.effects.bleeding)],
          description:
            'Наносит целевому врагу урон в размере 310% от показателя атаки, накладывает на него 3 штрафа: ' +
            this.effects.defBreak +
            ', ' +
            this.effects.bleeding +
            ' и ' +
            this.effects.attackBreak +
            ' на 3 хода. Наносит 250% от атаки врагам в радиусе 1 клетки и накладывает на них штраф ' +
            this.effects.bleeding +
            ' на 2 хода.',
        },
        {
          name: 'Правосудие',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_PassiveAbility_PassTheSentenceSwingTheSword.webp',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [this.eS.getEffect(this.effects.attackBuff, 1)],
          passive: true,
          description:
            'Получает на 10% меньше урона от атак противников. Получает на 25% меньше урона от штрафа' +
            this.effects.bleeding +
            '. На этого героя невозможно наложить штрафы ' +
            this.effects.freezing +
            ' и ' +
            this.effects.attackBreak +
            '. В начале игры получает ' +
            this.effects.defBuff +
            ' на 2 ходa.' +
            '. Перед началом хода накладывает на себя ' +
            this.effects.attackBuff +
            ' на 1 ход.',
        },
      ],
      effects: [this.eS.getEffect(this.effects.defBuff)],
    };
  }

  getDailyBossVersion1(): Unit {
    return {
      ...this.getBasicUserConfig(),
      heroType: heroType.ATTACK,
      rarity: rarity.LEGENDARY,
      attackRange: 1,
      rankBoost: 1.5,
      ignoredDebuffs: [this.effects.burning],
      reducedDmgFromDebuffs: [this.effects.bleeding],
      dmgReducedBy: 0.25,
      canCross: 3,
      maxCanCross: 3,
      health: 39237,
      healthIncrement: 3195,
      attack: 1829,
      attackIncrement: 23,
      defence: 1485,
      defenceIncrement: 15,
      maxHealth: 39237,
      rage: 145,
      willpower: 50,
      imgSrc: '../../../assets/resourses/imgs/boss/v1/UI_Avatar_Unit_GromyrtheFlame.png',
      fullImgSrc: '../../../assets/resourses/imgs/boss/v1/UI_Boss_CutIn_Pic_1.png',
      name: 'Громирт Пламя',
      description: '',
      skills: [
        {
          name: 'Горячий Приём',
          imgSrc: '../../../assets/resourses/imgs/boss/v1/skills/gr_s1.png',
          dmgM: 2.8,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 2.35,
          debuffs: [...this.eS.getEffect(this.effects.burning, 2, 2)],
          inRangeDebuffs: [this.eS.getEffect(this.effects.defBreak)],
          description:
            'Наносит противнику урон в размере 280% от показателя атаки и накладывает на него 2 штрафa ' +
            this.effects.burning +
            ' на 2 ходa. Также атакует врагов в радиусе 1 клеткм на 235% от показателя атаки,' +
            ' накладывает на них штраф ' +
            this.effects.defBreak +
            ' на 2 хода.',
        },
        {
          name: 'Исцеление огнём',
          imgSrc: '../../../assets/resourses/imgs/boss/v1/skills/boss_s2.png',
          dmgM: 1.4,
          healM: 0.01,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 2,
          attackInRangeM: 1.1,
          healAll: true,
          heal: true,
          debuffs: [...this.eS.getEffect(this.effects.burning, 3, 4)],
          inRangeDebuffs: [
            this.eS.getEffect(this.effects.defBreak, 3),
            this.eS.getEffect(this.effects.bleeding, 3),
            this.eS.getEffect(this.effects.defDestroy, 3),
          ],
          description:
            'Наносит противнику урон в размере 140% от показателя атаки и накладывает на него 4 штрафa ' +
            this.effects.burning +
            ' на 3 ходa. Перед атакой восстанавливает всем союзникам здоровье в размере 1% от своего максимального здоровья.' +
            ' Наносит 110% от атаки врагам в радиусе 2 клеток и накладывает на них штрафы: ' +
            this.effects.defDestroy +
            ', ' +
            this.effects.bleeding +
            ', ' +
            this.effects.defBreak +
            ' на 3 хода.',
        },
        {
          name: 'Душа Пламени',
          imgSrc: '../../../assets/resourses/imgs/debuffs/burning.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [],
          buffs: [],
          description:
            'Получает на 25% меньше урона от атак противников. Получает на 25% меньше урона от штрафа' +
            this.effects.bleeding +
            '. На этого героя невозможно наложить штраф ' +
            this.effects.burning +
            '. В начале игры получает бонус ' +
            this.effects.healthRestore +
            ' до конца боя. Имеет шанс воскреснуть после смертельного удара.',
        },
      ],
      effects: [this.eS.getEffect(this.effects.healthRestore, 1000)],
    };
  }

  getEquipmentForUnit(unit: Unit): Unit {
    //Level
    const leveledUnit = {
      ...unit,
      attack: +(unit.attack + unit.attackIncrement * unit.level).toFixed(0),
      defence: +(unit.defence + unit.defenceIncrement * unit.level).toFixed(0),
      health: +(unit.health + unit.healthIncrement * unit.level).toFixed(0),
      rage: +(unit.rage + (unit.level > 1 ? 2 * unit.level : 0)).toFixed(0),
      willpower: +(unit.willpower + (unit.level > 1 ? 2 * unit.level : 0)).toFixed(0),
      dmgReducedBy: +(
        +(unit.dmgReducedBy * 100 + (unit.level > 1 ? 0.5 : 0) * unit.level).toFixed(0) / 100
      ).toFixed(2),
    };

    //Rank
    let usedRank = 0;

    while (usedRank !== unit.rank) {
      usedRank++;
      leveledUnit.attack = +(leveledUnit.attack * unit.rankBoost).toFixed(0);
      leveledUnit.defence = +(leveledUnit.defence * unit.rankBoost).toFixed(0);
      leveledUnit.health = +(leveledUnit.health * unit.rankBoost).toFixed(0);
    }

    //Eq 1
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq1Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq1Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq1Level).toFixed(0);
    //Eq 2
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq2Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq2Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq2Level).toFixed(0);
    //Eq 3
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq3Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq3Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq3Level).toFixed(0);
    //Eq 4
    leveledUnit.attack += +(leveledUnit.attackIncrement * leveledUnit.eq4Level).toFixed(0);
    leveledUnit.defence += +(leveledUnit.defenceIncrement * leveledUnit.eq4Level).toFixed(0);
    leveledUnit.health += +(leveledUnit.healthIncrement * leveledUnit.eq4Level).toFixed(0);

    leveledUnit.maxHealth = leveledUnit.health;

    return leveledUnit;
  }

  getAllHeroes() {
    const units = [
      this.getIceRiverHunter(),
      this.getJonKing(),
      this.getWhiteWalkerCapitan(),
      this.getWhiteWalkerGeneral(),
      this.getNightKing(),
      this.getGiant(),
      this.getFreeTrapper(),
      this.getBrownWolf(),
      this.getWhiteWolf(),
      this.getTargaryenKnight(),
      this.getLadyOfDragonStone(),
      this.getRelinaShow(),
      this.getPriest(),
      this.getDailyBossVersion1(),
    ];

    return units.map(unit => this.getEquipmentForUnit(unit));
  }

  getUnitByName(name: string, config?: UnitConfig) {
    const allUnits = this.getAllHeroes();
    const userUnit = allUnits.filter(unit => unit.name === name)[0];

    return this.getEquipmentForUnit({ ...userUnit, ...(config || {}) });
  }

  getBasicUserConfig() {
    return {
      x: 3,
      y: 6,
      user: true,
      canMove: true,
      canAttack: true,
      rank: 1,
      level: 1,
      eq1Level: 1,
      eq2Level: 1,
      eq3Level: 1,
      eq4Level: 1,
    };
  }

  getContent(contentType = ContentTypes.USER_UNITS) {
    if (contentType === ContentTypes.USER_UNITS) {
      return this.getAllHeroes();
    }

    return [];
  }
}
