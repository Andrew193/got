import {Component} from '@angular/core';
import {Effect, GameFieldService, Skill, Tile, Unit} from "../../services/game-field/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {PopoverModule} from "ngx-bootstrap/popover";
import {LogRecord, Position} from "../../interface";
import {HeroesService} from "../../services/heroes/heroes.service";
import {TabsModule} from "ngx-bootstrap/tabs";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {createDeepCopy} from "../../helpers";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {BehaviorSubject} from "rxjs";
import {GameService} from "../../services/game-action/game.service";

@Component({
    selector: 'game-field',
    standalone: true,
    imports: [CommonModule, OutsideClickDirective, PopoverModule, TabsModule, ProgressbarModule, AccordionModule, TooltipModule],
    templateUrl: './game-field.component.html',
    styleUrl: './game-field.component.scss'
})
export class GameFieldComponent {
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
    possibleAttackMoves: Position[] = [];

    constructor(private fieldService: GameFieldService,
                private heroService: HeroesService,
                private gameActionService: GameService) {
        this.userSample = this.heroService.getLadyOfDragonStone()
        this.userUnits = [this.heroService.getTargaryenKnight(), {...this.userSample, x: 3, y: 7}];
        this.aiUnits = [{
            ...this.heroService.getGiant(),
            x: 3,
            y: 9,
            user: false
        }, {
            ...this.heroService.getFreeTrapper(),
            x: 4,
            y: 9,
            user: false
        }]
        this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
        this._turnCount.subscribe((newTurn) => {
            this.turnCount = newTurn;
        })
    }

    attack(skill: Skill) {
        this.skillsInAttackBar = this.gameActionService.selectSkillsAndRecountCooldown(this.userUnits, this.selectedEntity as Unit)

        const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.clickedEnemy);
        const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.selectedEntity);
        const skillIndex = this.fieldService.findSkillIndex(this.userUnits[userIndex].skills, skill);
        this.addBuffToUnit(this.userUnits, userIndex, skill)
        this.makeAttackMove(enemyIndex, this.heroService.getBoostedAttack(this.userUnits[userIndex].attack, this.userUnits[userIndex].effects) * skill.dmgM, this.heroService.getBoostedDefence(this.aiUnits[enemyIndex].defence, this.aiUnits[enemyIndex].effects), this.aiUnits, this.userUnits[userIndex], true, skill)
        this.universalRangeAttack(skill, this.clickedEnemy as Unit, this.aiUnits, false, true, this.userUnits[userIndex])
        const skills = this.updateSkillsCooldown(createDeepCopy(this.userUnits[userIndex].skills), this.aiUnits, enemyIndex, skillIndex, skill, false, !(this.userUnits[userIndex].rage > this.aiUnits[enemyIndex].willpower));
        this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false, canMove: false, skills: skills};

        this.updateGridUnits(this.aiUnits);
        this.updateGridUnits(this.userUnits);
        this.dropEnemy();
        this.checkAiMoves();
    }

    universalRangeAttack(skill: Skill, clickedEnemy: Unit, enemiesArray: Unit[], userCheck: boolean, isUser: boolean, attacker: Unit) {
        if (skill.attackInRange) {
            const tilesInRange = this.fieldService.getFieldsInRadius(this.gameConfig, this.fieldService.getPositionFromUnit(clickedEnemy as Unit), skill.attackRange as number, true)
            const enemiesInRange: Unit[] = tilesInRange.map((tile) => {
                return enemiesArray.find((unit) => unit.x === tile.i && unit.y === tile.j && unit.user === userCheck)
            }).filter((e) => !!e) as Unit[];
            for (let i = 0; i < enemiesInRange.length; i++) {
                const enemyIndex = this.fieldService.findUnitIndex(enemiesArray, enemiesInRange[i]);
                this.makeAttackMove(enemyIndex, this.heroService.getBoostedAttack(attacker.attack, attacker.effects) * (skill.attackInRangeM || 0), this.heroService.getBoostedDefence(enemiesArray[enemyIndex].defence, enemiesArray[enemyIndex].effects), enemiesArray, attacker, isUser, skill)
               if(attacker.rage > enemiesArray[enemyIndex].willpower) {
                   this.addEffectToUnit(enemiesArray, enemyIndex, skill, !!skill.inRangeDebuffs)
               }
            }
        }
    }

    updateSkillsCooldown(originalSkills: Skill[], units: Unit[], unitIndex: number, skillIndex: number, skill: Skill, addTurn = false, ignoreEffect = false) {
        const skills = createDeepCopy(originalSkills);
        if (!ignoreEffect) {
            this.addEffectToUnit(units, unitIndex, skill);
        }
        skills[skillIndex] = {
            ...skills[skillIndex],
            remainingCooldown: skills[skillIndex].cooldown ? addTurn ? skills[skillIndex].cooldown + 1 : skills[skillIndex].cooldown : 0
        }
        return skills;
    }

    addEffectToUnit(units: Unit[], unitIndex: number, skill: Skill, addRangeEffects = false) {
        units[unitIndex] = {
            ...units[unitIndex],
            effects: this.heroService.getEffectsWithIgnoreFilter(units[unitIndex], skill, addRangeEffects)
        }
    }

    addBuffToUnit(units: Unit[], unitIndex: number, skill: Skill) {
        if (skill.buffs?.length) {
            units[unitIndex] = {
                ...units[unitIndex],
                effects: [...units[unitIndex].effects, ...(skill.buffs || [])]
            }
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
                if (entity.attackRange >= entity.canCross) {
                    this.possibleAttackMoves = this.getPossibleMoves({...entity, canCross: entity.attackRange})
                }
                if (entity?.canMove === false) {
                    let enemyWhenCannotMove: any[] = this.possibleMoves.filter((move) => this.aiUnits.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j));
                    if (enemyWhenCannotMove.length) {
                        const enemyIndexList = [];
                        for (let i = 0; i < enemyWhenCannotMove.length; i++) {
                            const enemy = enemyWhenCannotMove[i]
                            const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.fieldService.getUnitFromPosition(enemy));
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
        return this.showPossibleMoves(this.fieldService.getPositionFromUnit(entity), entity?.canMove ? entity.canCross : entity.attackRange, !entity?.canMove);
    }

    checkAndShowAttackBar(clickedTile: Unit) {
        if (clickedTile.user) {
            return null;
        }
        const enemyClicked = this.possibleMoves.find((possibleTile) => possibleTile.i === clickedTile.x && possibleTile.j === clickedTile.y)
        return enemyClicked ? clickedTile : null;
    }

    getEnemyWhenCannotMove(unit: Unit, arrayOfTargets: Unit[]) {
        return this.getPossibleMoves(unit).find((move) => arrayOfTargets.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j && aiUnit.health > 0));
    }

    moveEntity(tile: Tile) {
        //Can not move AI units and dead units
        this.ignoreMove = (this.selectedEntity?.x === tile.x && this.selectedEntity.y === tile.y) || this.showAttackBar || tile.entity !== undefined
        if (this.selectedEntity?.user && this.possibleMoves.length && !this.ignoreMove && !!this.possibleMoves.find((move) => move.i === tile.x && move.j === tile.y)) {
            //User's unit can not move ( already made a move )
            const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.selectedEntity);
            this.userUnits[userIndex] = {...this.selectedEntity, x: tile.x, y: tile.y, canMove: false};
            //Look for targets to attack
            let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this.userUnits[userIndex], this.aiUnits)
            if (enemyWhenCannotMove) {
                const enemyIndex = this.fieldService.findUnitIndex(this.aiUnits, this.fieldService.getUnitFromPosition(enemyWhenCannotMove));
                enemyWhenCannotMove = this.aiUnits[enemyIndex].health ? enemyWhenCannotMove : undefined;
            }
            if (!enemyWhenCannotMove) {
                this.userUnits[userIndex] = this.gameActionService.recountCooldownForUnit({...this.userUnits[userIndex], canAttack: false})
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
        //If all user's units have canMove and canAttack equal to 'false' start AI's turn
        const userFinishedTurn = this.userUnits.every((userHero) => (!userHero.canMove && !userHero.canAttack) || !userHero.health);
        if (userFinishedTurn) {
            this.dropEnemy();
            this.turnUser = false;
            this.attackUser();
        }
    }

    attackUser() {
        this._turnCount.next(this.turnCount + 1);
        const usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[] = [];
        this.gameActionService.checkCloseFight(this.userUnits, this.aiUnits);

        const makeAiMove = (aiUnit: Unit, index: number) => {
            //Unit makes a move only if this unit is not dead
            if (aiUnit.health && aiUnit.canMove) {
                //Start with the closets user unit
                const closestUserUnits = this.fieldService.orderUnitsByDistance(aiUnit, this.userUnits);
                //Try to get to the closest user unit to attack it or if this unit is not reachable check the next one
                for (let i = 0; i < closestUserUnits.length; i++) {
                    const userUnit = closestUserUnits[i] as Unit;
                    if (userUnit.health) {
                        //Get Ai unit position and look for targets and the shortest path to them
                        const aiPosition = this.fieldService.getPositionFromUnit(aiUnit);
                        const userUnitPosition = this.fieldService.getPositionFromUnit(userUnit as Unit);
                        const shortestPathToUserUnit = this.fieldService.getShortestPathCover(this.fieldService.getGridFromField(this.gameConfig), aiPosition, userUnitPosition, true, false, true)

                        //User's unit that can be attacked
                        let canGetToUnit = shortestPathToUserUnit.length > aiUnit.canCross - 1 ? shortestPathToUserUnit[aiUnit.canCross - 1] : shortestPathToUserUnit[shortestPathToUserUnit.length - 1];
                        if (userUnitPosition && !shortestPathToUserUnit.length) {
                            canGetToUnit = this.fieldService.getPositionFromUnit(aiUnit);
                        }
                        //Move AI unit
                        this.aiUnits[index] = {...this.aiUnits[index], canMove: false, x: canGetToUnit.i, y: canGetToUnit.j}
                        //Check if AI unit can attack
                        let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this.aiUnits[index], this.userUnits)
                        if (enemyWhenCannotMove) {
                            //Choose skill and target to attack
                            const userIndex = this.fieldService.findUnitIndex(this.userUnits, this.fieldService.getUnitFromPosition(enemyWhenCannotMove));
                            const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);
                            const aiSkillIndex = this.fieldService.findSkillIndex(aiUnit.skills, aiSkill);
                            //Attack user's unit
                            this.addBuffToUnit(this.aiUnits, index, aiSkill)
                            aiUnit = this.aiUnits[index];
                            this.makeAttackMove(userIndex, this.heroService.getBoostedAttack(aiUnit.attack, aiUnit.effects) * aiSkill.dmgM, this.heroService.getBoostedDefence(this.userUnits[userIndex].defence, this.userUnits[userIndex].effects), this.userUnits, aiUnit, false, aiSkill)
                            this.universalRangeAttack(aiSkill, this.userUnits[userIndex] as Unit, this.userUnits, true, false, aiUnit)
                            //Recount cooldowns for Ai unit after attack ( set maximum cooldown for used skill )
                            const skills = this.updateSkillsCooldown(createDeepCopy(this.aiUnits[index].skills), this.userUnits, userIndex, aiSkillIndex, aiSkill, true, true)
                            usedAiSkills.push({skill: aiSkill, unit: this.userUnits[userIndex], AI: aiUnit});
                            //Update AI units and game config
                            this.aiUnits[index] = {...this.aiUnits[index], canAttack: false, skills: skills};
                            this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
                            return;
                        } else {
                            //Dead AI units do not make moves
                            this.aiUnits[index] = {...this.aiUnits[index], canAttack: false};
                        }
                    }
                }
            }
        }

        let index = 0;
        this.gameActionService.checkRestorePassiveSkills(this.aiUnits, this.log);

        //Each AI unit makes a move
        const interval = setInterval(() => {
            if (index === this.aiUnits.length) {
                clearInterval(interval);
                //Update AI and user units arrays ( update on ui and grid )
                this.fieldService.resetMoveAndAttack(this.aiUnits);
                this.fieldService.resetMoveAndAttack(this.userUnits);
                //User's units take dmg from their debuffs
                for (let i = 0; i < this.userUnits.length; i++) {
                    this.checkDebuffs(this.userUnits[i], this.userUnits, i);
                }
                usedAiSkills.forEach((config) => {
                    const unitIndex = this.userUnits.findIndex((user) => config.unit.x === user.x && config.unit.y === user.y)
                    if(config.AI.rage > this.userUnits[unitIndex].willpower) {
                        this.addEffectToUnit(this.userUnits, unitIndex, config.skill)
                    }
                })
                //User's units restore health from their passive skills
                this.gameActionService.checkRestorePassiveSkills(this.userUnits, this.log)
                //Update grid config
                this.gameConfig = this.fieldService.getGameField(this.userUnits, this.aiUnits, this.fieldService.getDefaultGameField());
                this.turnUser = true;
                this.gameActionService.checkCloseFight(this.userUnits, this.aiUnits);
            } else {
                //Get AI unit and look for debuffs ( deal dmg before making a move )
                let aiUnit = this.aiUnits[index];
                this.aiUnits[index] = this.checkDebuffs(createDeepCopy(aiUnit), createDeepCopy(this.aiUnits), index);
                aiUnit = this.aiUnits[index];
                //AI makes a move
                makeAiMove(aiUnit, index);
                //Update skills cooldowns
                this.gameActionService.selectSkillsAndRecountCooldown(this.aiUnits, this.aiUnits[index]);
                index++;
            }
        }, 500)
    }

    //Check debuffs like: poison, burning
    checkDebuffs(unit: Unit, units: Unit[], index: number, decreaseRestoreCooldown = true) {
        unit.effects.forEach((effect: Effect, i, array) => {
            if (effect.duration > 0) {
                if (effect.restore) {
                    array[i] = {...effect, duration: decreaseRestoreCooldown ? effect.duration - 1 : effect.duration}
                    this.gameActionService.checkEffectsForHealthRestore(unit, this.log);
                } else {
                    array[i] = {...effect, duration: effect.duration - 1}
                    if (!effect.passive) {
                        const additionalDmg = this.gameActionService.getReducedDmgForEffects(unit, this.heroService.getDebuffDmg(effect.type, unit.health, effect.m), effect);
                        additionalDmg && this.log.push({
                            isUser: !unit.user, imgSrc: effect.imgSrc,
                            message: `${unit.user ? 'Игрок' : 'Бот'} ${unit.name} получил ${additionalDmg} ед. ! дополнительного урона от штрафа ${effect.type}`
                        })
                        unit.health = this.heroService.getHealthAfterDmg(unit.health, additionalDmg)
                    }
                }
            }
        })
        unit.effects = unit.effects.filter((debuff) => !!debuff.duration);
        return unit;
    }

    highlightCells(path: Position[], className: string) {
        this.fieldService.unhighlightCells.bind(this)();
        this.highlightCellsInnerFunction(path, className);
        this.possibleMoves = path.filter((move)=>!!move);
    }

    highlightCellsInnerFunction(path: Position[], className: string) {
        path.forEach((point) => {
          if(point) {
            this.gameConfig[point.i][point.j] = {
              ...this.gameConfig[point.i][point.j],
              highlightedClass: className
            }
          }
        })
    }

    makeAttackMove(enemyIndex: number, attack: number, defence: number, dmgTaker: Unit[], attackDealer: Unit, isUser: boolean, skill: Skill) {
        const fixedDefence = this.gameActionService.getFixedDefence(defence, dmgTaker[enemyIndex]);
        const fixedAttack = this.gameActionService.getFixedAttack(attack, attackDealer);

        const damage = this.fieldService.getDamage(fixedAttack, fixedDefence, dmgTaker[enemyIndex]);

        if (dmgTaker[enemyIndex].health) {
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
    }

    finishTurn() {
        this.userUnits = this.userUnits.map((user) => this.gameActionService.recountCooldownForUnit({...user, canMove: false, canAttack: false}))
        this.updateGridUnits(this.userUnits);
        this.checkAiMoves();
    }
}
