import {Component, TemplateRef, ViewChild} from '@angular/core';
import {Effect, GameFieldService, Skill, Tile, Unit} from "../../services/game/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {PopoverModule} from "ngx-bootstrap/popover";
import {LogRecord, Position} from "../../interface";
import {HeroesService} from "../../services/heroes/heroes.service";
import {TabsModule} from "ngx-bootstrap/tabs";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {createDeepCopy} from "../../helpers";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {BehaviorSubject} from "rxjs";

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
  log: LogRecord[] = [];
  userSample: Unit;
  gameConfig;
  turnUser = true;
  _turnCount: BehaviorSubject<number> = new BehaviorSubject(1);
  turnCount: number = 0;
  showAttackBar = false;
  skillsInAttackBar: Skill[] = [];

  ignoreMove = false;
  clickedEnemy: Unit | null = null;
  selectedEntity: Unit | null = null;
  userUnits: Unit[] = [];
  aiUnits: Unit[] = [];
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
    this.userUnits = [this.userSample];
    this.aiUnits = [{
      ...this.userSample, x: 3,
      y: 9,
      user: false
    }]
    this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
    this._turnCount.subscribe((newTurn) => {
      this.turnCount = newTurn;
    })
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

  attack(skill: Skill) {
    this.selectSkillsAndRecountCooldown(this.userUnits, this.selectedEntity as Unit)

    const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.clickedEnemy);
    const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.selectedEntity);
    const skillIndex = this.fieldService.findSkillIndex(this.userUnits[userIndex].skills, skill);

    this.makeAttackMove(enemyIndex, this.userUnits[userIndex].attack * skill.dmgM, this.aiUnits[enemyIndex].defence, this.aiUnits, true, skill)
    if (skill.attackInRange) {
      const tilesInRange = this.fieldService.getFieldsInRadius(this.gameConfig, this.fieldService.getPositionFromUnit(this.clickedEnemy as Unit), skill.attackRange as number, true)
      const enemiesInRange: Unit[] = tilesInRange.map((tile) => {
        return this.aiUnits.find((unit) => unit.x === tile.i && unit.y === tile.j && !unit.user)
      }).filter((e) => !!e) as Unit[];

      for (let i = 0; i < enemiesInRange.length; i++) {
        const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, enemiesInRange[i]);
        this.makeAttackMove(enemyIndex, this.userUnits[userIndex].attack * (skill.attackInRangeM || 0), this.aiUnits[enemyIndex].defence, this.aiUnits, true, skill)
        this.addEffectToUnit(this.aiUnits, enemyIndex, skill);
      }
    }
    const skills = this.updateSkillsCooldown(createDeepCopy(this.userUnits[userIndex].skills), this.aiUnits, enemyIndex, skillIndex, skill)
    this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false, canMove: false, skills: skills};

    this.updateGridUnits(this.aiUnits);
    this.updateGridUnits(this.userUnits);
    this.dropEnemy();
    this.checkAiMoves();
  }

  updateSkillsCooldown(originalSkills: Skill[], units: Unit[], unitIndex: number, skillIndex: number, skill: Skill, addTurn = false) {
    const skills = createDeepCopy(originalSkills);
    this.addEffectToUnit(units, unitIndex, skill);
    skills[skillIndex] = {
      ...skills[skillIndex],
      remainingCooldown: skills[skillIndex].cooldown ? addTurn ? skills[skillIndex].cooldown + 1 : skills[skillIndex].cooldown : 0
    }
    return skills;
  }

  addEffectToUnit(units: Unit[], unitIndex: number, skill: Skill) {
    units[unitIndex] = {
      ...units[unitIndex],
      effects: this.heroService.getEffectsWithIgnoreFilter(units[unitIndex], skill)
    }
  }

  updateGridUnits(unitsArray: Unit[]) {
    unitsArray.forEach((unit) => {
      this.gameConfig[unit.x][unit.y] = {...this.gameConfig[unit.x][unit.y], entity: unit}
    })
  }

  dropEnemy() {
    this.fieldService.unhighlightCells.bind(this)();
    this.clickedEnemy = null;
    this.ignoreMove = false;
    this.selectedEntity = null;
    this.skillsInAttackBar = [];
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
              const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.fieldService.getCoordinateFromPosition(enemy));
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

      if (this.showAttackBar) {
        this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
      }
    } else {
      this.ignoreMove = true;
      this.selectedEntity = null;
      this.fieldService.unhighlightCells.bind(this)();
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
        const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.fieldService.getCoordinateFromPosition(enemyWhenCannotMove));
        enemyWhenCannotMove = this.aiUnits[enemyIndex].health ? enemyWhenCannotMove : undefined;
      }
      if (!enemyWhenCannotMove) {
        this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false}
      }

      this.updateGameFieldTile(tile.x, tile.y, createDeepCopy(this.userUnits[userIndex]))
      this.updateGameFieldTile(this.selectedEntity?.x, this.selectedEntity?.y, undefined, true)
      this.fieldService.unhighlightCells.bind(this)();
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
    this._turnCount.next(this.turnCount + 1);
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
            //Move AI unit
            this.aiUnits[index] = {...this.aiUnits[index], canMove: false, x: canGetToUnit.i, y: canGetToUnit.j}
            //Check if AI unit can attack
            const possibleMoves = this.getPossibleMoves(this.aiUnits[index])
            const enemyWhenCannotMove = possibleMoves.find((move) => this.userUnits.some((userUnit) => userUnit.x === move.i && userUnit.y === move.j));
            if (enemyWhenCannotMove) {
              const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.fieldService.getCoordinateFromPosition(enemyWhenCannotMove));
              const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);
              const aiSkillIndex = this.fieldService.findSkillIndex(aiUnit.skills, aiSkill);

              this.makeAttackMove(userIndex, aiUnit.attack * aiSkill.dmgM, this.userUnits[userIndex].defence, this.userUnits, false, aiSkill)
              const skills = this.updateSkillsCooldown(createDeepCopy(this.aiUnits[index].skills), this.userUnits, userIndex, aiSkillIndex, aiSkill, true)
              this.aiUnits[index] = {...this.aiUnits[index], canAttack: false, skills: skills};
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
    this.checkRestorePassiveSkills(this.aiUnits);

    //Each AI unit makes a move
    const interval = setInterval(() => {
      if (index === this.aiUnits.length) {
        clearInterval(interval);
        this.fieldService.resetMoveAndAttack(this.aiUnits);
        this.fieldService.resetMoveAndAttack(this.userUnits);
        for (let i = 0; i < this.userUnits.length; i++) {
          this.checkDebuffs(this.userUnits[i], this.userUnits, i);
        }
        this.checkRestorePassiveSkills(this.userUnits)
        this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
        this.turnUser = true;
        this.checkCloseFight();
      } else {
        const aiUnit = this.aiUnits[index];
        this.checkDebuffs(aiUnit, this.aiUnits, index);
        makeAiMove(aiUnit, index);
        this.showAttackBar = false;
        this.selectSkillsAndRecountCooldown(this.aiUnits, this.aiUnits[index]);
        this.skillsInAttackBar = [];

        index++;
      }
    }, 500)
  }

  checkDebuffs(unit: Unit, units: Unit[], index: number) {
    unit.effects.forEach((debuff: Effect, i, array) => {
      if (debuff.duration > 0) {
        array[i] = {...debuff, duration: debuff.duration - 1}
        const additionalDmg = this.fieldService.getReducedDmg(unit, this.heroService.getDebuffDmg(debuff.type, unit.health, debuff.m));
          additionalDmg && this.log.push({
          isUser: !unit.user, imgSrc: debuff.imgSrc,
          message: `${unit.user ? 'Игрок' : 'Бот'} ${unit.name} получил ${additionalDmg} ед. ! дополнительного урона от штрафа ${debuff.type}`
        })
        unit.health = this.heroService.getHealthAfterDmg(unit.health, additionalDmg)
        units[index] = unit;
      }
    })
    unit.effects = unit.effects.filter((debuff) => !!debuff.duration);
  }

  checkRestorePassiveSkills(units: Unit[]) {
    for (let index = 0; index < units.length; index++) {
      const unit = units[index];
      if (unit.health) {
        unit.skills.forEach((skill) => {
          if (skill.passive && skill.restoreSkill) {
            const buffs = skill.buffs || [];
            for (let i = 0; i < buffs.length; i++) {
              const restoredHealth = this.heroService.getRestoredHealth(unit.maxHealth, buffs[i].m);
              this.log.push({
                info: true, imgSrc: skill.imgSrc,
                message: `${unit.user ? 'Игрок' : 'Бот'} ${unit.name} восстановил ${restoredHealth} ед. !`
              })
              unit.health = this.heroService.getHealthAfterRestore(unit.health + restoredHealth, unit.maxHealth)
              units[index] = unit;
            }
          }
        })
      }
    }
  }

  highlightCells(path: Position[], className: string) {
    this.fieldService.unhighlightCells.bind(this)();
    path.forEach((point) => this.gameConfig[point.i][point.j] = {
      ...this.gameConfig[point.i][point.j],
      highlightedClass: className
    })
    this.possibleMoves = path;
  }

  makeAttackMove(enemyIndex: number, attack: number, defence: number, dmgTaker: Unit[], isUser: boolean, skill: Skill) {
    const damage = this.fieldService.getDamage(attack, defence, dmgTaker[enemyIndex]);
    let newHealth = this.heroService.getHealthAfterDmg(dmgTaker[enemyIndex].health, damage);
    if (damage) {
      this.log.push({
        isUser: isUser, imgSrc: skill.imgSrc,
        message: `${!isUser ? 'Игрок' : 'Бот'} ${dmgTaker[enemyIndex].name} (${dmgTaker[enemyIndex].x + 1})(${dmgTaker[enemyIndex].y + 1}) получил ${damage} ед. урона!`
      })
    }
    dmgTaker[enemyIndex] = {...dmgTaker[enemyIndex], health: newHealth};
    if (!newHealth) {
      this.log.push({
        isUser: isUser, imgSrc: skill.imgSrc,
        message: `${!isUser ? 'Игрок' : 'Бот'} ${dmgTaker[enemyIndex].name} (${dmgTaker[enemyIndex].x + 1})(${dmgTaker[enemyIndex].y + 1}) отправился к семерым!`
      })
    }
  }

  selectSkillsAndRecountCooldown(units: Unit[], selectedUnit: Unit, recountCooldown = true) {
    const unitIndex = this.fieldService.findUnitIndex(units, selectedUnit);
    let skills: Skill[] = createDeepCopy(selectedUnit?.skills as Skill[]);
    if (recountCooldown) {
      skills = this.fieldService.recountSkillsCooldown(skills);
    }
    units[unitIndex] = {...units[unitIndex], skills: skills};
    this.skillsInAttackBar = skills;
  }

  finishTurn() {
    this.userUnits = this.userUnits.map((user) => ({...user, canMove: false, canAttack: false}))
    this.updateGridUnits(this.userUnits);
    this.checkAiMoves();
  }
}
