'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4568;
const PROGRESS_FILE = path.join(__dirname, 'campaign-progress.json');

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// --- Init storage ---
if (!fs.existsSync(PROGRESS_FILE)) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ progress: [] }, null, 2), 'utf8');
}

// --- Constants ---
const DIFFICULTY_ORDER = ['easy', 'normal', 'hard', 'very_hard'];

const BATTLE_ID_REGEX = /^(easy|normal|hard|very_hard)-s[0-4]-b[0-5]$/;

// --- Pure logic functions ---

/**
 * @param {string} battleId
 * @returns {{ difficulty: string, screenIndex: number, battleIndex: number } | null}
 */
function parseBattleId(battleId) {
  if (!isValidBattleId(battleId)) return null;

  const parts = battleId.split('-');
  // difficulty may be "very_hard" (two parts) or single word
  const bPart = parts[parts.length - 1]; // e.g. "b3"
  const sPart = parts[parts.length - 2]; // e.g. "s2"
  const difficulty = parts.slice(0, parts.length - 2).join('-'); // e.g. "very_hard"

  return {
    difficulty,
    screenIndex: parseInt(sPart.slice(1), 10),
    battleIndex: parseInt(bPart.slice(1), 10),
  };
}

/**
 * @param {string} battleId
 * @returns {boolean}
 */
function isValidBattleId(battleId) {
  return BATTLE_ID_REGEX.test(battleId);
}

/**
 * @param {object} userProgress
 * @param {string} difficulty
 * @param {number} screenIndex
 * @param {number} battleIndex
 * @returns {object} updated UserProgress
 */
function nextProgress(userProgress, difficulty, screenIndex, battleIndex) {
  const updated = JSON.parse(JSON.stringify(userProgress));

  if (battleIndex < 5) {
    updated.difficulties[difficulty] = { screenIndex, battleIndex: battleIndex + 1 };
  } else if (battleIndex === 5 && screenIndex < 4) {
    updated.difficulties[difficulty] = { screenIndex: screenIndex + 1, battleIndex: 0 };
  } else if (battleIndex === 5 && screenIndex === 4) {
    const currentIdx = DIFFICULTY_ORDER.indexOf(difficulty);
    const nextDifficulty = DIFFICULTY_ORDER[currentIdx + 1];

    if (!nextDifficulty) {
      // very_hard fully completed — no change
      return updated;
    }

    updated.difficulties[nextDifficulty] = { screenIndex: 0, battleIndex: 0 };

    if (!updated.unlockedDifficulties.includes(nextDifficulty)) {
      updated.unlockedDifficulties = [...updated.unlockedDifficulties, nextDifficulty];
    }
  }

  return updated;
}

// --- Storage helpers ---

function readProgress() {
  const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');

  return JSON.parse(raw);
}

function writeProgress(data) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createInitialUserProgress(userId) {
  return {
    userId,
    unlockedDifficulties: ['easy'],
    difficulties: {
      easy: { screenIndex: 0, battleIndex: 0 },
      normal: { screenIndex: 0, battleIndex: 0 },
      hard: { screenIndex: 0, battleIndex: 0 },
      very_hard: { screenIndex: 0, battleIndex: 0 },
    },
  };
}

function getOrCreateUser(userId) {
  const store = readProgress();
  let user = store.progress.find(u => u.userId === userId);

  if (!user) {
    user = createInitialUserProgress(userId);
    store.progress.push(user);
    writeProgress(store);
  }

  return { store, user };
}

// --- Endpoints ---

// GET /api/campaign/progress/:userId
app.get('/api/campaign/progress/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { user } = getOrCreateUser(userId);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/campaign/progress/:userId/complete-battle
app.post('/api/campaign/progress/:userId/complete-battle', (req, res) => {
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

// --- Start ---
app.listen(PORT, () => {
  console.log(`Campaign Progress Server running on http://localhost:${PORT}`);
});

module.exports = { parseBattleId, isValidBattleId, nextProgress };
