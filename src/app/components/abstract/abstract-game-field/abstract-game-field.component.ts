import {Component} from '@angular/core';
import {AbstractFieldService} from "../../../services/abstract/field/abstract-field.service";
import {GameFieldVars, LogRecord, Position, Skill, Tile, Unit} from "../../../interface";
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
  abstract userUnits: Unit[];
  abstract aiUnits: Unit[];
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
  }

  showPossibleMoves(location: Position, radius: number, diagCheck: boolean = false) {
    return this.abstractFieldService.getFieldsInRadius(this.gameConfig, location, radius, diagCheck)
  }
}
