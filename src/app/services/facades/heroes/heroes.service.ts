import { inject, Injectable } from '@angular/core';
import {
  GetTileConfig,
  HeroesNamesCodes,
  HeroType,
  PreviewUnit,
  Rarity,
  Unit,
  UnitConfig,
  UnitName,
} from '../../../models/units-related/unit.model';
import { ContentService, ContentTypes } from '../../abstract/content/content-service.service';
import { TileUnit } from '../../../models/field.model';
import { HeroesHelperService } from './helpers/heroes-helper.service';
import { UnitsConfiguratorStateUnit } from '../../../store/store.interfaces';

@Injectable({
  providedIn: 'root',
})
export class HeroesFacadeService extends ContentService {
  helper = inject(HeroesHelperService);
  allUnits: Unit[] = [];

  constructor() {
    super();
    this.allUnits = this.getAllHeroes();
  }

  getLadyOfDragonStone(): Unit {
    const passiveBuffs = [this.helper.eS.getEffect(this.helper.effects.healthRestore, 1)];
    const effects = [
      this.helper.eS.getEffect(this.helper.effects.healthRestore),
      this.helper.eS.getEffect(this.helper.effects.attackBuff, 2),
    ];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.LadyOfDragonStone),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: '../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/lds/UI_HeroFull_Daenerys_2.png',
      description:
        "As her influence grows, Daenerys's ability to channel the fire of her heart through her people drives her to perform great feats of war.",
      skills: [
        getAndSetSkillDescription({
          name: 'Burning',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/lds/skills/UI_HeroicAbility_BloodOfTheDragon.jpeg',
          dmgM: 1.8,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 2,
            attackInRangeM: 1.35,
          },
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 2, 3)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak, 5)],
        }),
        getAndSetSkillDescription({
          name: 'Drakarys',
          imgSrc: '../../../assets/resourses/imgs/heroes/lds/skills/UI_ActiveAbility_Dracarys.jpeg',
          dmgM: 2.9,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 3,
            attackInRangeM: 1.9,
          },
          addBuffsBeforeAttack: true,
          buffs: [
            this.helper.eS.getEffect(this.helper.effects.attackBuff, 3),
            this.helper.eS.getEffect(this.helper.effects.defBuff, 3),
          ],
          debuffs: [
            ...this.helper.eS.getEffect(this.helper.effects.burning, 2, 5),
            this.helper.eS.getEffect(this.helper.effects.defBreak, 2),
          ],
          inRangeDebuffs: [...this.helper.eS.getEffect(this.helper.effects.bleeding, 2, 2)],
        }),
        {
          name: 'Targaryen',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/lds/skills/UI_PassiveAbility_FerventDevotion.jpeg',
          buffs: passiveBuffs,
          passive: true,
          restoreSkill: true,
          description: this.helper.getPassiveSkillDescription(
            HeroesNamesCodes.LadyOfDragonStone,
            effects,
            passiveBuffs,
          ),
        },
      ],
      effects: effects,
      synergy: [HeroesNamesCodes.TargaryenKnight],
    };
  }

  getRedKeepAlchemist(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.RedKeepAlchemist),
      heroType: HeroType.ATTACK,
      rarity: Rarity.EPIC,
      imgSrc: '../../../assets/resourses/imgs/heroes/targaryen_archer/UI_Avatar_Unit_12.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/targaryen_archer/UI_UnitFull_12.png',
      description:
        "Rejected from the Alchemist's Guild, this unique fighter brings both fire and fury to a melee or ranged battle.",
      skills: [
        getAndSetSkillDescription({
          name: 'Throw Wildfire',
          imgSrc: '../../../assets/resourses/imgs/heroes/targaryen_archer/skills/rka_a1.png',
          dmgM: 2.8,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 2, 2)],
          activateDebuffs: [this.helper.effects.burning, this.helper.effects.bleeding],
        }),
        getAndSetSkillDescription({
          name: 'Burning Embers',
          imgSrc: '../../../assets/resourses/imgs/heroes/targaryen_archer/skills/rka_a2.png',
          dmgM: 1.9,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 2,
            attackInRangeM: 1.9,
          },
          addBuffsBeforeAttack: false,
          buffs: [
            this.helper.eS.getEffect(this.helper.effects.attackBuff, 3),
            this.helper.eS.getEffect(this.helper.effects.defBuff, 3),
          ],
          debuffs: [
            ...this.helper.eS.getEffect(this.helper.effects.burning, 2, 3),
            ...this.helper.eS.getEffect(this.helper.effects.bleeding, 2, 3),
          ],
          inRangeDebuffs: [
            ...this.helper.eS.getEffect(this.helper.effects.burning, 2, 2),
            ...this.helper.eS.getEffect(this.helper.effects.bleeding, 2, 2),
          ],
          activateDebuffs: [this.helper.effects.burning, this.helper.effects.bleeding],
        }),
        {
          name: 'Unstable',
          imgSrc: '../../../assets/resourses/imgs/heroes/targaryen_archer/skills/rka_a3.png',
          buffs: [],
          passive: true,
          restoreSkill: false,
          description: this.helper.getPassiveSkillDescription(HeroesNamesCodes.RedKeepAlchemist),
        },
      ],
      effects: [],
      synergy: [HeroesNamesCodes.TargaryenKnight, HeroesNamesCodes.LadyOfDragonStone],
    };
  }

  getTargaryenKnight(): Unit {
    const effects = [this.helper.eS.getEffect(this.helper.effects.defBuff)];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.DEFENCE);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.TargaryenKnight),
      heroType: HeroType.DEFENCE,
      rarity: Rarity.EPIC,
      imgSrc: '../../../assets/resourses/imgs/heroes/targaryen_knight/UI_Avatar_Unit_21.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/targaryen_knight/UI_UnitFull_21.png',
      description:
        'A versatile Targaryen warrior from the Crownlands, this knight excels in both offense and defense.',
      skills: [
        getAndSetSkillDescription({
          name: 'Dragon Fury',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_ActiveAbility_Intimidate.webp',
          dmgM: 1.1,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 1,
            attackInRangeM: 1.1,
          },
          debuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
        }),
        getAndSetSkillDescription({
          name: 'For the King',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_HeroicAbility_ShieldMastery.webp',
          dmgM: 1.3,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 2,
            attackInRangeM: 1.3,
          },
          buffs: [
            this.helper.eS.getEffect(this.helper.effects.defBuff),
            this.helper.eS.getEffect(this.helper.effects.healthRestore, 1),
          ],
          addBuffsBeforeAttack: false,
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
        }),
        {
          name: 'Crown Shield',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/targaryen_knight/skills/UI_PassiveAbility_ScaledArmor.webp',
          passive: true,
          restoreSkill: false,
          description: this.helper.getPassiveSkillDescription(
            HeroesNamesCodes.TargaryenKnight,
            effects,
          ),
        },
      ],
      effects: effects,
      synergy: [HeroesNamesCodes.LadyOfDragonStone],
    };
  }

  getWhiteWolf(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.WhiteWolf),
      rarity: Rarity.RARE,
      heroType: HeroType.ATTACK,
      imgSrc: '../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaDireWolf.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/wolf/UI_Icon_Avatar_FullBody_AlphaDireWolf.png',
      description:
        'The alpha of the pack beyond the wall. Strikes terror into the hearts of men and inflicts terrible wounds in anger.',
      skills: [
        getAndSetSkillDescription({
          name: 'Beast bite',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.bleeding, 1)],
        }),
        getAndSetSkillDescription({
          name: 'Torn wound',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_def_attack.png',
          dmgM: 1.2,
          cooldown: 3,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
        }),
      ],
      effects: [],
      synergy: [HeroesNamesCodes.BrownWolf],
    };
  }

  getPriest(): Unit {
    const effects = [this.helper.eS.getEffect(this.helper.effects.healthRestore)];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.DEFENCE);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.Priest),
      heroType: HeroType.DEFENCE,
      healer: true,
      rarity: Rarity.EPIC,
      onlyHealer: false,
      imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/UI_Avatar_Unit_Lokrand.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/healer-w/UI_HeroFull_Lokrand_1.png',
      description: 'The priest beyond the wall.',
      skills: [
        getAndSetSkillDescription({
          name: 'Wound dressing',
          imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/skills/health_restore_buff.png',
          dmgM: 0.35,
          cooldown: 0,
          remainingCooldown: 0,
          heal: {
            healAll: true,
            healM: 0.1,
          },
        }),
        getAndSetSkillDescription({
          name: 'Great Healing',
          imgSrc: '../../../assets/resourses/imgs/heroes/healer-w/skills/healer_2skill.png',
          dmgM: 1.9,
          cooldown: 5,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 3,
            attackInRangeM: 0.9,
          },
          heal: {
            healM: 0.25,
            healAll: true,
          },
          extendsBuffs: [this.helper.effects.attackBuff, this.helper.effects.defBuff],
        }),
        {
          name: 'Lokrand',
          imgSrc: '../../../assets/resourses/imgs/icons/aura.png',
          passive: true,
          restoreSkill: true,
          description: this.helper.getPassiveSkillDescription(HeroesNamesCodes.Priest, effects),
        },
      ],
      effects: effects,
      synergy: [
        HeroesNamesCodes.IceRiverHunter,
        HeroesNamesCodes.Giant,
        HeroesNamesCodes.JonKing,
        HeroesNamesCodes.FreeTrapper,
      ],
    };
  }

  getBrownWolf(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.BrownWolf),
      heroType: HeroType.ATTACK,
      rarity: Rarity.COMMON,
      imgSrc: '../../../assets/resourses/imgs/heroes/wolf/UI_Avatar_Unit_AlphaWolf.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/wolf/UI_Icon_Avatar_FullBody_AlphaWolf.png',
      description: 'The wolf of the pack beyond the wall.',
      skills: [
        getAndSetSkillDescription({
          name: 'Taste',
          imgSrc: '../../../assets/resourses/imgs/heroes/wolf/skills/wolf_attack.png',
          dmgM: 1,
          cooldown: 0,
          remainingCooldown: 0,
        }),
      ],
      effects: [],
      synergy: [
        HeroesNamesCodes.WhiteWolf,
        HeroesNamesCodes.FreeTrapper,
        HeroesNamesCodes.IceRiverHunter,
      ],
    };
  }

  getIceRiverHunter(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.IceRiverHunter),
      heroType: HeroType.ATTACK,
      rarity: Rarity.COMMON,
      imgSrc:
        '../../../assets/resourses/imgs/heroes/iceriver_hunter/UI_Avatar_Unit_IceRiverHunters.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/iceriver_hunter/UI_Icon_Avatar_FullBody_Wildling_02_IceRiverHunters.png',
      description:
        'A young hunter from the lands beyond the wall. The icy river is his hunting ground.',
      skills: [
        getAndSetSkillDescription({
          name: 'Ice Arrow',
          imgSrc: '../../../assets/resourses/imgs/heroes/iceriver_hunter/skills/iceriver_h_c_s.png',
          dmgM: 2.1,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.freezing)],
        }),
      ],
      effects: [],
      synergy: [
        HeroesNamesCodes.BrownWolf,
        HeroesNamesCodes.Giant,
        HeroesNamesCodes.RelinaShow,
        HeroesNamesCodes.WhiteWolf,
        HeroesNamesCodes.JonKing,
        HeroesNamesCodes.FreeTrapper,
      ],
    };
  }

  getRelinaShow(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.RelinaShow),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: 'assets/resourses/imgs/heroes/relina-snow/UI_Avatar_Unit_Thosa_RelinaSnow.png',
      fullImgSrc: 'assets/resourses/imgs/heroes/relina-snow/UI_HeroFull_Relina_1.png',
      description:
        'Relina Snow is a warrior of the Enchanted Forest. A skilled and cunning fighter.',
      skills: [
        getAndSetSkillDescription({
          name: 'Trap',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_a1.png',
          dmgM: 1.9,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackInRangeM: 0,
            attackRange: 20,
          },
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.poison),
            this.helper.eS.getEffect(this.helper.effects.root),
          ],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
        }),
        getAndSetSkillDescription({
          name: 'Ambush',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_a2.png',
          dmgM: 1.5,
          cooldown: 2,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 3,
            attackInRangeM: 1.15,
          },
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.bleeding),
            this.helper.eS.getEffect(this.helper.effects.defBreak),
          ],
        }),
        {
          name: 'Warrior',
          imgSrc: '../../../assets/resourses/imgs/heroes/relina-snow/skills/relia_p.png',
          passive: true,
          description: this.helper.getPassiveSkillDescription(HeroesNamesCodes.RelinaShow),
        },
      ],
      effects: [],
      synergy: [
        HeroesNamesCodes.Giant,
        HeroesNamesCodes.Priest,
        HeroesNamesCodes.WhiteWolf,
        HeroesNamesCodes.BrownWolf,
        HeroesNamesCodes.IceRiverHunter,
      ],
    };
  }

  getFreeTrapper(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.FreeTrapper),
      heroType: HeroType.ATTACK,
      rarity: Rarity.RARE,
      imgSrc:
        '../../../assets/resourses/imgs/heroes/free-trapper/UI_Avatar_Unit_FreeFolksTrappers.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/free-trapper/UI_Icon_Avatar_FullBody_Wildling_08_FreeFolksTrappers.png',
      description:
        'A Free Folk archer has studied the art of assassination since birth. He is a master of natural poisons and knows how to set traps for animals and people.',
      skills: [
        getAndSetSkillDescription({
          name: 'Toxic Shot',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_c_skill.png',
          dmgM: 1.5,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.poison, 1)],
        }),
        getAndSetSkillDescription({
          name: 'Trap',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_a_skill.png',
          dmgM: 2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 1,
            attackInRangeM: 0.5,
          },
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.bleeding),
            this.helper.eS.getEffect(this.helper.effects.defBreak),
          ],
        }),
        {
          name: 'A free man',
          imgSrc: '../../../assets/resourses/imgs/heroes/free-trapper/skills/free_arc_passive.png',
          passive: true,
          description: this.helper.getPassiveSkillDescription(HeroesNamesCodes.FreeTrapper),
        },
      ],
      effects: [],
      synergy: [
        HeroesNamesCodes.IceRiverHunter,
        HeroesNamesCodes.Priest,
        HeroesNamesCodes.WhiteWolf,
        HeroesNamesCodes.BrownWolf,
        HeroesNamesCodes.JonKing,
        HeroesNamesCodes.Giant,
        HeroesNamesCodes.RelinaShow,
      ],
    };
  }

  getGiant(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.Giant),
      heroType: HeroType.ATTACK,
      rarity: Rarity.EPIC,
      imgSrc: '../../../assets/resourses/imgs/heroes/giant/UI_Avatar_Unit_Giant.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/giant/UI_Icon_Avatar_FullBody_Giant.png',
      description:
        'An incredibly powerful enemy. A mythical creature from legends. Its hide is almost impenetrable by weapons, but it is vulnerable to debuffs.',
      skills: [
        getAndSetSkillDescription({
          name: 'Mighty Blow',
          imgSrc: '../../../assets/resourses/imgs/heroes/giant/skills/giant_c_skill.png',
          dmgM: 3,
          cooldown: 0,
          remainingCooldown: 0,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.attackBreak)],
        }),
        getAndSetSkillDescription({
          name: 'Crusher',
          imgSrc: '../../../assets/resourses/imgs/heroes/giant/skills/giant_active_skill.png',
          dmgM: 5,
          cooldown: 6,
          remainingCooldown: 0,
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff)],
          addBuffsBeforeAttack: false,
          debuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
        }),
        {
          name: 'Giant',
          imgSrc: '../../../assets/resourses/imgs/icons/aura.png',
          passive: true,
          restoreSkill: true,
          description: this.helper.getPassiveSkillDescription(HeroesNamesCodes.Giant),
        },
      ],
      effects: [],
      synergy: [
        HeroesNamesCodes.JonKing,
        HeroesNamesCodes.Priest,
        HeroesNamesCodes.BrownWolf,
        HeroesNamesCodes.WhiteWolf,
        HeroesNamesCodes.IceRiverHunter,
        HeroesNamesCodes.FreeTrapper,
      ],
    };
  }

  getNightKing(): Unit {
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.NightKing),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: '../../../assets/resourses/imgs/heroes/night_king/UI_Avatar_Unit_WhiteWalker.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/night_king/UI_Icon_Avatar_FullBody_WhiteWalker.png',
      description:
        'A terrible enemy. The most powerful of the White Walkers and the king of the Land of Eternal Winter. Created to protect ' +
        'the living, he now seeks to plunge the world into darkness and eternal night.',
      skills: [
        getAndSetSkillDescription({
          name: 'Wind of the North',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_c_s.png',
          dmgM: 2.4,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 20,
            attackInRangeM: 1.5,
          },
          debuffs: [this.helper.eS.getEffect(this.helper.effects.freezing)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.freezing)],
        }),
        getAndSetSkillDescription({
          name: 'The chilling frost',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_a_s.png',
          dmgM: 4.2,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 20,
            attackInRangeM: 3.3,
          },
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff)],
          addBuffsBeforeAttack: true,
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.defDestroy),
            this.helper.eS.getEffect(this.helper.effects.defBreak),
          ],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defDestroy)],
        }),
        {
          name: 'The Night King',
          imgSrc: '../../../assets/resourses/imgs/heroes/night_king/skills/night_king_p_s.png',
          buffs: [this.helper.eS.getEffect(this.helper.effects.attackBuff, 1)],
          passive: true,
          description: this.helper.getPassiveSkillDescription(HeroesNamesCodes.NightKing),
        },
      ],
      effects: [],
      synergy: [HeroesNamesCodes.WhiteWalkerCapitan, HeroesNamesCodes.WhiteWalkerGeneral],
    };
  }

  getWhiteWalkerGeneral(): Unit {
    const effects = [this.helper.eS.getEffect(this.helper.effects.defBuff)];
    const passiveBuffs = [this.helper.eS.getEffect(this.helper.effects.defBuff, 1)];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.WhiteWalkerGeneral),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/UI_Avatar_Unit_WhiteWalker1.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/white_walker/UI_Icon_Avatar_FullBody_WhiteWalker2.png',
      description:
        'A terrible enemy. A powerful white walker and commander of the Night King army. Created by his ' +
        'master to destroy the living, he now seeks to plunge the world into darkness and eternal night.',
      skills: [
        getAndSetSkillDescription({
          name: 'Frosty Wind',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_c_s.jpg',
          dmgM: 2.7,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 20,
            attackInRangeM: 1.4,
          },
          debuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak, 1)],
        }),
        {
          name: 'White Walker',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_p_s.png',
          buffs: passiveBuffs,
          passive: true,
          description: this.helper.getPassiveSkillDescription(
            HeroesNamesCodes.WhiteWalkerGeneral,
            effects,
            passiveBuffs,
          ),
        },
      ],
      effects: effects,
      synergy: [HeroesNamesCodes.NightKing, HeroesNamesCodes.WhiteWalkerCapitan],
    };
  }

  getWhiteWalkerCapitan(): Unit {
    const passiveBuffs = [
      this.helper.eS.getEffect(this.helper.effects.defBuff),
      this.helper.eS.getEffect(this.helper.effects.attackBuff),
    ];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.WhiteWalkerCapitan),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/UI_Avatar_Unit_WhiteWalker2.png',
      fullImgSrc:
        '../../../assets/resourses/imgs/heroes/white_walker/UI_Icon_Avatar_FullBody_WhiteWalker3.png',
      description:
        'A terrible enemy. The weakest white walker and captain of the Night Kings army. Created by his master to destroy the living,' +
        ' he now seeks to plunge the world into darkness and eternal night.',
      skills: [
        getAndSetSkillDescription({
          name: 'Frost Strike',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/white_walker_c_s.jpg',
          dmgM: 1.9,
          cooldown: 0,
          remainingCooldown: 0,
        }),
        {
          name: 'White Walker',
          imgSrc: '../../../assets/resourses/imgs/heroes/white_walker/skills/walker_p_s.png',
          buffs: passiveBuffs,
          passive: true,
          description: this.helper.getPassiveSkillDescription(
            HeroesNamesCodes.WhiteWalkerCapitan,
            [],
            passiveBuffs,
          ),
        },
      ],
      effects: [],
      synergy: [HeroesNamesCodes.WhiteWalkerGeneral, HeroesNamesCodes.NightKing],
    };
  }

  getJonKing(): Unit {
    const effects = [this.helper.eS.getEffect(this.helper.effects.defBuff)];
    const passiveBuffs = [this.helper.eS.getEffect(this.helper.effects.attackBuff, 1)];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.JonKing),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: '../../../assets/resourses/imgs/heroes/jon_king/UI_Avatar_Unit_JonKingNorth.png',
      fullImgSrc: '../../../assets/resourses/imgs/heroes/jon_king/UI_HeroFull_JonSnow_3.png',
      description:
        'A strong, true leader, Jon Snow countless victories on the battlefield led his peers to recognize him as the King in the North.',
      skills: [
        getAndSetSkillDescription({
          name: 'The Decisive Blow',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_HeroicAbility_PathfindersBlade.webp',
          dmgM: 2,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 1,
            attackInRangeM: 1.1,
          },
        }),
        getAndSetSkillDescription({
          name: 'Blade of the Pioneer',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_ActiveAbility_DecisiveStrike.webp',
          dmgM: 3.1,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 1,
            attackInRangeM: 2.5,
          },
          debuffs: [
            this.helper.eS.getEffect(this.helper.effects.defBreak, 3),
            this.helper.eS.getEffect(this.helper.effects.bleeding, 3),
            this.helper.eS.getEffect(this.helper.effects.attackBreak, 3),
          ],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.bleeding)],
        }),
        {
          name: 'Justice',
          imgSrc:
            '../../../assets/resourses/imgs/heroes/jon_king/skills/UI_PassiveAbility_PassTheSentenceSwingTheSword.webp',
          buffs: passiveBuffs,
          passive: true,
          description: this.helper.getPassiveSkillDescription(
            HeroesNamesCodes.JonKing,
            effects,
            passiveBuffs,
          ),
        },
      ],
      effects: effects,
      synergy: [HeroesNamesCodes.Giant],
    };
  }

  getDailyBossVersion1(): Unit {
    const effects = [this.helper.eS.getEffect(this.helper.effects.healthRestore, 1000)];
    const getAndSetSkillDescription = this.helper.getAndSetSkillDescription(HeroType.ATTACK);

    return {
      ...this.helper.getBasicUserConfig(),
      ...this.helper.getHeroBasicStats(HeroesNamesCodes.DailyBossVersion1),
      heroType: HeroType.ATTACK,
      rarity: Rarity.LEGENDARY,
      imgSrc: '../../../assets/resourses/imgs/boss/v1/UI_Avatar_Unit_GromyrtheFlame.png',
      fullImgSrc: '../../../assets/resourses/imgs/boss/v1/UI_Boss_CutIn_Pic_1.png',
      description: '',
      skills: [
        getAndSetSkillDescription({
          name: 'Warm Reception',
          imgSrc: '../../../assets/resourses/imgs/boss/v1/skills/gr_s1.png',
          dmgM: 2.8,
          cooldown: 0,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 1,
            attackInRangeM: 2.35,
          },
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 2, 2)],
          inRangeDebuffs: [this.helper.eS.getEffect(this.helper.effects.defBreak)],
        }),
        getAndSetSkillDescription({
          name: 'Healing by fire',
          imgSrc: '../../../assets/resourses/imgs/boss/v1/skills/boss_s2.png',
          dmgM: 1.4,
          cooldown: 3,
          remainingCooldown: 0,
          attackInRange: {
            attackRange: 2,
            attackInRangeM: 1.1,
          },
          heal: {
            healAll: true,
            healM: 0.01,
          },
          debuffs: [...this.helper.eS.getEffect(this.helper.effects.burning, 3, 4)],
          inRangeDebuffs: [
            this.helper.eS.getEffect(this.helper.effects.defBreak, 3),
            this.helper.eS.getEffect(this.helper.effects.bleeding, 3),
            this.helper.eS.getEffect(this.helper.effects.defDestroy, 3),
          ],
        }),
        {
          name: 'Soul of Flame',
          imgSrc: '../../../assets/resourses/imgs/debuffs/burning.png',
          passive: true,
          description: this.helper.getPassiveSkillDescription(
            HeroesNamesCodes.DailyBossVersion1,
            effects,
          ),
        },
      ],
      effects: effects,
      synergy: [],
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
      this.getRedKeepAlchemist(),
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
      synergy: unit.synergy,
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
    const userUnit = this.allUnits.filter(unit => unit.name === name)[0];

    return this.helper.getEquipmentForUnit({ ...userUnit, ...(config || {}) });
  }

  getTileUnits() {
    return this.allUnits.map(el => this.getTileUnit(el));
  }

  getUnitsForTrainingBattle(
    getUser: boolean,
    unitsToCompare: UnitsConfiguratorStateUnit[],
    allUnits = this.allUnits,
  ) {
    return unitsToCompare.map(_ => {
      const el = allUnits.find(el => el.name === _.name) as Unit;

      return { ...el, x: _.x ?? 0, y: _.y ?? 0, user: getUser } satisfies Unit;
    });
  }

  getParamFromUnitByName(name: UnitName, param: keyof Unit) {
    const unit = this.allUnits.find(_ => _.name === name);

    return unit ? unit[param] : '';
  }

  getInitialHeroes() {
    return [this.getWhiteWolf(), this.getIceRiverHunter()];
  }

  getContent(contentType = ContentTypes.USER_UNITS) {
    if (contentType === ContentTypes.USER_UNITS) {
      return this.allUnits.map(value => ({
        ...this.getPreviewUnit(value.name),
        fullImgSrc: value.fullImgSrc,
        rank: value.rank,
        level: value.level,
        rarity: value.rarity,
      }));
    }

    return [];
  }
}
