import { inject, Injectable } from '@angular/core';
import {
  GetTileConfig,
  HeroesNamesCodes,
  HeroType,
  PreviewUnit,
  Rarity,
  Unit,
  UnitConfig,
} from '../../../models/units-related/unit.model';
import { ContentService, ContentTypes } from '../../abstract/content/content-service.service';
import { TileUnit } from '../../../models/field.model';
import { HeroesHelperService } from './helpers/heroes-helper.service';

@Injectable({
  providedIn: 'root',
})
export class HeroesFacadeService extends ContentService {
  helper = inject(HeroesHelperService);

  getLadyOfDragonStone(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      attackRange: 2,
      rankBoost: 1.3,
      ignoredDebuffs: [this.helper.effects.burning],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding],
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
      name: HeroesNamesCodes.LadyOfDragonStone,
      description:
        "As her influence grows, Daenerys's ability to channel the fire of her heart through her people drives her to perform great feats of war.",
      skills: [
        {
          name: 'Burning',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/lds/skills/UI_HeroicAbility_BloodOfTheDragon.jpeg',
          dmgM: 1.8,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 2,
          attackInRangeM: 1.35,
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 2, 3)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak, 5)],
          description:
            'Наносит противнику урон в размере 180% от показателя атаки и накладывает на него 3 штрафa ' +
            this.helper.effects.burning +
            ' на 2 ходa. Также атакует врагов в радиусе 2 клетoк на 135% от показателя атаки,' +
            ' накладывает на них штраф ' +
            this.helper.effects.defBreak +
            ' на 5 ходов.',
        },
        {
          name: 'Drakarys',
          imgSrc: '../../../assets/resourses/imgs/heroes/lds/skills/UI_ActiveAbility_Dracarys.jpeg',
          dmgM: 2.9,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 3,
          addBuffsBeforeAttack: true,
          attackInRangeM: 1.9,
          buffs: [
            this.helper.eS.getEffect(this.helper.effects.attackBuff, 3),
            this.helper.eS.getEffect(this.helper.effects.defBuff, 3),
          ],
          debuffs: [
            ...this.helper.eS.getEffect(this.helper.effects.burning, 2, 5),
            this.helper.eS.getEffect(this.helper.effects.defBreak, 2),
          ],
          inRangeDebuffs: [...this.helper.eS.getEffect(this.helper.effects.bleeding, 2, 2)],
          description:
            'Наносит целевому врагу урон в размере 290% от показателя атаки, накладывает на него 5 штрафов ' +
            this.helper.effects.burning +
            ' и ' +
            this.helper.effects.defBreak +
            ' на 2 хода. Наносит 190% от атаки врагам в радиусе 3 клеток и накладывает на них 2 штрафa ' +
            this.helper.effects.bleeding +
            ' на 2 хода. Перед атакой накладывает на себя ' +
            this.helper.effects.attackBuff +
            ' и ' +
            this.helper.effects.defBuff +
            ' на 3 хода.',
        },
        {
          name: 'Targaryen',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/lds/skills/UI_PassiveAbility_FerventDevotion.jpeg',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          buffs: [this.helper.eS.getEffect(this.helper.effects.healthRestore, 1)],
          passive: true,
          restoreSkill: true,
          description:
            'Получает на 15% меньше урона от атак противников. Получает на 25% меньше урона от штрафа' +
            this.helper.effects.bleeding +
            '. На этого героя невозможно наложить штраф ' +
            this.helper.effects.burning +
            '. В начале игры получает бонус ' +
            this.helper.effects.healthRestore +
            ' на 2 раунда. Имеет шанс воскреснуть после смертельного удара. ' +
            'Перед началом каждого хода получает бонус ' +
            this.helper.effects.healthRestore +
            ' на 1 ход и мгновенно активирует его.',
        },
      ],
      effects: [this.helper.eS.getEffect(this.helper.effects.healthRestore)],
    };
  }

  getTargaryenKnight(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.DEFENCE,
      rarity: Rarity.EPIC,
      attackRange: 1,
      rankBoost: 1.2,
      ignoredDebuffs: [this.helper.effects.burning],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding, this.helper.effects.poison],
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
      name: HeroesNamesCodes.TargaryenKnight,
      description:
        'A versatile Targaryen warrior from the Crownlands, this knight excels in both offense and defense.',
      skills: [
        {
          name: 'Dragon Fury',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_ActiveAbility_Intimidate.webp',
          dmgM: 1.1,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 1.1,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
          description:
            'Наносит противнику и врагам в радиусе 1 клетки урон в размере 110% от показателя атаки и накладывает на них штраф ' +
            this.helper.effects.attackBreak +
            ' на 2 хода.',
        },
        {
          name: 'For the King',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_HeroicAbility_ShieldMastery.webp',
          dmgM: 1.3,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 2,
          attackInRangeM: 1.3,
          buffs: [
            this.helper.eS.getEffect(this.helper.effects.defBuff),
            this.helper.eS.getEffect(this.helper.effects.healthRestore, 1),
          ],
          addBuffsBeforeAttack: false,
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
          description:
            'Наносит целевому врагу урон в размере 130% от показателя атаки. Наносит 130% от атаки врагам в радиусе 2 клеток и накладывает на них штраф ' +
            this.helper.effects.defBreak +
            ' на 2 хода. После атаки накладывает на себя ' +
            this.helper.effects.defBuff +
            ' на 2 хода и ' +
            this.helper.effects.healthRestore +
            ' на 1 ход.',
        },
        {
          name: 'Crown Shield',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_PassiveAbility_ScaledArmor.webp',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          passive: true,
          restoreSkill: false,
          description:
            'Получает на 25% меньше урона от атак противников. Получает на 25% меньше урона от штрафов ' +
            this.helper.effects.bleeding +
            ' и ' +
            this.helper.effects.poison +
            '. На этого героя невозможно наложить штраф ' +
            this.helper.effects.burning +
            '.' +
            ' В начале игры получает бонус ' +
            this.helper.effects.healthRestore +
            ' на 2 раунда.',
        },
      ],
      effects: [
        this.helper.eS.getEffect(this.helper.effects.healthRestore),
        this.helper.eS.getEffect(this.helper.effects.freezing),
      ],
    };
  }

  getWhiteWolf(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      attackRange: 1,
      rarity: Rarity.RARE,
      heroType: HeroType.ATTACK,
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
      name: HeroesNamesCodes.WhiteWolf,
      description:
        'The alpha of the pack beyond the wall. Strikes terror into the hearts of men and inflicts terrible wounds in anger.',
      skills: [
        {
          name: 'Beast bite',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.bleeding, 1)],
          description:
            'Deals damage to the enemy equal to 100% of the attack value, imposes a penalty on the enemy ' +
            this.helper.effects.bleeding +
            ' for 1 move.',
        },
        {
          name: 'Torn wound',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_def_attack.png',
          dmgM: 1.2,
          cooldown: 3,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
          description:
            'Deals damage to an enemy equal to 120% of the attack value and applies a debuff to the enemy. ' +
            this.helper.effects.defBreak +
            ' for 2 moves.',
        },
      ],
      effects: [],
    };
  }

  getPriest(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.DEFENCE,
      healer: true,
      rarity: Rarity.EPIC,
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
      name: HeroesNamesCodes.Priest,
      description: 'The priest beyond the wall.',
      skills: [
        {
          name: 'Wound dressing',
          imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/skills/health_restore_buff.png',
          dmgM: 0.15,
          healM: 0.1,
          cooldown: 0,
          remainingCooldown: 0,
          healAll: true,
          heal: true,
          description:
            'Deals damage to an enemy equal to 15% of their defense. Before attacking, restores health to all allies equal to 10% of their maximum health.',
        },
        {
          name: 'Great Healing',
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
          description:
            'Deals damage to an enemy equal to 100% of their defense. Before attacking, restores all allies' +
            ' health equal to 25% of their maximum health. Deals 90% of their attack damage to enemies within a 3-tile radius.',
        },
        {
          name: 'Lokrand',
          imgSrc: '../../../assets/resourses/imgs/icons/aura.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          passive: true,
          restoreSkill: true,
          description:
            'Takes 15% less damage from enemy attacks. Receives a bonus at the start of the game. ' +
            this.helper.effects.healthRestore +
            ' for 2 rounds. Has a chance to resurrect after a fatal blow.',
        },
      ],
      effects: [this.helper.eS.getEffect(this.helper.effects.healthRestore)],
    };
  }

  getBrownWolf(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      attackRange: 1,
      rarity: Rarity.COMMON,
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
      name: HeroesNamesCodes.BrownWolf,
      description: 'The wolf of the pack beyond the wall.',
      skills: [
        {
          name: 'Taste',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          description: 'Deals damage to the enemy equal to 100% of the attack value.',
        },
      ],
      effects: [],
    };
  }

  getIceRiverHunter(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      attackRange: 1,
      rarity: Rarity.COMMON,
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
      name: HeroesNamesCodes.IceRiverHunter,
      description:
        'A young hunter from the lands beyond the wall. The icy river is his hunting ground.',
      skills: [
        {
          name: 'Ice Arrow',
          imgSrc: '../../../assets/resourses/imgs/heroes/iceriver_hunter/skills/iceriver_h_c_s.png',
          dmgM: 2.1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.freezing)],
          description:
            'Deals damage to the enemy equal to 210% of the attack value, imposes a penalty on the enemy ' +
            this.helper.effects.freezing +
            ' for 2 moves.',
        },
      ],
      effects: [],
    };
  }

  getRelinaShow(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      attackRange: 2,
      rankBoost: 1.1,
      ignoredDebuffs: [
        this.helper.effects.poison,
        this.helper.effects.freezing,
        this.helper.effects.root,
      ],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding],
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
      name: HeroesNamesCodes.RelinaShow,
      description:
        'Relina Snow is a warrior of the Enchanted Forest. A skilled and cunning fighter.',
      skills: [
        {
          name: 'Trap',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_a1.png',
          dmgM: 1.9,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackInRangeM: 0,
          attackRange: 20,
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.poison),
            this.helper.eS.getEffect(this.helper.effects.root),
          ],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
          description:
            'Deals damage to the enemy equal to 190% of the attack value, applies a penalty ' +
            this.helper.effects.poison +
            ' for 2 turns. Also applies a penalty ' +
            this.helper.effects.root +
            ' for 2 turns. All enemies on the field receive a penalty. ' +
            this.helper.effects.attackBreak +
            ' for 2 moves.',
        },
        {
          name: 'Ambush',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_a2.png',
          dmgM: 1.5,
          cooldown: 2,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 3,
          attackInRangeM: 1.15,
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.bleeding),
            this.helper.eS.getEffect(this.helper.effects.defBreak),
          ],
          description:
            'Deals damage to the enemy equal to 150% of the attack value, imposes penalties on the enemy: ' +
            this.helper.effects.bleeding +
            ' and ' +
            this.helper.effects.defBreak +
            ' for 2 turns. Also attacks enemies within a 3-cell radius with 115% of their attack.',
        },
        {
          name: 'Warrior',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_p.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          passive: true,
          description:
            'This hero takes 25% less damage from the debuff. ' +
            this.helper.effects.bleeding +
            '. Can attack from a distance of 2 cells. This hero cannot be penalized: ' +
            this.helper.effects.poison +
            ', ' +
            this.helper.effects.freezing +
            ', ' +
            this.helper.effects.root +
            '.',
        },
      ],
      effects: [],
    };
  }

  getFreeTrapper(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.RARE,
      attackRange: 2,
      rankBoost: 1.1,
      ignoredDebuffs: [],
      reducedDmgFromDebuffs: [this.helper.effects.poison],
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
      name: HeroesNamesCodes.FreeTrapper,
      description:
        'A Free Folk archer has studied the art of assassination since birth. He is a master of natural poisons and knows how to set traps for animals and people.',
      skills: [
        {
          name: 'Toxic Shot',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_c_skill.png',
          dmgM: 1.5,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.poison, 1)],
          description:
            'Deals damage to the enemy equal to 150% of the attack value, applies a penalty ' +
            this.helper.effects.poison +
            ' for 1 turn.',
        },
        {
          name: 'Trap',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_a_skill.png',
          dmgM: 2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 0.5,
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.bleeding),
            this.helper.eS.getEffect(this.helper.effects.defBreak),
          ],
          description:
            'Deals damage to the enemy equal to 200% of the attack value, imposes penalties on the enemy: ' +
            this.helper.effects.bleeding +
            ' and ' +
            this.helper.effects.defBreak +
            ' for 2 turns. Also attacks enemies within a 1-cell radius with 50% of their attack.',
        },
        {
          name: 'A free man',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_passive.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          passive: true,
          description:
            'This hero takes 25% less damage from the debuff. ' +
            this.helper.effects.poison +
            '. Can attack from a distance of 2 cells.',
        },
      ],
      effects: [],
    };
  }

  getGiant(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      attackRange: 1,
      rankBoost: 1.05,
      ignoredDebuffs: [this.helper.effects.freezing],
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
      name: HeroesNamesCodes.Giant,
      description:
        'An incredibly powerful enemy. A mythical creature from legends. Its hide is almost impenetrable by weapons, but it is vulnerable to debuffs.',
      skills: [
        {
          name: 'Mighty Blow',
          imgSrc: '../../../assets/resourses/imgs/heroes/giant/skills/giant_c_skill.png',
          dmgM: 3,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
          description:
            'Deals 300% of Attack damage to an enemy and applies a debuff to them. ' +
            this.helper.effects.attackBreak +
            ' for 2 turns.',
        },
        {
          name: 'Crusher',
          imgSrc: '../../../assets/resourses/imgs/heroes/giant/skills/giant_active_skill.png',
          dmgM: 5,
          cooldown: 6,
          remainingCooldown: 0,
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff)],
          addBuffsBeforeAttack: false,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
          description:
            'Deals damage to an enemy equal to 500% of their attack value and applies a debuff to them. ' +
            this.helper.effects.defBreak +
            ' for 2 turns. After attacking, casts a buff on himself. ' +
            this.helper.effects.attackBuff +
            ' for 2 turns.',
        },
        {
          name: 'Giant',
          imgSrc: '../../../assets/resourses/imgs/icons/aura.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          passive: true,
          restoreSkill: true,
          description:
            'Takes 50% less damage from enemy attacks, but is extremely vulnerable to debuffs and penalties. This hero cannot be debuffed. ' +
            this.helper.effects.freezing,
        },
      ],
      effects: [],
    };
  }

  getNightKing(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      attackRange: 2,
      rankBoost: 1.3,
      ignoredDebuffs: [this.helper.effects.freezing],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding, this.helper.effects.poison],
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
      name: HeroesNamesCodes.NightKing,
      description:
        'A terrible enemy. The most powerful of the White Walkers and the king of the Land of Eternal Winter. Created to protect ' +
        'the living, he now seeks to plunge the world into darkness and eternal night.',
      skills: [
        {
          name: 'Wind of the North',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_c_s.png',
          dmgM: 2.4,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 1.5,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.freezing)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.freezing)],
          description:
            'Deals 240% of Attack damage to an enemy and applies a debuff to them. ' +
            this.helper.effects.freezing +
            ' for 2 turns. Also attacks all enemies on the field with 150% of their attack value, inflicting a penalty on them. ' +
            this.helper.effects.freezing +
            ' for 2 turns.',
        },
        {
          name: 'The chilling frost',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_a_s.png',
          dmgM: 4.2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 3.3,
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff)],
          addBuffsBeforeAttack: true,
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.defDestroy),
            this.helper.eS.getEffect(this.helper.effects.defBreak),
          ],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defDestroy)],
          description:
            'Deals 420% Attack damage to a target enemy and applies a debuff to them. ' +
            this.helper.effects.defDestroy +
            ' and ' +
            this.helper.effects.defBreak +
            ' for 2 turns. Deals 330% of attack damage to all enemies on the battlefield and applies a debuff to them. ' +
            this.helper.effects.defDestroy +
            ' for 2 turns. Before attacking, casts a buff on yourself. ' +
            this.helper.effects.attackBuff +
            ' and ' +
            this.helper.effects.defBuff +
            ' for 2 turns.',
        },
        {
          name: 'The Night King',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_p_s.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff, 1)],
          passive: true,
          description:
            'Takes 50% less damage from enemy attacks. Takes 25% less damage from debuffs. ' +
            this.helper.effects.bleeding +
            ' and ' +
            this.helper.effects.poison +
            '. This hero is immune to ' +
            this.helper.effects.freezing +
            '. At the start of the turn, receive a buff ' +
            this.helper.effects.attackBuff +
            ' for 1 turn. Can attack from a distance of 2 cells.',
        },
      ],
      effects: [],
    };
  }

  getWhiteWalkerGeneral(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      attackRange: 1,
      rankBoost: 1.2,
      ignoredDebuffs: [this.helper.effects.freezing],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding, this.helper.effects.poison],
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
      name: HeroesNamesCodes.WhiteWalkerGeneral,
      description:
        'A terrible enemy. A powerful white walker and commander of the Night King army. Created by his ' +
        'master to destroy the living, he now seeks to plunge the world into darkness and eternal night.',
      skills: [
        {
          name: 'Frosty Wind',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_c_s.jpg',
          dmgM: 2.7,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 20,
          attackInRangeM: 1.4,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak, 1)],
          description:
            'Deals 270% of Attack Damage to an enemy and applies a debuff to them. ' +
            this.helper.effects.defBreak +
            ' for 1 turn. Also attacks all enemies on the field with 140% of their attack value.',
        },
        {
          name: 'White Walker',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_p_s.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          buffs: [this.helper.eS.getEffect(this.helper.effects.defBuff, 1)],
          passive: true,
          description:
            'Takes 30% less damage from enemy attacks. Takes 25% less damage from debuffs. ' +
            this.helper.effects.bleeding +
            ' and ' +
            this.helper.effects.poison +
            '. This hero is immune to ' +
            this.helper.effects.freezing +
            '. Before the start of the turn receives ' +
            this.helper.effects.defBuff +
            ' for 1 turn. Receives this bonus at the start of the game for 2 turns.',
        },
      ],
      effects: [this.helper.eS.getEffect(this.helper.effects.defBuff)],
    };
  }

  getWhiteWalkerCapitan(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      attackRange: 1,
      rarity: Rarity.LEGENDARY,
      rankBoost: 1.1,
      ignoredDebuffs: [this.helper.effects.freezing],
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
      name: HeroesNamesCodes.WhiteWalkerCapitan,
      description:
        'A terrible enemy. The weakest white walker and captain of the Night Kings army. Created by his master to destroy the living,' +
        ' he now seeks to plunge the world into darkness and eternal night.',
      skills: [
        {
          name: 'Frost Strike',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/white_walker_c_s.jpg',
          dmgM: 1.9,
          cooldown: 0,
          remainingCooldown: 0,
          description: 'Deals damage to the enemy equal to 190% of the attack value.',
        },
        {
          name: 'White Walker',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_p_s.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          buffs: [
            this.helper.eS.getEffect(this.helper.effects.defBuff),
            this.helper.eS.getEffect(this.helper.effects.attackBuff),
          ],
          passive: true,
          description:
            'Takes 15% less damage from enemy attacks. This hero is immune to ' +
            this.helper.effects.freezing +
            '. Each turn gets ' +
            this.helper.effects.defBuff +
            ' and ' +
            this.helper.effects.attackBuff +
            ' for 2 turns.',
        },
      ],
      effects: [],
    };
  }

  getJonKing(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      attackRange: 1,
      rankBoost: 1.3,
      rarity: Rarity.LEGENDARY,
      ignoredDebuffs: [this.helper.effects.freezing, this.helper.effects.attackBreak],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding],
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
      name: HeroesNamesCodes.JonKing,
      description:
        'A strong, true leader, Jon Snow countless victories on the battlefield led his peers to recognize him as the King in the North.',
      skills: [
        {
          name: 'The Decisive Blow',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_HeroicAbility_PathfindersBlade.webp',
          dmgM: 2,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 1.1,
          description:
            'Deals damage to the enemy equal to 200% of the attack value and 110% of the attack value to enemies within a 1 cell radius.',
        },
        {
          name: 'Blade of the Pioneer',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_ActiveAbility_DecisiveStrike.webp',
          dmgM: 3.1,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 2.5,
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.defBreak, 3),
            this.helper.eS.getEffect(this.helper.effects.bleeding, 3),
            this.helper.eS.getEffect(this.helper.effects.attackBreak, 3),
          ],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.bleeding)],
          description:
            'Deals damage to the target enemy equal to 310% of their attack value and applies 3 debuffs to them: ' +
            this.helper.effects.defBreak +
            ', ' +
            this.helper.effects.bleeding +
            ' and ' +
            this.helper.effects.attackBreak +
            ' for 3 turns. Deals 250% of attack damage to enemies within a 1-cell radius and applies a debuff to them. ' +
            this.helper.effects.bleeding +
            ' for 2 turns.',
        },
        {
          name: 'Justice',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_PassiveAbility_PassTheSentenceSwingTheSword.webp',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff, 1)],
          passive: true,
          description:
            'Takes 10% less damage from enemy attacks. Takes 25% less damage from debuffs.' +
            this.helper.effects.bleeding +
            '. This hero is immune to ' +
            this.helper.effects.freezing +
            ' and ' +
            this.helper.effects.attackBreak +
            '. At the beginning of the game receives ' +
            this.helper.effects.defBuff +
            ' for 2 turns. Before the start of the turn, casts a debuff on itself. ' +
            this.helper.effects.attackBuff +
            ' for 1 turn.',
        },
      ],
      effects: [this.helper.eS.getEffect(this.helper.effects.defBuff)],
    };
  }

  getDailyBossVersion1(): Unit {
    return {
      ...this.helper.getBasicUserConfig(),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      attackRange: 1,
      rankBoost: 1.5,
      ignoredDebuffs: [this.helper.effects.burning],
      reducedDmgFromDebuffs: [this.helper.effects.bleeding],
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
      name: HeroesNamesCodes.DailyBossVersion1,
      description: '',
      skills: [
        {
          name: 'Warm Reception',
          imgSrc: '../../../assets/resourses/imgs/boss/v1/skills/gr_s1.png',
          dmgM: 2.8,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: true,
          attackRange: 1,
          attackInRangeM: 2.35,
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 2, 2)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
          description:
            'Deals 280% of attack damage to an enemy and applies 2 debuffs to them. ' +
            this.helper.effects.burning +
            ' for 2 turns. Also attacks enemies within a 1 cell radius for 235% of their attack value.,' +
            ' applies to them ' +
            this.helper.effects.defBreak +
            ' for 2 turns.',
        },
        {
          name: 'Healing by fire',
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
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 3, 4)],
          inRangeDebuffs: [
            this.helper.eS.getEffect(this.helper.effects.defBreak, 3),
            this.helper.eS.getEffect(this.helper.effects.bleeding, 3),
            this.helper.eS.getEffect(this.helper.effects.defDestroy, 3),
          ],
          description:
            'Deals 140% of attack damage to an enemy and applies 4 debuffs to them. ' +
            this.helper.effects.burning +
            ' for 3 turns. Before attacking, restores all allies health equal to 1% of their maximum health.' +
            ' Deals 110% of attack damage to enemies within 2 cells and applies to them: ' +
            this.helper.effects.defDestroy +
            ', ' +
            this.helper.effects.bleeding +
            ', ' +
            this.helper.effects.defBreak +
            ' for 3 turns.',
        },
        {
          name: 'Soul of Flame',
          imgSrc: '../../../assets/resourses/imgs/debuffs/burning.png',
          dmgM: 0,
          cooldown: 0,
          remainingCooldown: 0,
          passive: true,
          description:
            'Takes 25% less damage from enemy attacks. Takes 25% less damage from debuffs: ' +
            this.helper.effects.bleeding +
            '. This hero is immune to ' +
            this.helper.effects.burning +
            '. Receives a buff at the start of the game ' +
            this.helper.effects.healthRestore +
            ' until the end of the battle. Has a chance to resurrect after a fatal blow.',
        },
      ],
      effects: [this.helper.eS.getEffect(this.helper.effects.healthRestore, 1000)],
    };
  }

  getAllHeroes(returnNames?: false): Unit[];
  getAllHeroes(returnNames?: true): string[];
  getAllHeroes(returnNames = false): Unit[] | string[] {
    const units = [
      this.getIceRiverHunter(),
      this.getJonKing(),
      this.getWhiteWalkerCapitan(),
      this.getLadyOfDragonStone(),
      this.getWhiteWalkerGeneral(),
      this.getNightKing(),
      this.getGiant(),
      this.getFreeTrapper(),
      this.getBrownWolf(),
      this.getWhiteWolf(),
      this.getTargaryenKnight(),
      this.getRelinaShow(),
      this.getPriest(),
      this.getDailyBossVersion1(),
    ];

    return returnNames
      ? units.map(unit => unit.name)
      : units.map(unit => this.helper.getEquipmentForUnit(unit));
  }

  getPreviewUnit(unitName: string): PreviewUnit {
    const unit = this.getUnitByName(unitName);

    return {
      description: unit.description,
      imgSrc: unit.imgSrc,
      name: unit.name,
      skills: unit.skills.map(skill => ({
        name: skill.name,
        imgSrc: skill.imgSrc,
        description: skill.description,
        passive: skill.passive,
      })),
    };
  }

  getTileUnit(unit: Unit, config?: GetTileConfig): TileUnit {
    return {
      onlyHealer: unit.onlyHealer || false,
      rage: unit.rage,
      attack: unit.attack,
      attackRange: unit.attackRange,
      canAttack: unit.canAttack,
      canCross: unit.canCross,
      canMove: unit.canMove,
      defence: unit.defence,
      dmgReducedBy: unit.dmgReducedBy,
      effects: unit.effects,
      healer: unit.healer || false,
      health: unit.health,
      heroType: unit.heroType,
      ignoredDebuffs: unit.ignoredDebuffs,
      imgSrc: unit.imgSrc,
      maxCanCross: unit.canCross,
      maxHealth: unit.maxHealth,
      name: unit.name,
      reducedDmgFromDebuffs: unit.reducedDmgFromDebuffs,
      skills: unit.skills,
      user: config?.user ?? unit.user,
      willpower: unit.willpower,
      x: config?.x || unit.x,
      y: config?.y || unit.y,
    };
  }

  getUnitByName(name: string, config?: UnitConfig) {
    const allUnits = this.getAllHeroes();
    const userUnit = allUnits.filter(unit => unit.name === name)[0];

    return this.helper.getEquipmentForUnit({ ...userUnit, ...(config || {}) });
  }

  getUnitsForTrainingBattle(
    getUser: boolean,
    unitsToCompare: PreviewUnit[],
    allUnits = this.getAllHeroes(),
  ) {
    return allUnits
      .filter(unit => {
        return unitsToCompare.findIndex(v => v.name === unit.name) !== -1;
      })
      .map((el, i) => ({ ...el, x: 2 + i, y: getUser ? 1 : 8, user: getUser }));
  }

  getInitialHeroes() {
    return [this.getWhiteWolf(), this.getIceRiverHunter()];
  }

  getContent(contentType = ContentTypes.USER_UNITS) {
    if (contentType === ContentTypes.USER_UNITS) {
      return this.getAllHeroes().map(value => ({
        ...this.getPreviewUnit(value.name),
        fullImgSrc: value.fullImgSrc,
        rank: value.rank,
        level: value.level,
      }));
    }

    return [];
  }
}
