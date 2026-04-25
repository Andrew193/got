'use strict';

const express = require('express');
const {
  ALL_HERO_NAMES,
  getOrCreateHeroesUser,
  writeHeroesProgress,
  validateHeroProgressPatch,
} = require('../storage/heroes-storage');

const router = express.Router();

// GET /api/heroes/progress/:userId
// Returns PlayerHeroesProgress, creates initial record if not exists
router.get('/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateHeroesUser(userId);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/heroes/progress/:userId/unlock
// Body: { heroName: string }
// Unlocks a hero (sets isUnlocked: true with base config)
router.post('/progress/:userId/unlock', (req, res) => {
  try {
    const { userId } = req.params;
    const { heroName } = req.body;

    if (!heroName || !ALL_HERO_NAMES.includes(heroName)) {
      return res.status(400).json({ error: 'Invalid heroName', heroName });
    }

    const { store, user } = getOrCreateHeroesUser(userId);
    const heroRecord = user.heroes.find(h => h.heroName === heroName);

    if (!heroRecord) {
      return res.status(404).json({ error: 'Hero record not found', heroName });
    }

    if (heroRecord.isUnlocked) {
      return res.status(409).json({ error: 'Hero already unlocked', heroName });
    }

    heroRecord.isUnlocked = true;
    heroRecord.level = 1;
    heroRecord.rank = 1;
    heroRecord.eq1Level = 1;
    heroRecord.eq2Level = 1;
    heroRecord.eq3Level = 1;
    heroRecord.eq4Level = 1;

    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = user;
    writeHeroesProgress(store);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// PATCH /api/heroes/progress/:userId/update
// Body: { heroName: string, patch: Partial<HeroProgressRecord> }
// Updates level, rank, or equipment levels for an unlocked hero
router.patch('/progress/:userId/update', (req, res) => {
  try {
    const { userId } = req.params;
    const { heroName, patch } = req.body;

    if (!heroName || !ALL_HERO_NAMES.includes(heroName)) {
      return res.status(400).json({ error: 'Invalid heroName', heroName });
    }

    if (!patch || typeof patch !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid patch body' });
    }

    const { store, user } = getOrCreateHeroesUser(userId);
    const heroRecord = user.heroes.find(h => h.heroName === heroName);

    if (!heroRecord) {
      return res.status(404).json({ error: 'User not found or hero record missing', heroName });
    }

    if (!heroRecord.isUnlocked) {
      return res.status(403).json({ error: 'Hero is locked', heroName });
    }

    const validation = validateHeroProgressPatch(patch);

    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        field: validation.field,
        value: validation.value,
      });
    }

    const allowedFields = ['level', 'rank', 'eq1Level', 'eq2Level', 'eq3Level', 'eq4Level'];

    for (const field of allowedFields) {
      if (patch[field] !== undefined) {
        heroRecord[field] = patch[field];
      }
    }

    const idx = store.progress.findIndex(u => u.userId === userId);

    store.progress[idx] = user;
    writeHeroesProgress(store);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

module.exports = router;
