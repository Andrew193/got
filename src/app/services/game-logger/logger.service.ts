import {Injectable} from '@angular/core';
import {Skill} from "../../models/skill.model";
import {Effect} from "../../models/effect.model";
import {Unit} from "../../models/unit.model";
import {LogRecord} from "../../interface";

@Injectable({
  providedIn: 'root'
})
export class GameLoggerService {

  constructor() {
  }

  logEvent(props: {
    damage: number | null,
    newHealth: number | null,
    addDmg?: number,
    battleMode: boolean
  }, isUser: boolean, skill: Skill | Effect, dmgTaker: Unit, message?: string): LogRecord {
    const logMsg = (mgs: string) => {
      if (!props.battleMode) {
        mgs = `${!isUser ? 'Player' : 'Bot'} ${dmgTaker.name} (${dmgTaker.x + 1})(${dmgTaker.y + 1}) has been opened/collected!`;
      }
      return {
        isUser: isUser, imgSrc: skill.imgSrc,
        message: mgs
      }
    }

    if (message) {
      return logMsg(message);
    } else {
      if (props.addDmg) {
        return logMsg(`${isUser ? 'Player' : 'Bot'} ${dmgTaker.name} received ${props.addDmg}. ! additional DMG from debuff ${(skill as Effect).type}`)
      }
      if (props.damage) {
        return logMsg(message || `${!isUser ? 'Player' : 'Bot'} ${dmgTaker.name} (${dmgTaker.x + 1})(${dmgTaker.y + 1}) received ${props.damage}. DMG!`)
      }
      if (props.newHealth === 0 && props.battleMode) {
        return logMsg(message || `${!isUser ? 'Player' : 'Bot'} ${dmgTaker.name} (${dmgTaker.x + 1})(${dmgTaker.y + 1}) went to the seven!`)
      }
    }

    return {message: '', isUser: false, imgSrc: ''};
  }
}
