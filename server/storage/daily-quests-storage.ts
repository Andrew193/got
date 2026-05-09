import fs from 'fs';
import path from 'path';

import moment from 'moment';

import { QuestId, type DailyQuestsStore, type QuestProgress } from '../types';
import { DAILY_QUESTS } from '../../global-constants';

const DAILY_QUESTS_FILE = path.join(__dirname, '../db/daily-quests.json');

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initDailyQuestsStorage(): void {
  if (!fs.existsSync(DAILY_QUESTS_FILE)) {
    fs.writeFileSync(
      DAILY_QUESTS_FILE,
      JSON.stringify({ progress: [] } satisfies DailyQuestsStore, null, 2),
      'utf8',
    );
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readStore(): DailyQuestsStore {
  const raw = fs.readFileSync(DAILY_QUESTS_FILE, 'utf8');

  return JSON.parse(raw) as DailyQuestsStore;
}

function writeStore(data: DailyQuestsStore): void {
  fs.writeFileSync(DAILY_QUESTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function today(): string {
  return moment().format('MM/DD/YYYY');
}

function createFreshQuests() {
  return DAILY_QUESTS.map(q => ({ id: q.id, status: 'pending' as const }));
}

// ─── Pure logic ───────────────────────────────────────────────────────────────

export function resetProgress(progress: QuestProgress): QuestProgress {
  return {
    userId: progress.userId,
    date: today(),
    quests: progress.quests.map(q => ({ id: q.id, status: 'pending' as const })),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getOrCreateProgress(userId: string): QuestProgress {
  const store = readStore();
  const index = store.progress.findIndex(r => r.userId === userId);

  if (index === -1) {
    const record: QuestProgress = {
      userId,
      date: today(),
      quests: createFreshQuests(),
    };

    store.progress.push(record);
    writeStore(store);

    return record;
  }

  const record = store.progress[index];

  if (record.date !== today()) {
    const reset = resetProgress(record);

    store.progress[index] = reset;
    writeStore(store);

    return reset;
  }

  return record;
}

export function completeQuestInStorage(userId: string, questId: QuestId): QuestProgress {
  const store = readStore();
  const index = store.progress.findIndex(r => r.userId === userId);

  let record: QuestProgress;

  if (index === -1) {
    record = {
      userId,
      date: today(),
      quests: createFreshQuests(),
    };
    store.progress.push(record);
  } else {
    record = store.progress[index];
  }

  const questIndex = record.quests.findIndex(q => q.id === questId);

  if (questIndex !== -1 && record.quests[questIndex].status === 'ready_to_claim') {
    record.quests[questIndex] = { id: questId, status: 'claimed' };
  }

  const recordIndex = store.progress.findIndex(r => r.userId === userId);

  store.progress[recordIndex] = record;
  writeStore(store);

  return record;
}

export function markQuestAsReadyInStorage(userId: string, questId: QuestId): QuestProgress {
  const store = readStore();
  const index = store.progress.findIndex(r => r.userId === userId);

  let record: QuestProgress;

  if (index === -1) {
    record = {
      userId,
      date: today(),
      quests: createFreshQuests(),
    };
    store.progress.push(record);
  } else {
    record = store.progress[index];
  }

  const questIndex = record.quests.findIndex(q => q.id === questId);

  if (questIndex !== -1 && record.quests[questIndex].status === 'pending') {
    record.quests[questIndex] = { id: questId, status: 'ready_to_claim' };
  }

  const recordIndex = store.progress.findIndex(r => r.userId === userId);

  store.progress[recordIndex] = record;
  writeStore(store);

  return record;
}
