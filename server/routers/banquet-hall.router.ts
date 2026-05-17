import { Router, type Request, type Response } from 'express';

import {
  getOrCreateBanquetUser,
  getOrCreateHeroProgress,
  isFinalBoss,
  isValidBanquetBattleId,
  parseBanquetBattleId,
  writeBanquetProgress,
} from '../storage/banquet-hall-storage';

const router = Router();

/**
 * GET /api/banquet-hall/progress/:userId
 * Returns the full banquet hall progress for a user.
 */
router.get('/progress/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateBanquetUser(userId as string);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

/**
 * GET /api/banquet-hall/progress/:userId/:heroName
 * Returns the battle progress for a specific hero.
 */
router.get('/progress/:userId/:heroName', (req: Request, res: Response) => {
  try {
    const { userId, heroName } = req.params;
    const { user } = getOrCreateBanquetUser(userId as string);
    const hero = user.heroes.find(h => h.heroName === heroName);

    res.json(hero ?? { heroName, completedBattles: [`banquet-${heroName}-s0-b0`] });
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

/**
 * POST /api/banquet-hall/progress/:userId/complete-battle
 * Marks a battle as completed for a hero.
 *
 * Rules:
 * - battleId must match format: banquet-{heroName}-s{0-4}-b{0-5}
 * - Each battle can only be completed once, EXCEPT the final boss (s4-b5)
 *   which is always replayable (returns success without re-adding to completedBattles)
 * - A battle can only be started if the previous battle in sequence is completed
 *   (or it's the first battle s0-b0)
 */
router.post('/progress/:userId/complete-battle', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { battleId } = req.body as { battleId: string };

    if (!isValidBanquetBattleId(battleId)) {
      res.status(400).json({ error: 'Invalid battleId format', battleId });

      return;
    }

    const parsed = parseBanquetBattleId(battleId);

    if (!parsed) {
      res.status(400).json({ error: 'Failed to parse battleId', battleId });

      return;
    }

    const { heroName, screenIndex, battleIndex } = parsed;
    const { store, user } = getOrCreateBanquetUser(userId as string);
    const hero = getOrCreateHeroProgress(user, heroName);

    // Final boss (s4-b5) is always replayable — never block, never re-add
    if (isFinalBoss(screenIndex, battleIndex)) {
      res.json(user);

      return;
    }

    // Check if already completed (non-final-boss battles are one-time only)
    if (hero.completedBattles.includes(battleId)) {
      res.status(409).json({
        error: 'Battle already completed',
        battleId,
      });

      return;
    }

    // Check sequential order: battle must be the next one in sequence
    const expectedBattleId = getNextExpectedBattleId(heroName, hero.completedBattles);

    if (battleId !== expectedBattleId) {
      res.status(409).json({
        error: 'Battle out of order',
        expected: expectedBattleId,
        received: battleId,
      });

      return;
    }

    // Mark as completed
    hero.completedBattles.push(battleId);

    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = user;
    writeBanquetProgress(store);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

/**
 * Determines the next expected battleId in sequence for a hero.
 * Sequence: s0-b0 → s0-b1 → ... → s0-b5 → s1-b0 → ... → s4-b4
 * (s4-b5 is the final boss and is always replayable, not tracked here)
 */
function getNextExpectedBattleId(heroName: string, completedBattles: string[]): string {
  // Total battles before final boss: 5 screens × 6 battles = 30, minus the final boss = 29
  // But we track all 30 (s0b0..s4b5 minus s4b5 = s0b0..s4b4 = 29 battles + s4b5 is free)
  // Sequence: screen 0-4, battle 0-5, but skip s4-b5 (final boss, always free)

  for (let s = 0; s <= 4; s++) {
    const maxBattle = s === 4 ? 4 : 5; // screen 4: battles 0-4 only (b5 is final boss, free)

    for (let b = 0; b <= maxBattle; b++) {
      const id = `banquet-${heroName}-s${s}-b${b}`;

      if (!completedBattles.includes(id)) {
        return id;
      }
    }
  }

  // All non-final-boss battles completed — only final boss remains (always free)
  return `banquet-${heroName}-s4-b5`;
}

export default router;
