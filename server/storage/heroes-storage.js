'use strict';

const fs = require('fs');
const path = require('path');

const HEROES_FILE = path.join(__dirname, '../db/heroes-progress.json');

// All hero names from HeroesNamesCodes enum — must stay in sync with unit.model.ts
const ALL_HERO_NAMES = [
  'Daenerys Targaryen (Lady of Dragonstone)',
  'Red Keep Alchemist',
  'Targaryen Knight',
  'White Wolf',
  'Priest',
  'Brown Wolf',
  'Ice River Hunter',
  'Relina Snow',
  'Archer of the Free Folk',
  'Giant',
  'Night King',
  'General Walker',
  'Captain Walker',
  'Jon Snow (King in the North)',
  'Gromirt Flame',
  'Ranger',
];

// --- Init storage ---
function initHeroesStorage() {
  if (!fs.existsSync(HEROES_FILE)) {
    fs.writeFileSync(HEROES_FILE, JSON.stringify({ progress: [] }, null, 2), 'utf8');
  }
}

// --- Storage helpers ---

function readHeroesProgress() {
  const raw = fs.readFileSync(HEROES_FILE, 'utf8');

  return JSON.parse(raw);
}

function writeHeroesProgress(data) {
  fs.writeFileSync(HEROES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Creates initial heroes progress for a new user.
 * All heroes start as locked with base config.
 * @param {string} userId
 * @returns {{ userId: string, heroes: object[] }}
 */
function createInitialHeroesProgress(userId) {
  return {
    userId,
    heroes: ALL_HERO_NAMES.map(heroName => ({
      heroName,
      isUnlocked: false,
      level: 1,
      rank: 1,
      eq1Level: 1,
      eq2Level: 1,
      eq3Level: 1,
      eq4Level: 1,
      shards: 0,
    })),
  };
}

/**
 * Gets existing user progress or creates a new record.
 * @param {string} userId
 * @returns {{ store: object, user: object }}
 */
function getOrCreateHeroesUser(userId) {
  const store = readHeroesProgress();
  let user = store.progress.find(u => u.userId === userId);

  if (!user) {
    user = createInitialHeroesProgress(userId);
    store.progress.push(user);
    writeHeroesProgress(store);
  } else {
    // Lazy migration: add shards: 0 to heroes missing the field
    let migrated = false;

    user.heroes.forEach(hero => {
      if (hero.shards === undefined) {
        hero.shards = 0;
        migrated = true;
      }
    });

    if (migrated) {
      writeHeroesProgress(store);
    }
  }

  return { store, user };
}

/**
 * Validates a hero progress patch object.
 * @param {object} patch
 * @returns {{ valid: boolean, error?: string, field?: string, value?: number }}
 */
function validateHeroProgressPatch(patch) {
  if (patch.level !== undefined) {
    if (!Number.isInteger(patch.level) || patch.level < 1 || patch.level > 100) {
      return { valid: false, error: 'Validation error', field: 'level', value: patch.level };
    }
  }

  if (patch.rank !== undefined) {
    if (!Number.isInteger(patch.rank) || patch.rank < 1 || patch.rank > 6) {
      return { valid: false, error: 'Validation error', field: 'rank', value: patch.rank };
    }
  }

  for (const eqField of ['eq1Level', 'eq2Level', 'eq3Level', 'eq4Level']) {
    if (patch[eqField] !== undefined) {
      if (!Number.isInteger(patch[eqField]) || patch[eqField] < 1 || patch[eqField] > 200) {
        return { valid: false, error: 'Validation error', field: eqField, value: patch[eqField] };
      }
    }
  }

  return { valid: true };
}

module.exports = {
  ALL_HERO_NAMES,
  initHeroesStorage,
  readHeroesProgress,
  writeHeroesProgress,
  createInitialHeroesProgress,
  getOrCreateHeroesUser,
  validateHeroProgressPatch,
};
