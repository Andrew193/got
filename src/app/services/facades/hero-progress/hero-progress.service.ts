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

  override url = '/api/heroes/progress';
  override iniConfig = {};

  /**
   * Override getConfig to match our server's response shape.
   * The server returns a single PlayerHeroesProgress object (not an array),
   * and creates the record automatically if it doesn't exist.
   */
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

  /**
   * Override initConfigForNewUser — our server auto-creates the record on GET,
   * so we just call getConfig with a no-op callback.
   */
  override initConfigForNewUser(userId: string) {
    return this.http.get<PlayerHeroesProgress>(`${this.url}/${userId}`).pipe(
      tap({
        next: data => {
          this.store.dispatch(HeroProgressActions.loadProgressSuccess({ data }));
        },
      }),
    );
  }

  /**
   * Returns the shard cost for unlocking or ranking up a hero.
   * Formula: rank * 100
   */
  getUnlockCost(rank: number): number {
    return rank * 100;
  }

  /**
   * Unlocks a hero for the current user.
   */
  unlockHero(userId: string, heroName: HeroesNamesCodes): Observable<PlayerHeroesProgress> {
    return this.http.post<PlayerHeroesProgress>(`${this.url}/${userId}/unlock`, { heroName }).pipe(
      tap({
        next: data => {
          this.store.dispatch(HeroProgressActions.unlockHeroSuccess({ data }));
        },
      }),
    );
  }

  /**
   * Updates hero progress fields (level, rank, equipment levels).
   * Validates ranges before sending to server.
   */
  updateHeroProgress(
    userId: string,
    heroName: HeroesNamesCodes,
    patch: Partial<
      Pick<HeroProgressRecord, 'level' | 'rank' | 'eq1Level' | 'eq2Level' | 'eq3Level' | 'eq4Level'>
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

  /**
   * Extracts a UnitConfig from a HeroProgressRecord.
   */
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
