import fs from 'fs';
import path from 'path';

import type {
  HeroProgressPatch,
  HeroProgressRecord,
  HeroesStore,
  UserHeroesProgress,
  ValidationResult,
} from '../types';

const HEROES_FILE = path.join(__dirname, '../db/heroes-progress.json');

// All hero names from HeroesNamesCodes enum — must stay in sync with unit.model.ts
export const ALL_HERO_NAMES: string[] = [
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

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initHeroesStorage(): void {
  if (!fs.existsSync(HEROES_FILE)) {
    fs.writeFileSync(HEROES_FILE, JSON.stringify({ progress: [] }, null, 2), 'utf8');
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function readHeroesProgress(): HeroesStore {
  const raw = fs.readFileSync(HEROES_FILE, 'utf8');

  return JSON.parse(raw) as HeroesStore;
}

export function writeHeroesProgress(data: HeroesStore): void {
  fs.writeFileSync(HEROES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createInitialHeroesProgress(userId: string): UserHeroesProgress {
  return {
    userId,
    heroes: ALL_HERO_NAMES.map(
      (heroName): HeroProgressRecord => ({
        heroName,
        isUnlocked: false,
        level: 1,
        rank: 1,
        eq1Level: 1,
        eq2Level: 1,
        eq3Level: 1,
        eq4Level: 1,
        shards: 0,
      }),
    ),
  };
}

export function getOrCreateHeroesUser(userId: string): {
  store: HeroesStore;
  user: UserHeroesProgress;
} {
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

export function validateHeroProgressPatch(patch: HeroProgressPatch): ValidationResult {
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

  for (const eqField of ['eq1Level', 'eq2Level', 'eq3Level', 'eq4Level'] as const) {
    if (patch[eqField] !== undefined) {
      if (!Number.isInteger(patch[eqField]) || patch[eqField]! < 1 || patch[eqField]! > 200) {
        return { valid: false, error: 'Validation error', field: eqField, value: patch[eqField] };
      }
    }
  }

  return { valid: true };
}
