import {Component, OnInit} from '@angular/core';
import {GameFieldService} from "../../services/game-field/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {PopoverModule} from "ngx-bootstrap/popover";
import {Position, Tile} from "../../interface";
import {TabsModule} from "ngx-bootstrap/tabs";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {createDeepCopy} from "../../helpers";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {GameService} from "../../services/game-action/game.service";
import {EffectsService} from "../../services/effects/effects.service";
import {UnitService} from "../../services/unit/unit.service";
import {AbstractGameFieldComponent} from "../abstract/abstract-game-field/abstract-game-field.component";
import {BasicGameBoardComponent} from "../basic-game-board/basic-game-board.component";
import {heroType} from "../../services/heroes/heroes.service";
import {Skill} from "../../models/skill.model";
import {Unit} from "../../models/unit.model";
import {GameLoggerService} from "../../services/game-logger/logger.service";

@Component({
    selector: 'game-field',
    standalone: true,
    imports: [CommonModule, OutsideClickDirective, PopoverModule, TabsModule, ProgressbarModule, AccordionModule, TooltipModule, BasicGameBoardComponent],
    templateUrl: './game-field.component.html',
    styleUrl: './game-field.component.scss'
})
export class GameFieldComponent extends AbstractGameFieldComponent implements OnInit {
    constructor(private fieldService: GameFieldService,
                private unitService: UnitService,
                private effectsService: EffectsService,
                private gameActionService: GameService,
                private gameLoggerService: GameLoggerService) {
        super(fieldService);
    }

    ngOnInit(): void {
        this.gameConfig = this.fieldService.populateGameFieldWithUnits(this.userUnits, this.aiUnits);
    }

    attack(skill: Skill) {
        this.skillsInAttackBar = this.gameActionService.selectSkillsAndRecountCooldown(this.userUnits, this.selectedEntity as Unit);
        const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.clickedEnemy);
        const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);
        const skillIndex = this.unitService.findSkillIndex(this.userUnits[userIndex].skills, skill);
        this.addBuffToUnit(this.userUnits, userIndex, skill)
        this.makeAttackMove(enemyIndex, this.effectsService.getBoostedAttack(this.userUnits[userIndex].heroType === heroType.ATTACK ? this.userUnits[userIndex].attack : this.userUnits[userIndex].defence, this.userUnits[userIndex].effects) * skill.dmgM, this.effectsService.getBoostedDefence(this.aiUnits[enemyIndex].defence, this.aiUnits[enemyIndex].effects), this.aiUnits, this.userUnits[userIndex], skill)
        this.universalRangeAttack(skill, this.clickedEnemy as Unit, this.aiUnits, false, this.userUnits[userIndex])
        const skills = this.updateSkillsCooldown(createDeepCopy(this.userUnits[userIndex].skills), this.aiUnits, enemyIndex, skillIndex, skill, false, !(this.userUnits[userIndex].rage > this.aiUnits[enemyIndex].willpower));
        this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false, canMove: false, skills: skills};
        this.gameActionService.checkCloseFight(this.userUnits, this.aiUnits, this.gameResultsRedirect);
        this.updateGridUnits(this.aiUnits);
        this.updateGridUnits(this.userUnits);
        this.dropEnemy();
        this.checkAiMoves();
    }

    universalRangeAttack(skill: Skill, clickedEnemy: Unit, enemiesArray: Unit[], userCheck: boolean, attacker: Unit) {
        if (skill.attackInRange) {
            const tilesInRange = this.fieldService.getFieldsInRadius(this.gameConfig, this.unitService.getPositionFromUnit(clickedEnemy as Unit), skill.attackRange as number, true)
            const enemiesInRange: Unit[] = tilesInRange.map((tile) => enemiesArray.find((unit) => unit.x === tile.i && unit.y === tile.j && unit.user === userCheck))
                .filter((e) => !!e) as Unit[];
            for (let i = 0; i < enemiesInRange.length; i++) {
                const enemyIndex = this.unitService.findUnitIndex(enemiesArray, enemiesInRange[i]);
                this.makeAttackMove(enemyIndex, this.effectsService.getBoostedAttack(attacker.heroType === heroType.ATTACK ? attacker.attack : attacker.defence, attacker.effects) * (skill.attackInRangeM || 0), this.effectsService.getBoostedDefence(enemiesArray[enemyIndex].defence, enemiesArray[enemyIndex].effects), enemiesArray, attacker, skill)
                if (attacker.rage > enemiesArray[enemyIndex].willpower) {
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
        units[unitIndex] = this.unitService.addEffectToUnit(units, unitIndex, skill, addRangeEffects, this.effectsService.getEffectsWithIgnoreFilter)
    }

    addBuffToUnit(units: Unit[], unitIndex: number, skill: Skill) {
        units[unitIndex] = this.unitService.addBuffToUnit(units, unitIndex, skill);
    }

    updateGridUnits(unitsArray: Unit[]) {
        this.gameConfig = this.unitService.updateGridUnits(unitsArray, this.gameConfig);
    }

    dropEnemy() {
        this.fieldService.unhighlightCells.apply(this);
        this.dropEnemyState();
    }

    highlightMakeMove(e: { entity: Unit, event?: MouseEvent }) {
        const {entity, event} = e;
        if (this.showAttackBar) {
            this.dropEnemy();
        }
        event?.stopPropagation();
        if (!(entity.x === this.selectedEntity?.x && entity.y === this.selectedEntity.y) && (entity?.canMove || entity?.canAttack || entity.user === false)) {
            let possibleTargetsInAttackRadius;
            if (this.selectedEntity && this.selectedEntity.user) {
                possibleTargetsInAttackRadius = this.showPossibleMoves(this.unitService.getPositionFromUnit(this.selectedEntity), this.selectedEntity.attackRange, true)
            }

            this.clickedEnemy = this.selectedEntity?.user ? this.checkAndShowAttackBar(entity) : null;
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
                            const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.unitService.getUnitFromPosition(enemy));
                            enemyIndexList.push(enemyIndex);
                        }

                        enemyWhenCannotMove = enemyIndexList.map((enemyIndex) => {
                            return this.aiUnits[enemyIndex].health ? this.unitService.getPositionFromUnit(this.aiUnits[enemyIndex]) : undefined
                        })
                    }
                    if (enemyWhenCannotMove.length) {
                        this.possibleMoves = [...enemyWhenCannotMove]
                    } else {
                        this.possibleMoves = [];
                        this.userUnits[this.unitService.findUnitIndex(this.userUnits, this.selectedEntity)] = {
                            ...this.selectedEntity,
                            x: entity.x,
                            y: entity.y,
                            canMove: false,
                            canAttack: false
                        };
                        this.updateGridUnits(this.userUnits);
                    }
                }
                this.highlightCells(this.possibleMoves, entity.user ? "green-b" : "red-b")
            }

            if (this.showAttackBar) {
                this.skillsInAttackBar = (this.selectedEntity as Unit).skills;
            }
        } else {
            this.ignoreMove = true;
            this.selectedEntity = null;
            this.fieldService.unhighlightCells.apply(this);
            this.possibleMoves = [];
        }
    }

    getPossibleMoves(entity: Unit) {
        return this.showPossibleMoves(this.unitService.getPositionFromUnit(entity), entity?.canMove ? entity.canCross : entity.attackRange, !entity?.canMove);
    }

    getEnemyWhenCannotMove(unit: Unit, arrayOfTargets: Unit[]) {
        return this.getPossibleMoves(unit).find((move) => arrayOfTargets.some((aiUnit) => aiUnit.x === move.i && aiUnit.y === move.j && aiUnit.health > 0));
    }

    moveEntity(tile: Tile) {
        //Can not move AI units and dead units
        this.ignoreMove = (this.selectedEntity?.x === tile.x && this.selectedEntity.y === tile.y) || this.showAttackBar || tile.entity !== undefined
        if (this.selectedEntity?.user && this.possibleMoves.length && !this.ignoreMove && !!this.possibleMoves.find((move) => move.i === tile.x && move.j === tile.y)) {
            //User's unit can not move ( already made a move )
            const userIndex = this.unitService.findUnitIndex(this.userUnits, this.selectedEntity);
            this.userUnits[userIndex] = {...this.selectedEntity, x: tile.x, y: tile.y, canMove: false};
            //Look for targets to attack
            let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this.userUnits[userIndex], this.aiUnits)
            if (enemyWhenCannotMove) {
                const enemyIndex = this.unitService.findUnitIndex(this.aiUnits, this.unitService.getUnitFromPosition(enemyWhenCannotMove));
                enemyWhenCannotMove = this.aiUnits[enemyIndex].health ? enemyWhenCannotMove : undefined;
            }
            if (!enemyWhenCannotMove) {
                this.userUnits[userIndex] = this.gameActionService.recountCooldownForUnit({
                    ...this.userUnits[userIndex],
                    canAttack: false
                })
            }

            this.updateGameFieldTile(tile.x, tile.y, createDeepCopy(this.userUnits[userIndex]))
            this.updateGameFieldTile(this.selectedEntity?.x, this.selectedEntity?.y, undefined, true)
            this.fieldService.unhighlightCells.apply(this);
            this.selectedEntity = null;
        }
        this.checkAiMoves()
    }

    checkAiMoves(intervalFight: boolean = true, aiMove: boolean = true) {
        const userFinishedTurn = this.userUnits.every((userHero) => (!userHero.canMove && !userHero.canAttack) || !userHero.health);
        if (userFinishedTurn && !this.gameActionService.isDead(this.aiUnits)) {
            if (this.battleMode) {
                this.dropEnemy();
                this.turnUser = false;
                this.attackUser(intervalFight, aiMove);
            } else {
                this.turnUser = true;
                this.finishAiTurn(1, true, [])
            }
        }
    }

    startAutoFight(intervalFight = true) {
        this.autoFight = true;
        const interval = setInterval(() => {
            this.attackUser(intervalFight, false);
            this.fieldService.resetMoveAndAttack(this.userUnits, false);
            this.checkAiMoves(intervalFight);
            if (this.checkAutoFightEnd()) {
                clearInterval(interval);
            }
        }, 500)
    }

    checkAutoFightEnd() {
        return this.gameActionService.isDead(this.aiUnits) || this.gameActionService.isDead(this.userUnits);
    }

    getAiLeadingUnits(aiMove: boolean) {
        return this.gameActionService.getAiLeadingUnits.bind(this)(aiMove);
    }

    getUserLeadingUnits(aiMove: boolean) {
        return this.gameActionService.getUserLeadingUnits.bind(this)(aiMove);
    }

    finishAiTurn(interval: any, aiMove: boolean, usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[]) {
        clearInterval(interval);
        //Update AI and user units arrays ( update on ui and grid )
        this.fieldService.resetMoveAndAttack(this.getAiLeadingUnits(aiMove));
        this.fieldService.resetMoveAndAttack(this.getUserLeadingUnits(aiMove));
        //User's units take dmg from their debuffs
        for (let i = 0; i < this.getUserLeadingUnits(aiMove).length; i++) {
            this.checkDebuffs(this.getUserLeadingUnits(aiMove)[i]);
        }
        usedAiSkills.forEach((config) => {
            const unitIndex = this.getUserLeadingUnits(aiMove).findIndex((user) => config.unit.x === user.x && config.unit.y === user.y)
            if (config.AI.rage > this.getUserLeadingUnits(aiMove)[unitIndex].willpower) {
                this.addEffectToUnit(this.getUserLeadingUnits(aiMove), unitIndex, config.skill)
            }
        })

        if (aiMove && !this.autoFight) {
            this.gameActionService.checkPassiveSkills(this.getUserLeadingUnits(aiMove), this.log)
        }

        this.gameConfig = this.fieldService.getGameField(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.fieldService.getDefaultGameField());
        this.turnUser = true;
        this.gameActionService.checkCloseFight(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.gameResultsRedirect);
    }

    attackUser(intervalFight = true, aiMove = true) {
        this._turnCount.next(this.turnCount + 1);
        const usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[] = [];

        const makeAiMove = (aiUnit: Unit, index: number) => {
            //Unit makes a move only if this unit is not dead
            if (aiUnit.health && aiUnit.canMove && aiUnit.canCross) {
                //Start with the closets user unit
                const closestUserUnits = this.unitService.orderUnitsByDistance(aiUnit, this.getUserLeadingUnits(aiMove));
                //Try to get to the closest user unit to attack it or if this unit is not reachable check the next one
                for (let i = 0; i < closestUserUnits.length; i++) {
                    const userUnit = closestUserUnits[i] as Unit;
                    if (userUnit.health) {
                        //Get Ai unit position and look for targets and the shortest path to them
                        const aiPosition = this.unitService.getPositionFromUnit(aiUnit);
                        const userUnitPosition = this.unitService.getPositionFromUnit(userUnit as Unit);
                        const shortestPathToUserUnit = this.fieldService.getShortestPathCover(this.fieldService.getGridFromField(this.gameConfig), aiPosition, userUnitPosition, true, false, true)

                        //User's unit that can be attacked
                        let canGetToUnit = shortestPathToUserUnit.length > aiUnit.canCross - 1 ? shortestPathToUserUnit[aiUnit.canCross - 1] : shortestPathToUserUnit[shortestPathToUserUnit.length - 1];
                        if (userUnitPosition && !shortestPathToUserUnit.length) {
                            canGetToUnit = this.unitService.getPositionFromUnit(aiUnit);
                        }
                        //Move AI unit
                        this.getAiLeadingUnits(aiMove)[index] = {
                            ...this.getAiLeadingUnits(aiMove)[index],
                            canMove: false,
                            x: canGetToUnit.i,
                            y: canGetToUnit.j
                        }
                        //Check if AI unit can attack
                        let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this.getAiLeadingUnits(aiMove)[index], this.getUserLeadingUnits(aiMove))
                        if (enemyWhenCannotMove) {
                            //Choose skill and target to attack
                            const userIndex = this.unitService.findUnitIndex(this.getUserLeadingUnits(aiMove), this.unitService.getUnitFromPosition(enemyWhenCannotMove));
                            const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);
                            const aiSkillIndex = this.unitService.findSkillIndex(aiUnit.skills, aiSkill);
                            //Attack user's unit
                            this.addBuffToUnit(this.getAiLeadingUnits(aiMove), index, aiSkill)
                            aiUnit = this.getAiLeadingUnits(aiMove)[index];
                            this.makeAttackMove(userIndex, this.effectsService.getBoostedAttack(aiUnit.heroType === heroType.ATTACK ? aiUnit.attack : aiUnit.defence, aiUnit.effects) * aiSkill.dmgM, this.effectsService.getBoostedDefence(this.getUserLeadingUnits(aiMove)[userIndex].defence, this.getUserLeadingUnits(aiMove)[userIndex].effects), this.getUserLeadingUnits(aiMove), aiUnit, aiSkill)
                            this.universalRangeAttack(aiSkill, this.getUserLeadingUnits(aiMove)[userIndex] as Unit, this.getUserLeadingUnits(aiMove), aiMove, aiUnit)
                            //Recount cooldowns for Ai unit after attack ( set maximum cooldown for used skill )
                            const skills = this.updateSkillsCooldown(createDeepCopy(this.getAiLeadingUnits(aiMove)[index].skills), this.getUserLeadingUnits(aiMove), userIndex, aiSkillIndex, aiSkill, true, true)
                            usedAiSkills.push({skill: aiSkill, unit: this.getUserLeadingUnits(aiMove)[userIndex], AI: aiUnit});
                            //Update AI units and game config
                            this.getAiLeadingUnits(aiMove)[index] = {
                                ...this.getAiLeadingUnits(aiMove)[index],
                                canAttack: false,
                                skills: skills
                            };
                            this.gameConfig = this.fieldService.getGameField(this.getUserLeadingUnits(aiMove), this.getAiLeadingUnits(aiMove), this.fieldService.getDefaultGameField());
                            return;
                        } else {
                            //Dead AI units do not make moves
                            this.getAiLeadingUnits(aiMove)[index] = {
                                ...this.getAiLeadingUnits(aiMove)[index],
                                canAttack: false
                            };
                        }
                    }
                }
            }
        }

        let index = 0;
        this.gameActionService.checkPassiveSkills(this.getAiLeadingUnits(aiMove), this.log);

        if (intervalFight) {
            const interval = setInterval(() => {
                if (index === this.getAiLeadingUnits(aiMove).length) {
                    this.finishAiTurn(interval, aiMove, usedAiSkills);
                } else {
                    this.gameActionService.aiUnitAttack(index, this.getAiLeadingUnits(aiMove), this.battleMode, makeAiMove.bind(this))
                    index++;
                }
            }, 500)
        } else {
            for (let i = 0; i < this.getAiLeadingUnits(aiMove).length; i++) {
                this.gameActionService.aiUnitAttack(i, this.getAiLeadingUnits(aiMove), this.battleMode, makeAiMove.bind(this))
            }
            this.finishAiTurn(1, aiMove, usedAiSkills)
        }
    }

    checkDebuffs(unit: Unit, decreaseRestoreCooldown = true) {
        const response = this.gameActionService.checkDebuffs(unit, decreaseRestoreCooldown, this.battleMode);
        unit = response.unit;
        this.log.push(...response.log);
        return unit;
    }

    highlightCells(path: Position[], className: string) {
        this.fieldService.unhighlightCells.apply(this);
        this.highlightCellsInnerFunction(path, className);
        this.possibleMoves = path.filter((move) => !!move);
    }

    makeAttackMove(enemyIndex: number, attack: number, defence: number, dmgTaker: Unit[], attackDealer: Unit, skill: Skill) {
        const damage = this.fieldService.getDamage({dmgTaker: dmgTaker[enemyIndex], attackDealer}, {defence, attack});

        if (dmgTaker[enemyIndex].health) {
            let newHealth = this.effectsService.getHealthAfterDmg(dmgTaker[enemyIndex].health, damage);
            this.log.push(this.gameLoggerService.logEvent({damage, newHealth: null, battleMode: this.battleMode}, attackDealer.user, skill, dmgTaker[enemyIndex]));
            dmgTaker[enemyIndex] = {...dmgTaker[enemyIndex], health: newHealth};
            this.log.push(this.gameLoggerService.logEvent({damage: 0, newHealth, battleMode: this.battleMode}, attackDealer.user, skill, dmgTaker[enemyIndex]));
        }
    }

    finishTurn() {
        this.userUnits = this.userUnits.map((user) => this.gameActionService.recountCooldownForUnit({
            ...user,
            canMove: false,
            canAttack: false
        }))
        this.updateGridUnits(this.userUnits);
        this.checkAiMoves();
    }
}
