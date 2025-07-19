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
  return skill.imgSrc + index;
}

export function trackByEffect(index: number, effect: Effect) {
  return effect.type + index;
}

export function trackByUnit(index: number, unit: Unit) {
  return unit.name + unit.user;
}

export function trackByStringContent(index: number, content: string) {
  return content + index;
}

export function trackByRoute(index: number, route: route) {
  return route.name + index;
}

export function trackByLevel(index: number, content: {level: number}) {
  return content.level + index;
}
