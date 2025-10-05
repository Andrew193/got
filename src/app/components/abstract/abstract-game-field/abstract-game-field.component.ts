import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractFieldService } from '../../../services/abstract/field/abstract-field.service';
import { BehaviorSubject } from 'rxjs';
import { Skill, TileUnitSkill } from '../../../models/skill.model';
import { GameLoggerService } from '../../../services/game-logger/logger.service';
import { UnitService } from '../../../services/unit/unit.service';
import { EffectsService } from '../../../services/effects/effects.service';
import {
  GameFieldVars,
  Position,
  Tile,
  TilesToHighlight,
  TileUnit,
} from '../../../models/field.model';
import { LogRecord } from '../../../models/logger.model';

export interface GameField {
  gameField: Tile[][];
  gameConfig: any[][];
  possibleMoves: Position[];
}

type TopBarUnitConfig = Pick<TileUnit, 'inBattle' | 'imgSrc' | 'health' | 'name' | 'user'>;

@Component({
  selector: 'app-abstract-game-field',
  imports: [],
  template: '',
  styleUrl: './abstract-game-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractGameFieldComponent
  extends GameFieldVars
  implements OnInit, OnDestroy
{
  @Input() userUnits: TileUnit[] = [];
  @Input() aiUnits: TileUnit[] = [];
  @Input() battleMode = true;
  @Input() gameResultsRedirect: (realAiUnits: TileUnit[]) => void = () => {};

  autoFight = false;
  usersTopBarConfig: { units: TopBarUnitConfig[] } = { units: [] };
  aiTopBarConfig: { units: TopBarUnitConfig[] } = { units: [] };

  log: LogRecord[] = [];
  turnUser = true;
  turnCount = 0;
  maxTurnCount = 20;
  _turnCount: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  showAttackBar = false;
  skillsInAttackBar: TileUnitSkill[] = [];

  ignoreMove = false;
  clickedEnemy: TileUnit | null = null;
  selectedEntity: TileUnit | null = null;
  possibleAttackMoves: Position[] = [];

  constructor(
    private abstractFieldS: AbstractFieldService,
    private gameLoggerS: GameLoggerService,
    private unitS: UnitService,
    private effectsS: EffectsService,
  ) {
    super();
    this._turnCount.subscribe(newTurn => {
      this.turnCount = newTurn;
    });
  }

  recreateGameConfig(newUserUnit: TileUnit[], newAiUnit: TileUnit[]) {
    this.ngOnDestroy();

    if (newUserUnit) {
      this.userUnits = [...newUserUnit];
    }

    if (newAiUnit) {
      this.aiUnits = [...newAiUnit];
    }

    this.gameConfig = this.abstractFieldS.populateGameFieldWithUnits(this.userUnits, this.aiUnits);
    //Init top bar
    this.createTopBar();
  }

  shouldRenderAction(hero: TileUnit, type: 'canMove' | 'canAttack') {
    return this.battleMode && (hero.inBattle || hero.inBattle === undefined)
      ? this.battleMode
      : hero.user
        ? hero[type] && hero.health
        : hero.user;
  }

  createTopBar() {
    const convert = (el: TileUnit) => ({
      imgSrc: el.imgSrc,
      inBattle: el.inBattle,
      name: el.name,
      health: el.health,
      user: el.user,
    });

    this.usersTopBarConfig = { units: this.userUnits.map(convert) };
    this.aiTopBarConfig = { units: this.aiUnits.map(convert) };
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

  abstract checkDebuffs(
    unit: TileUnit,
    decreaseRestoreCooldown: boolean,
    canRestoreHealth: boolean,
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
        skill.attackRange as number,
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

        this.makeAttackMove(
          enemyIndex,
          this.effectsS.getBoostedParameterCover(attacker, attacker.effects) *
            (skill.attackInRangeM || 0),
          this.effectsS.getBoostedParameterCover(
            enemiesArray[enemyIndex],
            enemiesArray[enemyIndex].effects,
          ),
          enemiesArray,
          attacker,
          skill,
        );

        if (attacker.rage > enemiesArray[enemyIndex].willpower) {
          this.addEffectToUnit(enemiesArray, enemyIndex, skill, !!skill.inRangeDebuffs);
        }
      }
    }
  }

  makeAttackMove(
    enemyIndex: number,
    attack: number,
    defence: number,
    dmgTaker: TileUnit[],
    attackDealer: TileUnit,
    skill: TileUnitSkill,
  ) {
    const damage = this.abstractFieldS.getDamage(
      { dmgTaker: dmgTaker[enemyIndex], attackDealer },
      { attack },
    );

    if (dmgTaker[enemyIndex].health) {
      const newHealth = this.effectsS.getHealthAfterDmg(dmgTaker[enemyIndex].health, damage);

      this.log.push(
        this.gameLoggerS.logEvent(
          {
            damage,
            newHealth: null,
            battleMode: this.battleMode,
          },
          dmgTaker[enemyIndex].user,
          skill,
          dmgTaker[enemyIndex],
        ),
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
    const healedHealth = healer.maxHealth * (skill.healM as number);

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

  ngOnInit(): void {
    this.gameConfig = this.abstractFieldS.populateGameFieldWithUnits(this.userUnits, this.aiUnits);
  }

  ngOnDestroy() {
    this.log = [];
    this.turnUser = true;
    this.turnCount = 0;
    this.clickedEnemy = null;
    this.selectedEntity = null;
    this.possibleAttackMoves = [];
    this.ignoreMove = false;
    this.skillsInAttackBar = [];
    this.showAttackBar = false;
    this._turnCount.next(1);
    this.autoFight = false;
  }
}
