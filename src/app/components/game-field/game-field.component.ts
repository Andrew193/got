import {Component} from '@angular/core';
import {GameFieldService, Tile, Unit} from "../../services/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";

@Component({
  selector: 'game-field',
  standalone: true,
  imports: [CommonModule, OutsideClickDirective],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss'
})
export class GameFieldComponent {
  gameConfig;
  turnUser = true;
  showAttackBar = false;
  ignoreMove = false;
  clickedEnemy: Unit | null = null;
  selectedEntity: Unit | null = null;
  userUnits: Unit[] = [{x: 3, y: 5, user: true, imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png"}]
  aiUnits: Unit[] = [{x: 3, y: 8, user: false, imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png"}]
  possibleMoves: { i: number, j: number }[] = [];

  constructor(private fieldService: GameFieldService) {
    this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
  }

  attack() {
    this.unhighlightCells();
    this.clickedEnemy = null;
    this.ignoreMove = false;
    this.selectedEntity = null;
  }

  highlightMakeMove(entity: Unit) {
    if (!(entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity.y)) {
      this.clickedEnemy = this.checkAndShowAttackBar(entity);
      this.showAttackBar = !!this.clickedEnemy;

      if (!this.showAttackBar) {
        this.ignoreMove = false;
        this.selectedEntity = entity;
        this.possibleMoves = this.showPossibleMoves({i: entity.x, j: entity.y}, 2)
        this.highlightCells(this.possibleMoves, entity.user ? "green-b" : "red-b")
      }
    } else {
      this.ignoreMove = true;
    }
  }

  checkAndShowAttackBar(clickedTile: Unit) {
    const enemyClicked = this.possibleMoves.find((possibleTile) => {
      return possibleTile.i === clickedTile.x && possibleTile.j === clickedTile.y
    })
    return enemyClicked ? clickedTile : null;
  }

  moveEntity(tile: Tile) {
    this.ignoreMove = (this.selectedEntity?.x === tile.x && this.selectedEntity.y === tile.y) || this.showAttackBar;
    if (this.selectedEntity?.user && this.possibleMoves.length && !this.ignoreMove) {
      debugger
      this.gameConfig[tile.x][tile.y] = {
        ...this.gameConfig[tile.x][tile.y],
        entity: {...this.selectedEntity, x: tile.x, y: tile.y}
      }
      this.gameConfig[this.selectedEntity?.x][this.selectedEntity?.y] = {
        ...this.gameConfig[this.selectedEntity.x][this.selectedEntity.y],
        entity: null
      }
      this.unhighlightCells();
      this.selectedEntity = null;
    }
  }

  highlightCells(path: { i: number, j: number }[], className: string) {
    this.unhighlightCells();
    path.forEach((point) => {
      this.gameConfig[point.i][point.j] = {...this.gameConfig[point.i][point.j], highlightedClass: className}
    })
    this.possibleMoves = path;
    debugger
  }

  unhighlightCells() {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 10; j++) {
        this.gameConfig[i][j] = {...this.gameConfig[i][j], highlightedClass: ""}
      }
    }
    this.possibleMoves = [];
  }

  showPossibleMoves(location: { i: number, j: number }, radius: number) {
    return this.fieldService.getFieldsInRadius(this.gameConfig, location, radius)
  }

  example() {
    const grid = this.fieldService.getGridFromField(this.gameConfig)

    const start = {i: 0, j: 0};
    const end = {i: 7, j: 6};

    const path = this.fieldService.shortestPath(grid, start, end, true);
    console.log('Shortest path with diagonals:', path);
    path.forEach((point: { i: number, j: number }) => {
      debugger
      const element = document.body.querySelector(`.data-i-${point.i}.data-j-${point.j}`)
      console.log(element, point)

      if (element) {
        element.classList.add('red-b')
        element.innerHTML = "fffffffffffffff"
      }
    })
  }
}
