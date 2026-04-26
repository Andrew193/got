import { Router, type Request, type Response } from 'express';

import type { Difficulty } from '../types';
import {
  getOrCreateVictoriesUser,
  isValidDifficulty,
  writeVictories,
} from '../storage/campaign-victories-storage';

const router = Router();

// GET /api/campaign-victories/:userId
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateVictoriesUser(userId);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign-victories/:userId/increment
// Body: { difficulty: Difficulty }
router.post('/:userId/increment', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { difficulty } = req.body as { difficulty: string };

    if (!isValidDifficulty(difficulty)) {
      res.status(400).json({ error: 'Invalid difficulty', difficulty });

      return;
    }

    const { store, user } = getOrCreateVictoriesUser(userId);

    user.difficulties[difficulty as Difficulty] += 1;

    const idx = store.victories.findIndex(u => u.userId === userId);

    store.victories[idx] = user;
    writeVictories(store);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign-victories/:userId/decrement
// Body: { difficulty: Difficulty, amount?: number }
router.post('/:userId/decrement', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { difficulty, amount = 10 } = req.body as { difficulty: string; amount?: number };

    if (!isValidDifficulty(difficulty)) {
      res.status(400).json({ error: 'Invalid difficulty', difficulty });

      return;
    }

    const { store, user } = getOrCreateVictoriesUser(userId);

    user.difficulties[difficulty as Difficulty] = Math.max(
      0,
      user.difficulties[difficulty as Difficulty] - amount,
    );

    const idx = store.victories.findIndex(u => u.userId === userId);

    store.victories[idx] = user;
    writeVictories(store);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

export default router;
