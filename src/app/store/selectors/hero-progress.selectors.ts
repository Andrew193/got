import { createSelector } from '@ngrx/store';
import { HeroesNamesCodes, UnitConfig } from '../../models/units-related/unit.model';
import { HeroProgressFeature } from '../reducers/hero-progress.reducer';

export const selectPlayerHeroesProgress = HeroProgressFeature.selectProgress;

export const selectUnlockedHeroes = createSelector(selectPlayerHeroesProgress, progress => {
  if (!progress) {
    return [];
  }

  return progress.heroes.filter(h => h.isUnlocked);
});

export const selectHeroConfig = (heroName: HeroesNamesCodes) =>
  createSelector(selectPlayerHeroesProgress, (progress): UnitConfig | null => {
    if (!progress) {
      return null;
    }

    const record = progress.heroes.find(h => h.heroName === heroName);

    if (!record || !record.isUnlocked) {
      return null;
    }

    return {
      level: record.level,
      rank: record.rank,
      eq1Level: record.eq1Level,
      eq2Level: record.eq2Level,
      eq3Level: record.eq3Level,
      eq4Level: record.eq4Level,
    };
  });

export const selectIsHeroUnlocked = (heroName: HeroesNamesCodes) =>
  createSelector(
    selectPlayerHeroesProgress,
    progress => progress?.heroes.find(h => h.heroName === heroName)?.isUnlocked ?? false,
  );
