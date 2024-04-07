import {Component, Input} from '@angular/core';
import {AbstractFieldService} from "../../../services/abstract/field/abstract-field.service";
import {Effect, GameFieldVars, LogRecord, Position, Skill, Tile, Unit} from "../../../interface";
import {BehaviorSubject} from "rxjs";

export interface GameField {
  gameField: Tile[][];
  gameConfig: any[][];
  possibleMoves: Position[];
}

@Component({
  selector: 'app-abstract-game-field',
  standalone: true,
  imports: [],
  templateUrl: './abstract-game-field.component.html',
  styleUrl: './abstract-game-field.component.scss'
})
export abstract class AbstractGameFieldComponent extends GameFieldVars {
  @Input() userUnits: Unit[] = [];
  @Input() aiUnits: Unit[] = [];
  @Input() battleMode: boolean = true;

  @Input() gameResultsRedirect: () => void = () => {
  };
  log: LogRecord[] = [];
  turnUser = true;
  turnCount: number = 0;
  _turnCount: BehaviorSubject<number> = new BehaviorSubject(1);
  showAttackBar = false;
  skillsInAttackBar: Skill[] = [];

  ignoreMove = false;
  clickedEnemy: Unit | null = null;
  selectedEntity: Unit | null = null;
  possibleAttackMoves: Position[] = [];

  constructor(private abstractFieldService: AbstractFieldService) {
    super();
    this._turnCount.subscribe((newTurn) => {
      this.turnCount = newTurn;
    })
  }

  showPossibleMoves(location: Position, radius: number, diagCheck: boolean = false) {
    return this.abstractFieldService.getFieldsInRadius(this.gameConfig, location, radius, diagCheck)
  }

  abstract addEffectToUnit(units: Unit[], unitIndex: number, skill: Skill, addRangeEffects: boolean): void

  abstract addBuffToUnit(units: Unit[], unitIndex: number, skill: Skill): void

  abstract attack(skill: Skill): void

  dropEnemyState() {
    this.clickedEnemy = null;
    this.ignoreMove = false;
    this.selectedEntity = null;
    this.skillsInAttackBar = [];
    this.showAttackBar = false;
  }

  highlightCellsInnerFunction(path: Position[], className: string) {
    path.forEach((point) => {
      if (point) {
        this.gameConfig[point.i][point.j] = {
          ...this.gameConfig[point.i][point.j],
          highlightedClass: className
        }
      }
    })
  }

  updateGameFieldTile(i: any, j: any, entity: Unit | undefined = undefined, active: boolean = false) {
    this.gameConfig[i][j] = {
      ...this.gameConfig[i][j],
      entity: entity,
      active: active
    }
  }

  checkAndShowAttackBar(clickedTile: Unit) {
    if (clickedTile.user) {
      return null;
    }
    const enemyClicked = this.possibleMoves.find((possibleTile) => possibleTile.i === clickedTile.x && possibleTile.j === clickedTile.y)
    return enemyClicked ? clickedTile : null;
  }

  logEvent(props: {
    damage: number | null,
    newHealth: number | null,
    addDmg?: number
  }, isUser: boolean, skill: Skill | Effect, dmgTaker: Unit, message?: string) {
    const logMsg = (mgs: string) => {
      if(!this.battleMode) {
        mgs = `${!isUser ? 'Player' : 'Bot'} ${dmgTaker.name} (${dmgTaker.x + 1})(${dmgTaker.y + 1}) has been opened/collected!`;
      }
      this.log.push({
        isUser: isUser, imgSrc: skill.imgSrc,
        message: mgs
      })
    }

    if (message) {
      logMsg(message);
    } else {
      if (props.addDmg) {
        logMsg(`${isUser ? 'Player' : 'Bot'} ${dmgTaker.name} received ${props.addDmg}. ! additional DMG from debuff ${(skill as Effect).type}`)
      }
      if (props.damage) {
        logMsg(message || `${!isUser ? 'Player' : 'Bot'} ${dmgTaker.name} (${dmgTaker.x + 1})(${dmgTaker.y + 1}) received ${props.damage}. DMG!`)
      }
      if (props.newHealth === 0 && this.battleMode) {
        logMsg(message || `${!isUser ? 'Player' : 'Bot'} ${dmgTaker.name} (${dmgTaker.x + 1})(${dmgTaker.y + 1}) went to the seven!`)
      }
    }
  }
}
