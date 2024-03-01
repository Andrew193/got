import {Component} from '@angular/core';
import {GameFieldService, Tile, Unit} from "../../services/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {PopoverModule} from "ngx-bootstrap/popover";


function createDeepCopy(object: { [key: string]: any }) {
  return JSON.parse(JSON.stringify(object))
}

@Component({
  selector: 'game-field',
  standalone: true,
  imports: [CommonModule, OutsideClickDirective, PopoverModule],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss'
})
export class GameFieldComponent {
  userSample: Unit = {
    x: 3, y: 6, user: true, imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png",
    canMove: true, canCross: 2, canAttack: true, attackRange: 1, health: 10000
  }
  gameConfig;
  turnUser = true;
  turnCount = 1;
  showAttackBar = false;
  ignoreMove = false;
  clickedEnemy: Unit | null = null;
  selectedEntity: Unit | null = null;
  userUnits: Unit[] = [this.userSample, {...this.userSample, y:0}]
  aiUnits: Unit[] = [{
    x: 3,
    y: 8,
    user: false,
    imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png",
    canMove: true,
    canCross: 2,
    canAttack: true,
    attackRange: 1,
    health: 10000
  }]
  possibleMoves: { i: number, j: number }[] = [];

  constructor(private fieldService: GameFieldService) {
    this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
  }

  findUnitIndex(units: Unit[], unit: Unit | null) {
    return units.findIndex((enemy) => enemy.x === unit?.x && enemy.y === unit?.y)
  }

  attack() {
    const enemyIndex = this.findUnitIndex(this.aiUnits, this.clickedEnemy);
    const userIndex = this.findUnitIndex(this.userUnits, this.selectedEntity);
    const newHealth = this.aiUnits[enemyIndex].health - 3000;
    this.aiUnits[enemyIndex] = {...this.aiUnits[enemyIndex], health: newHealth >= 0 ? newHealth : 0};
    this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false};

    this.updateGridUnits(this.aiUnits);
    this.updateGridUnits(this.userUnits);
    this.dropEnemy();
  }

  updateGridUnits(unitsArray: Unit[]) {
    unitsArray.forEach((unit) => {
      this.gameConfig[unit.x][unit.y] = {...this.gameConfig[unit.x][unit.y], entity: unit}
    })
  }

  dropEnemy() {
    this.unhighlightCells();
    this.clickedEnemy = null;
    this.ignoreMove = false;
    this.selectedEntity = null;
    this.showAttackBar = false;
    this.turnCount++;
  }

  highlightMakeMove(entity: Unit, event?: MouseEvent) {
    if (this.showAttackBar) {
      this.dropEnemy();
    }
    event?.stopPropagation();
    if (!(entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity.y) && (entity?.canMove || entity?.canAttack)) {
      let possibleTargetsInAttackRadius;
      if (this.selectedEntity) {
        possibleTargetsInAttackRadius = this.showPossibleMoves({
          i: this.selectedEntity.x,
          j: this.selectedEntity.y
        }, this.selectedEntity.attackRange, true)
      }

      this.clickedEnemy = this.checkAndShowAttackBar(entity);
      if (possibleTargetsInAttackRadius) {
        const canAttackThisTargetFromRange = possibleTargetsInAttackRadius.find((possibleTarget) => possibleTarget.i === this.clickedEnemy?.x && possibleTarget.j === this.clickedEnemy?.y)
        this.clickedEnemy = canAttackThisTargetFromRange ? this.clickedEnemy : null;
      }
      this.showAttackBar = !!this.clickedEnemy;

      if (!this.showAttackBar) {
        this.ignoreMove = false;
        this.selectedEntity = entity;
        this.possibleMoves = this.getPossibleMoves(entity);
        if (entity?.canMove === false) {
          const enemyWhenCannotMove = this.possibleMoves.find((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
          if (enemyWhenCannotMove) {
            this.possibleMoves = [enemyWhenCannotMove]
          } else {
            this.possibleMoves = [];
            const userIndex =  this.findUnitIndex(this.userUnits, this.selectedEntity);
            this.userUnits[userIndex] = {...this.selectedEntity, x: entity.x, y: entity.y, canMove: false, canAttack: false};
            this.updateGridUnits(this.userUnits);
          }
        }

        this.highlightCells(this.possibleMoves, entity.user ? "green-b" : "red-b")
      }
    } else {
      this.ignoreMove = true;
    }
  }

  getPossibleMoves(entity: Unit) {
    return this.showPossibleMoves({
      i: entity.x,
      j: entity.y
    }, entity?.canMove ? entity.canCross : 1, !entity?.canMove);
  }

  checkAndShowAttackBar(clickedTile: Unit) {
    if (clickedTile.user) {
      return null;
    }
    const enemyClicked = this.possibleMoves.find((possibleTile) => possibleTile.i === clickedTile.x && possibleTile.j === clickedTile.y)
    return enemyClicked ? clickedTile : null;
  }

  moveEntity(tile: Tile) {
    this.ignoreMove = (this.selectedEntity?.x === tile.x && this.selectedEntity.y === tile.y) || this.showAttackBar || tile.entity !== undefined
    if (this.selectedEntity?.user && this.possibleMoves.length && !this.ignoreMove && !!this.possibleMoves.find((move) => move.i === tile.x && move.j === tile.y)) {
      const userIndex = this.findUnitIndex(this.userUnits, this.selectedEntity);
      this.userUnits[userIndex] = {...this.selectedEntity, x: tile.x, y: tile.y, canMove: false};
      const possibleMoves = this.getPossibleMoves(this.userUnits[userIndex])
      const enemyWhenCannotMove = possibleMoves.find((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
      if (!enemyWhenCannotMove) {
        this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false}
      }
      this.gameConfig[tile.x][tile.y] = {
        ...this.gameConfig[tile.x][tile.y],
        entity: createDeepCopy(this.userUnits[userIndex]),
        active: false
      }
      this.gameConfig[this.selectedEntity?.x][this.selectedEntity?.y] = {
        ...this.gameConfig[this.selectedEntity.x][this.selectedEntity.y],
        entity: undefined,
        active: true
      }
      this.unhighlightCells();
      this.selectedEntity = null;
      this.checkAiMoves()
    }

  }

  highlightCells(path: { i: number, j: number }[], className: string) {
    this.unhighlightCells();
    path.forEach((point) => {
      this.gameConfig[point.i][point.j] = {...this.gameConfig[point.i][point.j], highlightedClass: className}
    })
    this.possibleMoves = path;
  }

  unhighlightCells() {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 10; j++) {
        this.gameConfig[i][j] = {...this.gameConfig[i][j], highlightedClass: ""}
      }
    }
    this.possibleMoves = [];
  }

  showPossibleMoves(location: { i: number, j: number }, radius: number, diagCheck: boolean = false) {
    return this.fieldService.getFieldsInRadius(this.gameConfig, location, radius, diagCheck)
  }

  checkAiMoves() {
    const userFinishedTurn = this.userUnits.every((userHero) => !userHero.canMove && !userHero.canAttack);
    if(userFinishedTurn) {
      this.dropEnemy();
    }
    console.log(userFinishedTurn)
  }

  orderUnitsByDistance(start: { x: number, y: number }, positions: { x: number, y: number }[]) {
    return positions.sort((a, b) => {
      const distanceA = Math.abs(a.x - start.x) + Math.abs(a.y - start.y);
      const distanceB = Math.abs(b.x - start.x) + Math.abs(b.y - start.y);
      return distanceA - distanceB;
    });
  }
}
