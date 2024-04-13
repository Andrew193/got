import {Injectable} from '@angular/core';
import {Position} from "../../interface";
import {createDeepCopy} from "../../helpers";
import {Unit} from "../../models/unit.model";
import {Skill} from "../../models/skill.model";

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  constructor() {
  }

  findUnitIndex(units: Unit[], unit: { x: number, y: number, [key: string]: any } | null) {
    return units.findIndex((enemy) => enemy.x === unit?.x && enemy.y === unit?.y)
  }

  recountSkillsCooldown = (skills: Skill[]) => skills.map((skill) => ({
    ...skill,
    remainingCooldown: skill.remainingCooldown > 0 ? skill.remainingCooldown - 1 : 0
  }))

  findSkillIndex(skills: Skill[], selectedSkill: Skill) {
    return skills.findIndex((skill) => skill.dmgM === selectedSkill.dmgM && skill.name === selectedSkill.name)
  }

  orderUnitsByDistance(start: { x: number, y: number }, positions: { x: number, y: number }[]) {
    return positions.sort((a, b) => {
      const distanceA = Math.abs(a.x - start.x) + Math.abs(a.y - start.y);
      const distanceB = Math.abs(b.x - start.x) + Math.abs(b.y - start.y);
      return distanceA - distanceB;
    });
  }

  getPositionFromUnit(unit: Unit) {
    return {
      i: unit.x,
      j: unit.y
    }
  }

  getUnitFromPosition(position: Position) {
    return {
      x: position?.i,
      y: position?.j
    }
  }

  addEffectToUnit(units: Unit[], unitIndex: number, skill: Skill, addRangeEffects = false, getEffectsWithIgnoreFilter: (unit: Unit, skill: Skill, addRangeEffects: boolean) => any[]) {
    const unitsCopy = createDeepCopy(units);
    unitsCopy[unitIndex] = {
      ...unitsCopy[unitIndex],
      effects: getEffectsWithIgnoreFilter(unitsCopy[unitIndex], skill, addRangeEffects)
    }
    return unitsCopy[unitIndex];
  }

  addBuffToUnit(units: Unit[], unitIndex: number, skill: Skill) {
    const unitsCopy = createDeepCopy(units);
    if (skill.buffs?.length) {
      unitsCopy[unitIndex] = {
        ...unitsCopy[unitIndex],
        effects: [...unitsCopy[unitIndex].effects, ...(skill.buffs || [])]
      }
    }
    return unitsCopy[unitIndex];
  }

  updateGridUnits(unitsArray: Unit[], gameConfig: any) {
    const gameConfigCopy = createDeepCopy(gameConfig);
    unitsArray.forEach((unit) => {
      gameConfigCopy[unit.x][unit.y] = {...gameConfigCopy[unit.x][unit.y], entity: unit}
    })
    return gameConfigCopy;
  }
}
