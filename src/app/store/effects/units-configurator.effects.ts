import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UnitsConfiguratorFeatureActions } from '../actions/units-configurator.actions';
import { map } from 'rxjs';
import { HeroesSelectActions } from '../actions/heroes-select.actions';
import { HeroesSelectNames } from '../../constants';

@Injectable()
export class UnitsConfiguratorEffects {
  actions$ = inject(Actions);

  cleanSelectionAfterDrop = createEffect(() => {
    return this.actions$.pipe(
      ofType(UnitsConfiguratorFeatureActions.drop),
      map(action =>
        HeroesSelectActions.resetHeroCollection({
          collections: action.collections || [
            HeroesSelectNames.aiCollection,
            HeroesSelectNames.userCollection,
          ],
        }),
      ),
    );
  });
}
