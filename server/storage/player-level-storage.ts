import fs from 'fs';
import path from 'path';

import type { PlayerLevelRecord, PlayerLevelStore } from '../types';

const PLAYER_LEVEL_FILE = path.join(__dirname, '../db/player-level.json');

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initPlayerLevelStorage(): void {
  if (!fs.existsSync(PLAYER_LEVEL_FILE)) {
    fs.writeFileSync(
      PLAYER_LEVEL_FILE,
      JSON.stringify({ progress: [] } satisfies PlayerLevelStore, null, 2),
      'utf8',
    );
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readStore(): PlayerLevelStore {
  const raw = fs.readFileSync(PLAYER_LEVEL_FILE, 'utf8');

  return JSON.parse(raw) as PlayerLevelStore;
}

function writeStore(data: PlayerLevelStore): void {
  fs.writeFileSync(PLAYER_LEVEL_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getOrCreatePlayerLevel(userId: string): PlayerLevelRecord {
  const store = readStore();
  let record = store.progress.find(r => r.userId === userId);

  if (!record) {
    record = { userId, level: 1, xp: 0 };
    store.progress.push(record);
    writeStore(store);
  }

  return record;
}

export function updatePlayerLevel(userId: string, level: number, xp: number): PlayerLevelRecord {
  const store = readStore();
  const index = store.progress.findIndex(r => r.userId === userId);

  if (index === -1) {
    const record: PlayerLevelRecord = { userId, level, xp };

    store.progress.push(record);
    writeStore(store);

    return record;
  }

  store.progress[index] = { userId, level, xp };
  writeStore(store);

  return store.progress[index];
}
