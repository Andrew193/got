import { ChangeDetectorRef, Component, inject, output } from '@angular/core';
import { GameFieldService } from '../../../services/game-related/game-field/game-field.service';
import { UnitService } from '../../../services/unit/unit.service';
import { EffectsService } from '../../../services/effects/effects.service';
import { GameService } from '../../../services/game-related/game-action/game.service';
import { BasicGameFieldComposition } from './basic-game-field-composition';
import { GameResultsRedirectType } from '../../../models/field.model';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-basic-game-field',
  template: '',
})
export abstract class BasicGameFieldComponent extends BasicGameFieldComposition {
  override cdRef = inject(ChangeDetectorRef);
  override battleEndFlag = output<Parameters<GameResultsRedirectType>>();

  constructor(
    fieldService: GameFieldService,
    unitService: UnitService,
    eS: EffectsService,
    gameActionService: GameService,
    store: Store,
  ) {
    super(fieldService, unitService, eS, gameActionService, store);
  }
}
