'use strict';

const express = require('express');
const {
  isValidBattleId,
  parseBattleId,
  getOrCreateUser,
  nextProgress,
  writeProgress,
} = require('../storage/campaign-storage');

const router = express.Router();

// GET /api/campaign/progress/:userId
router.get('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateUser(userId);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign/progress/:userId/complete-battle
router.post('/progress/:userId/complete-battle', (req, res) => {
  try {
    const { userId } = req.params;
    const { battleId } = req.body;

    if (!isValidBattleId(battleId)) {
      return res.status(400).json({ error: 'Invalid battleId format', battleId });
    }

    const { difficulty, screenIndex, battleIndex } = parseBattleId(battleId);
    const { store, user } = getOrCreateUser(userId);

    const diffProgress = user.difficulties[difficulty];
    const expectedBattleId = `${difficulty}-s${diffProgress.screenIndex}-b${diffProgress.battleIndex}`;

    if (battleId !== expectedBattleId) {
      return res.status(409).json({
        error: 'Battle out of order',
        expected: expectedBattleId,
        received: battleId,
      });
    }

    const updatedUser = nextProgress(user, difficulty, screenIndex, battleIndex);
    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = updatedUser;
    writeProgress(store);

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

module.exports = router;
