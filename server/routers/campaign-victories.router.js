'use strict';

const express = require('express');
const {
  getOrCreateVictoriesUser,
  writeVictories,
  isValidDifficulty,
} = require('../storage/campaign-victories-storage');

const router = express.Router();

// GET /api/campaign-victories/:userId
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateVictoriesUser(userId);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign-victories/:userId/increment
// Body: { difficulty: 'easy' | 'normal' | 'hard' | 'very_hard' }
router.post('/:userId/increment', (req, res) => {
  try {
    const { userId } = req.params;
    const { difficulty } = req.body;

    if (!isValidDifficulty(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty', difficulty });
    }

    const { store, user } = getOrCreateVictoriesUser(userId);

    user.difficulties[difficulty] += 1;

    const idx = store.victories.findIndex(u => u.userId === userId);

    store.victories[idx] = user;
    writeVictories(store);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign-victories/:userId/decrement
// Body: { difficulty: 'easy' | 'normal' | 'hard' | 'very_hard', amount: number }
router.post('/:userId/decrement', (req, res) => {
  try {
    const { userId } = req.params;
    const { difficulty, amount = 10 } = req.body;

    if (!isValidDifficulty(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty', difficulty });
    }

    const { store, user } = getOrCreateVictoriesUser(userId);

    user.difficulties[difficulty] = Math.max(0, user.difficulties[difficulty] - amount);

    const idx = store.victories.findIndex(u => u.userId === userId);

    store.victories[idx] = user;
    writeVictories(store);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

module.exports = router;
