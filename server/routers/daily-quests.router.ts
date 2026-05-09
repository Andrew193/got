import { Router, type Request, type Response } from 'express';

import { QuestId } from '../types';
import { completeQuestInStorage, getOrCreateProgress } from '../storage/daily-quests-storage';

const router = Router();

const VALID_QUEST_IDS: QuestId[] = [
  QuestId.campaign_fight,
  QuestId.campaign_win,
  QuestId.campaign_chest,
  QuestId.boss_fight,
  QuestId.gift_reward,
  QuestId.training_win,
  QuestId.upgrade_equipment,
  QuestId.upgrade_hero_level,
];

// GET /api/daily-quests/:userId
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const progress = getOrCreateProgress(userId as string);

    res.json(progress);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/daily-quests/:userId/complete
// Body: { questId: QuestId }
router.post('/:userId/complete', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { questId } = req.body as { questId: unknown };

    if (typeof questId !== 'string' || !VALID_QUEST_IDS.includes(questId as QuestId)) {
      res.status(400).json({ error: 'Invalid questId' });

      return;
    }

    const progress = completeQuestInStorage(userId as string, questId as QuestId);

    res.json(progress);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
