import { createSelector } from '@ngrx/store';
import { PlayerLevelFeature } from '../reducers/player-level.reducer';
import { MAX_PLAYER_LEVEL, XP_TABLE } from '../../constants/player-level.constants';

export const selectPlayerLevel = PlayerLevelFeature.selectLevel;
export const selectPlayerXp = PlayerLevelFeature.selectXp;
export const selectPlayerLevelLoaded = PlayerLevelFeature.selectLoaded;

export const selectXpForNextLevel = createSelector(
  selectPlayerLevel,
  selectPlayerXp,
  (level, xp) => (level >= MAX_PLAYER_LEVEL ? 0 : XP_TABLE[level] - xp),
);

export const selectXpProgress = createSelector(selectPlayerLevel, selectPlayerXp, (level, xp) => {
  if (level >= MAX_PLAYER_LEVEL) {
    return 1;
  }

  const from = XP_TABLE[level - 1];
  const to = XP_TABLE[level];

  return (xp - from) / (to - from);
});

export const selectPlayerLevelViewModel = createSelector(
  selectPlayerLevel,
  selectPlayerXp,
  selectXpForNextLevel,
  selectXpProgress,
  (level, xp, xpForNext, progress) => ({ level, xp, xpForNext, progress }),
);

export const selectCanAccessActivity = (requiredLevel: number) =>
  createSelector(selectPlayerLevel, level => level >= requiredLevel);
