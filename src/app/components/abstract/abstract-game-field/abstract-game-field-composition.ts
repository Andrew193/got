import { Store } from '@ngrx/store';
import {
  GameFieldVars,
  GameResultsRedirectType,
  Position,
  Tile,
  TilesToHighlight,
  TileUnit,
} from '../../../models/field.model';
import { selectBattleLog } from '../../../store/reducers/game-board.reducer';
import { Skill, TileUnitSkill } from '../../../models/units-related/skill.model';
import { AbstractFieldService } from '../../../services/abstract/field/abstract-field.service';
import { UnitService } from '../../../services/unit/unit.service';
import { EffectsService } from '../../../services/effects/effects.service';
import { GameBoardActions } from '../../../store/actions/game-board.actions';
import { EffectsValues } from '../../../constants';
import { HeroType } from '../../../models/units-related/unit.model';
import { BattleStateService } from '../../../services/game-related/battle-state/battle-state.service';

export interface GameField {
  gameField: Tile[][];
  gameConfig: any[][];
  possibleMoves: Position[];
}

export abstract class AbstractGameFieldComposition extends GameFieldVars {
  //Units config
  userUnits: TileUnit[] = [];
  aiUnits: TileUnit[] = [];

  //Meta
  battleMode = true;
  autoFight = false;

  log;
  over = false;
  showAttackBar = false;
  skillsInAttackBar: TileUnitSkill[] = [];

  ignoreMove = false;
  clickedEnemy: TileUnit | null = null;
  selectedEntity: TileUnit | null = null;
  possibleAttackMoves: Position[] = [];

  //Endgame
  gameResultsRedirect: GameResultsRedirectType = () => {};

  //Servants
  store;
  abstractFieldS;
  unitS;
  effectsS;
  protected battleStateS;

  // Getters for backward compatibility
  get turnUser(): boolean {
    return this.battleStateS.turnUser;
  }

  get turnCount(): number {
    return this.battleStateS.turnCount;
  }

  get maxTurnCount(): number {
    return this.battleStateS.maxTurnCount;
  }

  constructor(
    abstractFieldS: AbstractFieldService,
    unitS: UnitService,
    effectsS: EffectsService,
    battleStateS: BattleStateService,
    store: Store<any>,
  ) {
    super();

    this.abstractFieldS = abstractFieldS;
    this.unitS = unitS;
    this.effectsS = effectsS;
    this.battleStateS = battleStateS;
    this.store = store;

    this.log = this.store.select(selectBattleLog());
  }

  recreateGameConfig(newUserUnit: TileUnit[], newAiUnit: TileUnit[]) {
    this.resetState();

    if (newUserUnit) {
      this.userUnits = [...newUserUnit];
    }

    if (newAiUnit) {
      this.aiUnits = [...newAiUnit];
    }

    this.gameConfig = this.abstractFieldS.populateGameFieldWithUnits(this.userUnits, this.aiUnits);
  }

  shouldRenderAction(hero: TileUnit, type: 'canMove' | 'canAttack') {
    return this.battleMode ? this.battleMode : hero.user ? hero[type] && hero.health : hero.user;
  }

  showPossibleMoves(location: Position, radius: number, diagCheck = false) {
    return this.abstractFieldS.getFieldsInRadius(this.gameConfig, location, radius, diagCheck);
  }

  abstract addEffectToUnit(
    units: TileUnit[],
    unitIndex: number,
    skill: TileUnitSkill,
    addRangeEffects: boolean,
  ): void;

  abstract addBuffToUnit(units: TileUnit[], unitIndex: number, skill: Skill): void;

  abstract attack(skill: Skill): void;

  abstract checkEffects(
    unit: TileUnit,
    decreaseRestoreCooldown: boolean,
    workWith: EffectsValues[] | null,
  ): TileUnit;

  universalRangeAttack(
    skill: TileUnitSkill,
    clickedEnemy: TileUnit,
    enemiesArray: TileUnit[],
    userCheck: boolean,
    attacker: TileUnit,
  ) {
    if (skill.attackInRange) {
      const tilesInRange = this.abstractFieldS.getFieldsInRadius(
        this.gameConfig,
        this.unitS.getPositionFromCoordinate(clickedEnemy as TileUnit),
        skill.attackInRange.attackRange,
        true,
      );
      const enemiesInRange: TileUnit[] = tilesInRange
        .map(tile =>
          enemiesArray.find(
            unit => unit.x === tile.i && unit.y === tile.j && unit.user === userCheck,
          ),
        )
        .filter(e => !!e) as TileUnit[];

      for (const enemyInRange of enemiesInRange) {
        const enemyIndex = this.unitS.findUnitIndex(enemiesArray, enemyInRange);

        this.makeAttackMove(enemyIndex, enemiesArray, attacker, skill);

        if (attacker.rage > enemiesArray[enemyIndex].willpower) {
          this.addEffectToUnit(enemiesArray, enemyIndex, skill, !!skill.inRangeDebuffs);
        }
      }
    }
  }

  makeAttackMove(
    enemyIndex: number,
    dmgTaker: TileUnit[],
    attackDealer: TileUnit,
    skill: TileUnitSkill,
  ) {
    const boostedAttack =
      this.effectsS.getBoostedParameterCover(
        attackDealer,
        attackDealer.effects,
        attackDealer.heroType === HeroType.ATTACK ? 'attack' : 'defence',
      ) * (skill.dmgM || 0);
    const boostedDefence = this.effectsS.getBoostedParameterCover(
      dmgTaker[enemyIndex],
      dmgTaker[enemyIndex].effects,
      'defence',
    );

    const damage = this.abstractFieldS.getDamage({
      dmgTaker: { ...dmgTaker[enemyIndex], defence: boostedDefence },
      attackDealer: { ...attackDealer, attack: boostedAttack },
    });

    // Track damage for battle result determination
    if (attackDealer.user) {
      this.battleStateS.addUserDamage(damage);
    } else {
      this.battleStateS.addAiDamage(damage);
    }

    if (dmgTaker[enemyIndex].health) {
      const newHealth = this.effectsS.getHealthAfterDmg(dmgTaker[enemyIndex].health, damage);

      this.store.dispatch(
        GameBoardActions.logEvent({
          config: {
            damage,
            newHealth: null,
            battleMode: this.battleMode,
          },
          isUser: dmgTaker[enemyIndex].user,
          skill: skill,
          unit: dmgTaker[enemyIndex],
        }),
      );

      dmgTaker[enemyIndex] = { ...dmgTaker[enemyIndex], health: newHealth };
    }
  }

  makeHealerMove(
    targetIndex: number | null,
    skill: TileUnitSkill,
    healer: TileUnit,
    units: TileUnit[],
  ) {
    if (skill.heal && skill.heal.healAll) {
      const healedHealth = healer.maxHealth * skill.heal.healM;

      const getNewHealth = (unit: TileUnit) => {
        return unit.health + healedHealth > unit.maxHealth
          ? unit.maxHealth
          : unit.health + healedHealth;
      };

      if (targetIndex) {
        units[targetIndex].health = getNewHealth(units[targetIndex]);
      } else {
        units.forEach(unit => {
          unit.health = getNewHealth(unit);
        });
      }
    }
  }

  dropEnemyState() {
    this.clickedEnemy = null;
    this.ignoreMove = false;
    this.selectedEntity = null;
    this.skillsInAttackBar = [];
    this.showAttackBar = false;
  }

  highlightCellsInnerFunction(path: Position[], className: string): TilesToHighlight[] {
    const tilesToHighlight: TilesToHighlight[] = [];

    path.forEach(point => {
      if (point) {
        tilesToHighlight.push({
          i: point.i,
          j: point.j,
          highlightedClass: className,
        });
      }
    });

    return tilesToHighlight;
  }

  updateGameFieldTile(i: any, j: any, entity: TileUnit | undefined = undefined, active = false) {
    this.gameConfig[i][j] = {
      ...this.gameConfig[i][j],
      entity: entity,
      active: active,
    };
  }

  checkAndShowAttackBar(clickedTile: TileUnit) {
    if (clickedTile.user) {
      return null;
    }

    const enemyClicked = this.possibleMoves.find(
      possibleTile => possibleTile.i === clickedTile.x && possibleTile.j === clickedTile.y,
    );

    return enemyClicked ? clickedTile : null;
  }

  resetState() {
    this.clickedEnemy = null;
    this.selectedEntity = null;
    this.possibleAttackMoves = [];
    this.ignoreMove = false;
    this.skillsInAttackBar = [];
    this.showAttackBar = false;
    this.autoFight = false;
    this.battleStateS.resetBattleState();
    this.store.dispatch(GameBoardActions.dropLog());
  }
}
