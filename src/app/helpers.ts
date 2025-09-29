import { Skill } from './models/skill.model';
import { Unit } from './models/unit.model';
import { route } from './pages/lobby/lobby.component';

export function createDeepCopy<T>(object: T) {
  return JSON.parse(JSON.stringify(object)) as T;
}

export function trackByIndex(index: number) {
  return index;
}

export function trackBySkill(index: number, skill: Skill) {
  return skill.name + index;
}

export function trackByFullUnit(index: number, unit: Unit) {
  return unit.name + unit.user;
}

export function trackByRoute(index: number, route: route) {
  return route.name + index;
}

export function trackByLevel(index: number, content: { level: number }) {
  return content.level + index;
}
