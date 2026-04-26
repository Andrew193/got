import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  HeroesNamesCodes,
  HeroProgressRecord,
  PlayerHeroesProgress,
  UnitConfig,
} from '../../../models/units-related/unit.model';
import { HeroProgressActions } from '../../../store/actions/hero-progress.actions';
import { BaseConfigApiService } from '../../abstract/base-config-api/base-config-api.service';

export const HERO_UNLOCK_ERRORS = {
  INSUFFICIENT_SHARDS: 'INSUFFICIENT_SHARDS',
  HERO_ALREADY_UNLOCKED: 'HERO_ALREADY_UNLOCKED',
  HERO_IS_LOCKED: 'HERO_IS_LOCKED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

@Injectable({
  providedIn: 'root',
})
export class HeroProgressService extends BaseConfigApiService<PlayerHeroesProgress> {
  private store = inject(Store);

  protected override url = '/api/heroes/progress';
  protected override iniConfig = {};

  override getConfig(callback: (config: PlayerHeroesProgress) => void) {
    return this.http.get<PlayerHeroesProgress>(`${this.url}/${this.userId}`).pipe(
      tap({
        next: data => {
          callback(data);
          this.store.dispatch(HeroProgressActions.loadProgressSuccess({ data }));
        },
        error: err => {
          const error = err?.message ?? 'Failed to load hero progress';

          this.store.dispatch(HeroProgressActions.loadProgressFailure({ error }));
        },
      }),
    );
  }

  override initConfigForNewUser(userId: string) {
    return this.http.get<PlayerHeroesProgress>(`${this.url}/${userId}`).pipe(
      tap({
        next: data => {
          this.store.dispatch(HeroProgressActions.loadProgressSuccess({ data }));
        },
      }),
    );
  }

  getUnlockCost(rank: number): number {
    return rank * 100;
  }

  unlockHero(userId: string, heroName: HeroesNamesCodes): Observable<PlayerHeroesProgress> {
    return this.http.post<PlayerHeroesProgress>(`${this.url}/${userId}/unlock`, { heroName }).pipe(
      tap({
        next: data => {
          this.store.dispatch(HeroProgressActions.unlockHeroSuccess({ data }));
        },
      }),
    );
  }

  addShards(
    userId: string,
    heroName: HeroesNamesCodes,
    amount: number,
  ): Observable<PlayerHeroesProgress> {
    return this.http
      .patch<PlayerHeroesProgress>(`${this.url}/${userId}/shards`, { heroName, amount })
      .pipe(
        tap({
          next: data => {
            this.store.dispatch(HeroProgressActions.updateHeroSuccess({ data }));
          },
        }),
      );
  }

  updateHeroProgress(
    userId: string,
    heroName: HeroesNamesCodes,
    patch: Partial<
      Pick<
        HeroProgressRecord,
        'level' | 'rank' | 'eq1Level' | 'eq2Level' | 'eq3Level' | 'eq4Level' | 'shards'
      >
    >,
  ): Observable<PlayerHeroesProgress> {
    const validationError = this.validatePatch(patch);

    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.http
      .patch<PlayerHeroesProgress>(`${this.url}/${userId}/update`, { heroName, patch })
      .pipe(
        tap({
          next: data => {
            this.store.dispatch(HeroProgressActions.updateHeroSuccess({ data }));
          },
        }),
      );
  }

  toUnitConfig(record: HeroProgressRecord): UnitConfig {
    return {
      level: record.level,
      rank: record.rank,
      eq1Level: record.eq1Level,
      eq2Level: record.eq2Level,
      eq3Level: record.eq3Level,
      eq4Level: record.eq4Level,
    };
  }

  private validatePatch(
    patch: Partial<
      Pick<HeroProgressRecord, 'level' | 'rank' | 'eq1Level' | 'eq2Level' | 'eq3Level' | 'eq4Level'>
    >,
  ): string | null {
    if (patch.level !== undefined && (patch.level < 1 || patch.level > 100)) {
      return `${HERO_UNLOCK_ERRORS.VALIDATION_ERROR}: level must be between 1 and 100`;
    }

    if (patch.rank !== undefined && (patch.rank < 1 || patch.rank > 6)) {
      return `${HERO_UNLOCK_ERRORS.VALIDATION_ERROR}: rank must be between 1 and 6`;
    }

    for (const eqField of ['eq1Level', 'eq2Level', 'eq3Level', 'eq4Level'] as const) {
      const val = patch[eqField];

      if (val !== undefined && (val < 1 || val > 200)) {
        return `${HERO_UNLOCK_ERRORS.VALIDATION_ERROR}: ${eqField} must be between 1 and 200`;
      }
    }

    return null;
  }
}
