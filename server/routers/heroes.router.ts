import { Router, type Request, type Response } from 'express';

import type { HeroProgressPatch } from '../types';
import {
  ALL_HERO_NAMES,
  getOrCreateHeroesUser,
  validateHeroProgressPatch,
  writeHeroesProgress,
} from '../storage/heroes-storage';

const router = Router();

// GET /api/heroes/progress/:userId
router.get('/progress/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateHeroesUser(userId);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/heroes/progress/:userId/unlock
// Body: { heroName: string }
router.post('/progress/:userId/unlock', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { heroName } = req.body as { heroName: string };

    if (!heroName || !ALL_HERO_NAMES.includes(heroName)) {
      res.status(400).json({ error: 'Invalid heroName', heroName });

      return;
    }

    const { store, user } = getOrCreateHeroesUser(userId);
    const heroRecord = user.heroes.find(h => h.heroName === heroName);

    if (!heroRecord) {
      res.status(404).json({ error: 'Hero record not found', heroName });

      return;
    }

    if (heroRecord.isUnlocked) {
      res.status(409).json({ error: 'Hero already unlocked', heroName });

      return;
    }

    heroRecord.isUnlocked = true;
    heroRecord.shards -= 100;

    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = user;
    writeHeroesProgress(store);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// PATCH /api/heroes/progress/:userId/update
// Body: { heroName: string, patch: HeroProgressPatch }
router.patch('/progress/:userId/update', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { heroName, patch } = req.body as { heroName: string; patch: HeroProgressPatch };

    if (!heroName || !ALL_HERO_NAMES.includes(heroName)) {
      res.status(400).json({ error: 'Invalid heroName', heroName });

      return;
    }

    if (!patch || typeof patch !== 'object') {
      res.status(400).json({ error: 'Missing or invalid patch body' });

      return;
    }

    const { store, user } = getOrCreateHeroesUser(userId);
    const heroRecord = user.heroes.find(h => h.heroName === heroName);

    if (!heroRecord) {
      res.status(404).json({ error: 'User not found or hero record missing', heroName });

      return;
    }

    if (!heroRecord.isUnlocked) {
      res.status(403).json({ error: 'Hero is locked', heroName });

      return;
    }

    const validation = validateHeroProgressPatch(patch);

    if (!validation.valid) {
      res.status(400).json({
        error: validation.error,
        field: validation.field,
        value: validation.value,
      });

      return;
    }

    const allowedFields = [
      'level',
      'rank',
      'eq1Level',
      'eq2Level',
      'eq3Level',
      'eq4Level',
      'shards',
    ] as const;

    for (const field of allowedFields) {
      if (patch[field] !== undefined) {
        heroRecord[field] = patch[field] as never;
      }
    }

    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = user;
    writeHeroesProgress(store);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// PATCH /api/heroes/progress/:userId/shards
// Body: { heroName: string, amount: number }
router.patch('/progress/:userId/shards', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { heroName, amount } = req.body as { heroName: string; amount: number };

    if (!heroName || !ALL_HERO_NAMES.includes(heroName)) {
      res.status(400).json({ error: 'Invalid heroName' });

      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });

      return;
    }

    const { store, user } = getOrCreateHeroesUser(userId);
    const heroRecord = user.heroes.find(h => h.heroName === heroName);

    if (!heroRecord) {
      res.status(404).json({ error: 'Hero record not found', heroName });

      return;
    }

    heroRecord.shards = (heroRecord.shards ?? 0) + amount;

    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = user;
    writeHeroesProgress(store);

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

export default router;
