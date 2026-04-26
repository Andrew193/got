import { Router, type Request, type Response } from 'express';

import {
  getOrCreateUser,
  isValidBattleId,
  nextProgress,
  parseBattleId,
  writeProgress,
} from '../storage/campaign-storage';

const router = Router();

// GET /api/campaign/progress/:userId
router.get('/progress/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateUser(userId);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign/progress/:userId/complete-battle
router.post('/progress/:userId/complete-battle', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { battleId } = req.body as { battleId: string };

    if (!isValidBattleId(battleId)) {
      res.status(400).json({ error: 'Invalid battleId format', battleId });

      return;
    }

    const parsed = parseBattleId(battleId)!;
    const { difficulty, screenIndex, battleIndex } = parsed;
    const { store, user } = getOrCreateUser(userId);

    const diffProgress = user.difficulties[difficulty];
    const expectedBattleId = `${difficulty}-s${diffProgress.screenIndex}-b${diffProgress.battleIndex}`;

    // Check if the battle is already completed (replay allowed)
    const isAlreadyCompleted =
      screenIndex < diffProgress.screenIndex ||
      (screenIndex === diffProgress.screenIndex && battleIndex < diffProgress.battleIndex);

    if (isAlreadyCompleted) {
      // Replay of a completed battle — return current progress without advancing
      res.json(user);

      return;
    }

    if (battleId !== expectedBattleId) {
      res.status(409).json({
        error: 'Battle out of order',
        expected: expectedBattleId,
        received: battleId,
      });

      return;
    }

    const updatedUser = nextProgress(user, difficulty, screenIndex, battleIndex);
    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = updatedUser;
    writeProgress(store);

    res.json(updatedUser);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

export default router;
