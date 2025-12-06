import { Component, output } from '@angular/core';
import { GameFieldVars, GameResultsRedirectType } from '../../../models/field.model';

@Component({
  template: '',
})
export abstract class BattleEndBase extends GameFieldVars {
  battleEndFlag = output<Parameters<GameResultsRedirectType>>();
}
