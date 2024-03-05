import {Component, TemplateRef, ViewChild} from '@angular/core';
import {GameFieldService, Tile, Unit} from "../../services/game/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {PopoverModule} from "ngx-bootstrap/popover";
import {Position} from "../../interface";
import {HeroesService} from "../../services/heroes/heroes.service";
import {TabsModule} from "ngx-bootstrap/tabs";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {createDeepCopy} from "../../helpers";
import {TooltipModule} from "ngx-bootstrap/tooltip";

@Component({
  selector: 'game-field',
  standalone: true,
  imports: [CommonModule, OutsideClickDirective, PopoverModule, TabsModule, ProgressbarModule, AccordionModule, TooltipModule],
  providers: [BsModalService],
  templateUrl: './game-field.component.html',
  styleUrl: './game-field.component.scss'
})
export class GameFieldComponent {
  modalRef?: BsModalRef;
  log: string[] = [];
  userSample: Unit;
  gameConfig;
  turnUser = true;
  turnCount = 1;
  showAttackBar = false;
  ignoreMove = false;
  clickedEnemy: Unit | null = null;
  selectedEntity: Unit | null = null;
  userUnits: Unit[] = [];
  aiUnits: Unit[] = [{
    x: 3,
    y: 8,
    user: false,
    imgSrc: "../../../assets/resourses/imgs/heroes/lds/UI_Avatar.png",
    canMove: false,
    canCross: 2,
    canAttack: false,
    attackRange: 1,
    health: 10000,
    maxHealth: 10000,
    name: "test",
    attack: 1529,
    defence: 1185,
  }]
  possibleMoves: Position[] = [];
  gameResult = {
    headerMessage: "",
    headerClass: "",
    closeBtnLabel: ""
  }
  @ViewChild("template") modalTemplate: any;

  constructor(private fieldService: GameFieldService,
              private heroService: HeroesService,
              private modalService: BsModalService) {
    this.userSample = this.heroService.getLadyOfDragonStone()
    this.userUnits = [this.userSample, {...this.userSample, x: 1}];
    this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
  }

  openModal(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template, {ignoreBackdropClick: true, class: 'modal-lg'});
  }

  checkCloseFight() {
    const allUserUnitsDead = this.userUnits.every((userUnit) => !userUnit.health);
    const allAiUnitsDead = this.aiUnits.every((aiUnit) => !aiUnit.health);
    if (allUserUnitsDead || allAiUnitsDead) {
      this.gameResult = {
        headerClass: allUserUnitsDead ? "red-b" : "green-b",
        headerMessage: allUserUnitsDead ? "Вы проиграли" : "Вы победили",
        closeBtnLabel: allUserUnitsDead ? "Попробовать позже" : "Отлично"
      }
      this.openModal(this.modalTemplate)
    }

  }

  attack() {
    const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.clickedEnemy);
    const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.selectedEntity);
    //ATTACK HERE
    this.makeAttackMove(enemyIndex, this.userUnits[userIndex].attack, this.aiUnits[enemyIndex].defence, this.aiUnits, true)

    // const damage = this.fieldService.getDamage(this.userUnits[userIndex].attack, this.aiUnits[enemyIndex].defence);
    // let newHealth = this.aiUnits[enemyIndex].health - damage;
    // this.log.push(`Бот ${this.aiUnits[enemyIndex].name} (${this.aiUnits[enemyIndex].x})(${this.aiUnits[enemyIndex].y}) получил ${damage} ед. урона!`)
    // newHealth = newHealth >= 0 ? newHealth : 0;
    // this.aiUnits[enemyIndex] = {...this.aiUnits[enemyIndex], health: newHealth >= 0 ? newHealth : 0};
    // if(!newHealth) {
    //   this.log.push(`Бот ${this.aiUnits[enemyIndex].name} (${this.aiUnits[enemyIndex].x})(${this.aiUnits[enemyIndex].y}) отправился к семерым!`)
    // }
    this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false, canMove: false};

    this.updateGridUnits(this.aiUnits);
    this.updateGridUnits(this.userUnits);
    this.dropEnemy();
    this.checkAiMoves();
  }

  updateGridUnits(unitsArray: Unit[]) {
    unitsArray.forEach((unit) => {
      this.gameConfig[unit.x][unit.y] = {...this.gameConfig[unit.x][unit.y], entity: unit}
    })
  }

  dropEnemy() {
    this.unhighlightCells.bind(this)();
    this.clickedEnemy = null;
    this.ignoreMove = false;
    this.selectedEntity = null;
    this.showAttackBar = false;
  }

  highlightMakeMove(entity: Unit, event?: MouseEvent) {
    if (this.showAttackBar) {
      this.dropEnemy();
    }
    event?.stopPropagation();
    if (!(entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity.y) && (entity?.canMove || entity?.canAttack || entity.user === false)) {
      let possibleTargetsInAttackRadius;
      if (this.selectedEntity) {
        possibleTargetsInAttackRadius = this.showPossibleMoves(this.fieldService.getPositionFromUnit(this.selectedEntity), this.selectedEntity.attackRange, true)
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
          let enemyWhenCannotMove: any[] = this.possibleMoves.filter((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
          if (enemyWhenCannotMove.length) {
            const enemyIndexList = [];
            for (let i = 0; i < enemyWhenCannotMove.length; i++) {
              const enemy = enemyWhenCannotMove[i]
              const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, {x: enemy?.i, y: enemy?.j});
              enemyIndexList.push(enemyIndex);
            }

            enemyWhenCannotMove = enemyIndexList.map((enemyIndex) => {
              return this.aiUnits[enemyIndex].health ? this.fieldService.getPositionFromUnit(this.aiUnits[enemyIndex]) : undefined
            })
          }
          if (enemyWhenCannotMove.length) {
            this.possibleMoves = [...enemyWhenCannotMove]
          } else {
            this.possibleMoves = [];
            this.userUnits[this.fieldService.findUnitIndex(this.userUnits, this.selectedEntity)] = {
              ...this.selectedEntity,
              x: entity.x,
              y: entity.y,
              canMove: false,
              canAttack: false
            };
            this.updateGridUnits(this.userUnits);
          }
        }

        this.highlightCells.bind(this)(this.possibleMoves, entity.user ? "green-b" : "red-b")
      }
    } else {
      this.ignoreMove = true;
      this.selectedEntity = null;
      this.unhighlightCells.bind(this)();
      this.possibleMoves = [];
    }
  }

  getPossibleMoves(entity: Unit) {
    return this.showPossibleMoves(this.fieldService.getPositionFromUnit(entity), entity?.canMove ? entity.canCross : 1, !entity?.canMove);
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
      const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.selectedEntity);
      this.userUnits[userIndex] = {...this.selectedEntity, x: tile.x, y: tile.y, canMove: false};

      const possibleMoves = this.getPossibleMoves(this.userUnits[userIndex])
      let enemyWhenCannotMove = possibleMoves.find((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
      if (enemyWhenCannotMove) {
        const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, {
          x: enemyWhenCannotMove?.i,
          y: enemyWhenCannotMove?.j
        });
        enemyWhenCannotMove = this.aiUnits[enemyIndex].health ? enemyWhenCannotMove : undefined;
      }
      if (!enemyWhenCannotMove) {
        this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false}
      }

      this.updateGameFieldTile(tile.x, tile.y, createDeepCopy(this.userUnits[userIndex]))
      this.updateGameFieldTile(this.selectedEntity?.x, this.selectedEntity?.y, undefined, true)
      this.unhighlightCells.bind(this)();
      this.selectedEntity = null;
    }
    this.checkAiMoves()
  }

  updateGameFieldTile(i: any, j: any, entity: Unit | undefined = undefined, active: boolean = false) {
    this.gameConfig[i][j] = {
      ...this.gameConfig[i][j],
      entity: entity,
      active: active
    }
  }

  showPossibleMoves(location: Position, radius: number, diagCheck: boolean = false) {
    return this.fieldService.getFieldsInRadius(this.gameConfig, location, radius, diagCheck)
  }

  checkAiMoves() {
    const userFinishedTurn = this.userUnits.every((userHero) => (!userHero.canMove && !userHero.canAttack) || !userHero.health);
    if (userFinishedTurn) {
      this.dropEnemy();
      this.turnUser = false;
      this.attackUser();
    }
  }

  attackUser() {
    this.turnCount++;
    this.checkCloseFight();

    const makeAiMove = (aiUnit: Unit, index: number) => {
      //Unit makes a move only if this unit is not dead
      if (aiUnit.health && aiUnit.canMove) {
        //Start with the closets user unit
        const closestUserUnits = this.fieldService.orderUnitsByDistance(aiUnit, this.userUnits);
        //Try to get to the closest user unit to attack it or if this unit is not reachable check the next one
        for (let i = 0; i < closestUserUnits.length; i++) {
          const userUnit = closestUserUnits[i] as Unit;
          if (userUnit.health) {

            const aiPosition = this.fieldService.getPositionFromUnit(aiUnit);
            const userUnitPosition = this.fieldService.getPositionFromUnit(userUnit as Unit);

            const shortestPathToUserUnit = this.fieldService.getShortestPathCover(this.fieldService.getGridFromField(this.gameConfig), aiPosition, userUnitPosition, true, false, true)

            let canGetToUnit = shortestPathToUserUnit.length > aiUnit.canCross - 1 ? shortestPathToUserUnit[aiUnit.canCross - 1] : shortestPathToUserUnit[shortestPathToUserUnit.length - 1];
            if (userUnitPosition && !shortestPathToUserUnit.length) {
              canGetToUnit = this.fieldService.getPositionFromUnit(aiUnit);
            }
            //Move ai unit
            this.aiUnits[index] = {...this.aiUnits[index], canMove: false, x: canGetToUnit.i, y: canGetToUnit.j}
            //Check if ai unit can attack
            const possibleMoves = this.getPossibleMoves(this.aiUnits[index])
            const enemyWhenCannotMove = possibleMoves.find((move) => this.userUnits.some((userUnit) => userUnit.x === move.i && userUnit.y === move.j));
            if (enemyWhenCannotMove) {
              const userIndex = this.fieldService.findUnitIndex(this.userUnits, {
                x: enemyWhenCannotMove.i,
                y: enemyWhenCannotMove.j
              });
              this.makeAttackMove(userIndex, aiUnit.attack, this.userUnits[userIndex].defence, this.userUnits, false)
              // const damage = this.fieldService.getDamage(aiUnit.attack, this.userUnits[userIndex].defence);
              // let newHealth = this.userUnits[userIndex].health - damage;
              // this.log.push(`Игрок ${this.userUnits[userIndex].name} (${this.userUnits[userIndex].x})(${this.userUnits[userIndex].y}) получил ${damage} ед. урона!`)
              // newHealth = newHealth >= 0 ? newHealth : 0;
              // this.userUnits[userIndex] = {...this.userUnits[userIndex], health: newHealth};
              // if(!newHealth) {
              //   this.log.push(`Игрок ${this.userUnits[userIndex].name} (${this.userUnits[userIndex].x})(${this.userUnits[userIndex].y}) отправился к семерым!`)
              // }
              this.aiUnits[index] = {...this.aiUnits[index], canAttack: false};
              this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
              return;
            } else {
              this.aiUnits[index] = {...this.aiUnits[index], canAttack: false};
            }
          }
        }
      }
    }

    let index = 0;
    //Each ai unit makes a move
    const interval = setInterval(() => {
      if (index === this.aiUnits.length) {
        clearInterval(interval);
        this.aiUnits.forEach((aiUnit, index) => this.aiUnits[index] = {...aiUnit, canMove: true, canAttack: true})
        this.userUnits.forEach((userUnit, index) => this.userUnits[index] = {
          ...userUnit,
          canMove: true,
          canAttack: true
        })
        this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
        this.turnUser = true;
      } else {
        const aiUnit = this.aiUnits[index];
        makeAiMove(aiUnit, index)
        index++;
      }
    }, 500)
  }

  highlightCells(path: Position[], className: string) {
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

  makeAttackMove(enemyIndex: number, attack: number, defence: number, dmgTaker: Unit[], isUser: boolean) {
    const damage = this.fieldService.getDamage(attack, defence);
    let newHealth = dmgTaker[enemyIndex].health - damage;
    this.log.push(`${!isUser ? 'Игрок' : 'Бот'} ${dmgTaker[enemyIndex].name} (${dmgTaker[enemyIndex].x})(${dmgTaker[enemyIndex].y}) получил ${damage} ед. урона!`)
    newHealth = newHealth >= 0 ? newHealth : 0;
    dmgTaker[enemyIndex] = {...dmgTaker[enemyIndex], health: newHealth >= 0 ? newHealth : 0};
    if (!newHealth) {
      this.log.push(`${!isUser ? 'Игрок' : 'Бот'} ${dmgTaker[enemyIndex].name} (${dmgTaker[enemyIndex].x})(${dmgTaker[enemyIndex].y}) отправился к семерым!`)
    }
  }
}
