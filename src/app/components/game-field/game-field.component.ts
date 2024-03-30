import {Component, Input, OnInit} from '@angular/core';
import {GameFieldService} from "../../services/game-field/game-field.service";
import {CommonModule} from "@angular/common";
import {OutsideClickDirective} from "../../directives/outside-click.directive";
import {PopoverModule} from "ngx-bootstrap/popover";
import {Effect, Position, Skill, Tile, Unit} from "../../interface";
import {TabsModule} from "ngx-bootstrap/tabs";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {createDeepCopy} from "../../helpers";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {GameService} from "../../services/game-action/game.service";
import {EffectsService} from "../../services/effects/effects.service";
import {UnitService} from "../../services/unit/unit.service";
import {AbstractGameFieldComponent} from "../abstract/abstract-game-field/abstract-game-field.component";

@Component({
    selector: 'game-field',
    standalone: true,
    imports: [CommonModule, OutsideClickDirective, PopoverModule, TabsModule, ProgressbarModule, AccordionModule, TooltipModule],
    templateUrl: './game-field.component.html',
    styleUrl: './game-field.component.scss'
})
export class GameFieldComponent extends AbstractGameFieldComponent implements OnInit {
    @Input() userUnits: Unit[] = [];
    @Input() aiUnits: Unit[] = [];
    @Input() gameResultsRedirect: () => void = () => {
    };

    constructor(private fieldService: GameFieldService,
                private unitService: UnitService,
                private effectsService: EffectsService,
                private gameActionService: GameService) {
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
        this.makeAttackMove(enemyIndex, this.effectsService.getBoostedAttack(this.userUnits[userIndex].attack, this.userUnits[userIndex].effects) * skill.dmgM, this.effectsService.getBoostedDefence(this.aiUnits[enemyIndex].defence, this.aiUnits[enemyIndex].effects), this.aiUnits, this.userUnits[userIndex], true, skill)
        this.universalRangeAttack(skill, this.clickedEnemy as Unit, this.aiUnits, false, true, this.userUnits[userIndex])
        const skills = this.updateSkillsCooldown(createDeepCopy(this.userUnits[userIndex].skills), this.aiUnits, enemyIndex, skillIndex, skill, false, !(this.userUnits[userIndex].rage > this.aiUnits[enemyIndex].willpower));
        this.userUnits[userIndex] = {...this.userUnits[userIndex], canAttack: false, canMove: false, skills: skills};
        this.gameActionService.checkCloseFight(this.userUnits, this.aiUnits, this.gameResultsRedirect);
        this.updateGridUnits(this.aiUnits);
        this.updateGridUnits(this.userUnits);
        this.dropEnemy();
        this.checkAiMoves();
    }

    universalRangeAttack(skill: Skill, clickedEnemy: Unit, enemiesArray: Unit[], userCheck: boolean, isUser: boolean, attacker: Unit) {
        if (skill.attackInRange) {
            const tilesInRange = this.fieldService.getFieldsInRadius(this.gameConfig, this.unitService.getPositionFromUnit(clickedEnemy as Unit), skill.attackRange as number, true)
            const enemiesInRange: Unit[] = tilesInRange.map((tile) => {
                return enemiesArray.find((unit) => unit.x === tile.i && unit.y === tile.j && unit.user === userCheck)
            }).filter((e) => !!e) as Unit[];
            for (let i = 0; i < enemiesInRange.length; i++) {
                const enemyIndex = this.unitService.findUnitIndex(enemiesArray, enemiesInRange[i]);
                this.makeAttackMove(enemyIndex, this.effectsService.getBoostedAttack(attacker.attack, attacker.effects) * (skill.attackInRangeM || 0), this.effectsService.getBoostedDefence(enemiesArray[enemyIndex].defence, enemiesArray[enemyIndex].effects), enemiesArray, attacker, isUser, skill)
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

    highlightMakeMove(entity: Unit, event?: MouseEvent) {
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
            this.dropEnemy();
            this.turnUser = false;
            this.attackUser(intervalFight, aiMove);
        }
    }

    startAutoFight(intervalFight = true) {
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

    attackUser(intervalFight = true, aiMove = true) {
        this._turnCount.next(this.turnCount + 1);
        const usedAiSkills: { skill: Skill, unit: Unit, AI: Unit }[] = [];

        const aiUnitAttack = (index: number) => {
            //Get AI unit and look for debuffs ( deal dmg before making a move )
            let aiUnit = this[aiMove ? 'aiUnits' : 'userUnits'][index];
            this[aiMove ? 'aiUnits' : 'userUnits'][index] = this.checkDebuffs(createDeepCopy(aiUnit), createDeepCopy(this[aiMove ? 'aiUnits' : 'userUnits']), index);
            aiUnit = this[aiMove ? 'aiUnits' : 'userUnits'][index];
            //AI makes a move
            makeAiMove(aiUnit, index);
            //Update skills cooldowns
            this.gameActionService.selectSkillsAndRecountCooldown(this[aiMove ? 'aiUnits' : 'userUnits'], this[aiMove ? 'aiUnits' : 'userUnits'][index]);
        }
        const finishAiTurn = (interval: any) => {
            clearInterval(interval);
            //Update AI and user units arrays ( update on ui and grid )
            this.fieldService.resetMoveAndAttack(this[aiMove ? 'aiUnits' : 'userUnits']);
            this.fieldService.resetMoveAndAttack(this[aiMove ? 'userUnits' : 'aiUnits']);
            //User's units take dmg from their debuffs
            for (let i = 0; i < this[aiMove ? 'userUnits' : 'aiUnits'].length; i++) {
                this.checkDebuffs(this[aiMove ? 'userUnits' : 'aiUnits'][i], this[aiMove ? 'userUnits' : 'aiUnits'], i);
            }
            usedAiSkills.forEach((config) => {
                const unitIndex = this[aiMove ? 'userUnits' : 'aiUnits'].findIndex((user) => config.unit.x === user.x && config.unit.y === user.y)
                if (config.AI.rage > this[aiMove ? 'userUnits' : 'aiUnits'][unitIndex].willpower) {
                    this.addEffectToUnit(this[aiMove ? 'userUnits' : 'aiUnits'], unitIndex, config.skill)
                }
            })
            //User's units restore health from their passive skills
            this.gameActionService.checkPassiveSkills(this[aiMove ? 'userUnits' : 'aiUnits'], this.log)
            //Update grid config
            this.gameConfig = this.fieldService.getGameField(this[aiMove ? 'userUnits' : 'aiUnits'], this[aiMove ? 'aiUnits' : 'userUnits'], this.fieldService.getDefaultGameField());
            this.turnUser = true;
            this.gameActionService.checkCloseFight(this[aiMove ? 'userUnits' : 'aiUnits'], this[aiMove ? 'aiUnits' : 'userUnits'], this.gameResultsRedirect);
        }
        const makeAiMove = (aiUnit: Unit, index: number) => {
            //Unit makes a move only if this unit is not dead
            if (aiUnit.health && aiUnit.canMove) {
                //Start with the closets user unit
                const closestUserUnits = this.unitService.orderUnitsByDistance(aiUnit, this[aiMove ? 'userUnits' : 'aiUnits']);
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
                        this[aiMove ? 'aiUnits' : 'userUnits'][index] = {
                            ...this[aiMove ? 'aiUnits' : 'userUnits'][index],
                            canMove: false,
                            x: canGetToUnit.i,
                            y: canGetToUnit.j
                        }
                        //Check if AI unit can attack
                        let enemyWhenCannotMove = this.getEnemyWhenCannotMove(this[aiMove ? 'aiUnits' : 'userUnits'][index], this[aiMove ? 'userUnits' : 'aiUnits'])
                        if (enemyWhenCannotMove) {
                            //Choose skill and target to attack
                            const userIndex = this.unitService.findUnitIndex(this[aiMove ? 'userUnits' : 'aiUnits'], this.unitService.getUnitFromPosition(enemyWhenCannotMove));
                            const aiSkill = this.fieldService.chooseAiSkill(aiUnit.skills);
                            const aiSkillIndex = this.unitService.findSkillIndex(aiUnit.skills, aiSkill);
                            //Attack user's unit
                            this.addBuffToUnit(this[aiMove ? 'aiUnits' : 'userUnits'], index, aiSkill)
                            aiUnit = this[aiMove ? 'aiUnits' : 'userUnits'][index];
                            this.makeAttackMove(userIndex, this.effectsService.getBoostedAttack(aiUnit.attack, aiUnit.effects) * aiSkill.dmgM, this.effectsService.getBoostedDefence(this[aiMove ? 'userUnits' : 'aiUnits'][userIndex].defence, this[aiMove ? 'userUnits' : 'aiUnits'][userIndex].effects), this[aiMove ? 'userUnits' : 'aiUnits'], aiUnit, false, aiSkill)
                            this.universalRangeAttack(aiSkill, this[aiMove ? 'userUnits' : 'aiUnits'][userIndex] as Unit, this.userUnits, true, false, aiUnit)
                            //Recount cooldowns for Ai unit after attack ( set maximum cooldown for used skill )
                            const skills = this.updateSkillsCooldown(createDeepCopy(this[aiMove ? 'aiUnits' : 'userUnits'][index].skills), this[aiMove ? 'userUnits' : 'aiUnits'], userIndex, aiSkillIndex, aiSkill, true, true)
                            usedAiSkills.push({skill: aiSkill, unit: this[aiMove ? 'userUnits' : 'aiUnits'][userIndex], AI: aiUnit});
                            //Update AI units and game config
                            this[aiMove ? 'aiUnits' : 'userUnits'][index] = {
                                ...this[aiMove ? 'aiUnits' : 'userUnits'][index],
                                canAttack: false,
                                skills: skills
                            };
                            this.gameConfig = this.fieldService.getGameField(this[aiMove ? 'userUnits' : 'aiUnits'], this[aiMove ? 'aiUnits' : 'userUnits'], this.fieldService.getDefaultGameField());
                            return;
                        } else {
                            //Dead AI units do not make moves
                            this[aiMove ? 'aiUnits' : 'userUnits'][index] = {
                                ...this[aiMove ? 'aiUnits' : 'userUnits'][index],
                                canAttack: false
                            };
                        }
                    }
                }
            }
        }

        let index = 0;
        this.gameActionService.checkPassiveSkills(this[aiMove ? 'aiUnits' : 'userUnits'], this.log);

        if (intervalFight) {
            //Each AI unit makes a move
            const interval = setInterval(() => {
                if (index === this[aiMove ? 'aiUnits' : 'userUnits'].length) {
                    finishAiTurn(interval);
                } else {
                    aiUnitAttack(index);
                    index++;
                }
            }, 500)
        } else {
            for (let i = 0; i < this[aiMove ? 'aiUnits' : 'userUnits'].length; i++) {
                aiUnitAttack(i);
            }
            finishAiTurn(1)
        }
    }

    checkDebuffs(unit: Unit, units: Unit[], index: number, decreaseRestoreCooldown = true) {
        unit.effects.forEach((effect: Effect, i, array) => {
            if (effect.duration > 0) {
                if (effect.restore) {
                    array[i] = {...effect, duration: decreaseRestoreCooldown ? effect.duration - 1 : effect.duration}
                    this.gameActionService.checkEffectsForHealthRestore(unit, this.log);
                } else {
                    array[i] = {...effect, duration: effect.duration - 1}
                    if (!effect.passive) {
                        const additionalDmg = this.gameActionService.getReducedDmgForEffects(unit, this.effectsService.getDebuffDmg(effect.type, unit.health, effect.m), effect);
                        additionalDmg && this.logEvent({damage: null, newHealth: null, addDmg: additionalDmg}, !unit.user, effect, unit)
                        unit.health = this.effectsService.getHealthAfterDmg(unit.health, additionalDmg);
                    }
                }
            }
        })

        //Activate effects from buffs/debuffs
        unit.effects.forEach((effect) => {
            let recountedUnit = this.effectsService.recountStatsBasedOnEffect(effect, unit);
            recountedUnit = !effect.duration ? this.effectsService.restoreStatsAfterEffect(effect, recountedUnit) : recountedUnit;
            unit = recountedUnit.unit;
            if (recountedUnit.message) {
                this.logEvent({damage: null, newHealth: null}, !unit.user, effect, unit, recountedUnit.message)
            }
        })
        unit.effects = unit.effects.filter((debuff) => !!debuff.duration);
        return unit;
    }

    highlightCells(path: Position[], className: string) {
        this.fieldService.unhighlightCells.apply(this);
        this.highlightCellsInnerFunction(path, className);
        this.possibleMoves = path.filter((move) => !!move);
    }

    makeAttackMove(enemyIndex: number, attack: number, defence: number, dmgTaker: Unit[], attackDealer: Unit, isUser: boolean, skill: Skill) {
        const fixedDefence = this.gameActionService.getFixedDefence(defence, dmgTaker[enemyIndex]);
        const fixedAttack = this.gameActionService.getFixedAttack(attack, attackDealer);

        const damage = this.fieldService.getDamage(fixedAttack, fixedDefence, dmgTaker[enemyIndex]);

        if (dmgTaker[enemyIndex].health) {
            let newHealth = this.effectsService.getHealthAfterDmg(dmgTaker[enemyIndex].health, damage);
            this.logEvent({damage, newHealth: null}, isUser, skill, dmgTaker[enemyIndex]);
            dmgTaker[enemyIndex] = {...dmgTaker[enemyIndex], health: newHealth};
            this.logEvent({damage: 0, newHealth}, isUser, skill, dmgTaker[enemyIndex]);
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
