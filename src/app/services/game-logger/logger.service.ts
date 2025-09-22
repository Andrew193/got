import { Injectable } from '@angular/core';
import { Skill } from '../../models/skill.model';
import { Effect } from '../../models/effect.model';
import { Unit } from '../../models/unit.model';
import { LogConfig, LogRecord } from '../../models/logger.model';

@Injectable({
  providedIn: 'root',
})
export class GameLoggerService {
  logEvent(
    props: LogConfig,
    isUser: boolean,
    skill: Skill | Effect,
    unit: Unit,
    message?: string
  ): LogRecord {
    const logMsg = (mgs: string) => {
      if (!props.battleMode) {
        mgs = `${!isUser ? 'Player' : 'Bot'} ${unit.name} (${unit.x + 1})(${unit.y + 1}) has been opened/collected!`;
      }
      return {
        isUser: isUser,
        imgSrc: skill.imgSrc,
        message: mgs,
      };
    };

    if (message) {
      return logMsg(message);
    } else {
      if (props.addDmg) {
        return logMsg(
          `${isUser ? 'Player' : 'Bot'} ${unit.name} received ${props.addDmg}. ! additional DMG from debuff ${(skill as Effect).type}`
        );
      }
      if (props.damage) {
        return logMsg(
          message ||
            `${isUser ? 'Player' : 'Bot'} ${unit.name} (${unit.x + 1})(${unit.y + 1}) received ${props.damage}. DMG!`
        );
      }
      if (props.newHealth === 0 && props.battleMode) {
        return logMsg(
          message ||
            `${isUser ? 'Player' : 'Bot'} ${unit.name} (${unit.x + 1})(${unit.y + 1}) went to the seven!`
        );
      }
    }

    return { message: '', isUser: false, imgSrc: '' };
  }
}
