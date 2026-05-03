import { Router, type Request, type Response } from 'express';
import { getOrCreatePlayerLevel, updatePlayerLevel } from '../storage/player-level-storage';

const router = Router();

const MAX_LEVEL = 60;

// GET /api/player-level/:userId
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const record = getOrCreatePlayerLevel(userId as string);

    res.json(record);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// PUT /api/player-level/:userId
router.put('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { level, xp } = req.body as { level: unknown; xp: unknown };

    if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
      res.status(400).json({ error: `level must be an integer between 1 and ${MAX_LEVEL}` });

      return;
    }

    if (typeof xp !== 'number' || !Number.isFinite(xp) || xp < 0) {
      res.status(400).json({ error: 'xp must be a non-negative number' });

      return;
    }

    const record = updatePlayerLevel(userId as string, level, Math.floor(xp));

    res.json(record);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

export default router;
