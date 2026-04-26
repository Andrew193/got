import fs from 'fs';
import path from 'path';

import type { Difficulty, UserVictories, VictoriesStore } from '../types';

const VICTORIES_FILE = path.join(__dirname, '../db/campaign-victories.json');

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'very_hard'];

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initVictoriesStorage(): void {
  if (!fs.existsSync(VICTORIES_FILE)) {
    fs.writeFileSync(VICTORIES_FILE, JSON.stringify({ victories: [] }, null, 2), 'utf8');
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function readVictories(): VictoriesStore {
  const raw = fs.readFileSync(VICTORIES_FILE, 'utf8');

  return JSON.parse(raw) as VictoriesStore;
}

export function writeVictories(data: VictoriesStore): void {
  fs.writeFileSync(VICTORIES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createInitialVictories(userId: string): UserVictories {
  return {
    userId,
    difficulties: {
      easy: 0,
      normal: 0,
      hard: 0,
      very_hard: 0,
    },
  };
}

export function getOrCreateVictoriesUser(userId: string): {
  store: VictoriesStore;
  user: UserVictories;
} {
  const store = readVictories();
  let user = store.victories.find(u => u.userId === userId);

  if (!user) {
    user = createInitialVictories(userId);
    store.victories.push(user);
    writeVictories(store);
  }

  return { store, user };
}

export function isValidDifficulty(difficulty: string): difficulty is Difficulty {
  return (DIFFICULTIES as string[]).includes(difficulty);
}
