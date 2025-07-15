import {Skill} from "./models/skill.model";
import {Unit} from "./models/unit.model";
import {route} from "./pages/lobby/lobby.component";
import {Effect} from "./models/effect.model";

export function createDeepCopy(object: { [key: string]: any }) {
  return JSON.parse(JSON.stringify(object))
}

export function trackByIndex(index: number) {
  return index;
}

export function trackBySkill(index: number, skill: Skill) {
  return skill.imgSrc;
}

export function trackByEffect(index: number, effect: Effect) {
  return effect.type;
}

export function trackByUnit(index: number, unit: Unit) {
  console.log(index, unit)
  return unit.name;
}

export function trackByStringContent(index: number, content: string) {
  return content;
}

export function trackByRoute(index: number, route: route) {
  return route.name;
}

export function trackByLevel(index: number, content: {level: number}) {
  return content.level;
}
