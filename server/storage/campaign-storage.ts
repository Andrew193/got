import fs from 'fs';
import path from 'path';

import type {
  CampaignStore,
  Difficulty,
  DifficultyProgress,
  ParsedBattleId,
  UserCampaignProgress,
} from '../types';

const PROGRESS_FILE = path.join(__dirname, '../db/campaign-progress.json');

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard', 'very_hard'];
const BATTLE_ID_REGEX = /^(easy|normal|hard|very_hard)-s[0-4]-b[0-5]$/;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initCampaignStorage(): void {
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ progress: [] }, null, 2), 'utf8');
  }
}

// ─── Pure logic ───────────────────────────────────────────────────────────────

export function isValidBattleId(battleId: string): boolean {
  return BATTLE_ID_REGEX.test(battleId);
}

export function parseBattleId(battleId: string): ParsedBattleId | null {
  if (!isValidBattleId(battleId)) return null;

  const parts = battleId.split('-');
  const bPart = parts[parts.length - 1];
  const sPart = parts[parts.length - 2];
  const difficulty = parts.slice(0, parts.length - 2).join('-') as Difficulty;

  return {
    difficulty,
    screenIndex: parseInt(sPart.slice(1), 10),
    battleIndex: parseInt(bPart.slice(1), 10),
  };
}

export function nextProgress(
  userProgress: UserCampaignProgress,
  difficulty: Difficulty,
  screenIndex: number,
  battleIndex: number,
): UserCampaignProgress {
  const updated: UserCampaignProgress = JSON.parse(JSON.stringify(userProgress));

  if (battleIndex < 5) {
    updated.difficulties[difficulty] = { screenIndex, battleIndex: battleIndex + 1 };
  } else if (battleIndex === 5 && screenIndex < 4) {
    updated.difficulties[difficulty] = { screenIndex: screenIndex + 1, battleIndex: 0 };
  } else if (battleIndex === 5 && screenIndex === 4) {
    const currentIdx = DIFFICULTY_ORDER.indexOf(difficulty);
    const nextDifficulty = DIFFICULTY_ORDER[currentIdx + 1];

    if (!nextDifficulty) {
      return updated;
    }

    updated.difficulties[nextDifficulty] = { screenIndex: 0, battleIndex: 0 } as DifficultyProgress;

    if (!updated.unlockedDifficulties.includes(nextDifficulty)) {
      updated.unlockedDifficulties = [...updated.unlockedDifficulties, nextDifficulty];
    }
  }

  return updated;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function readProgress(): CampaignStore {
  const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');

  return JSON.parse(raw) as CampaignStore;
}

export function writeProgress(data: CampaignStore): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createInitialUserProgress(userId: string): UserCampaignProgress {
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

export function getOrCreateUser(userId: string): {
  store: CampaignStore;
  user: UserCampaignProgress;
} {
  const store = readProgress();
  let user = store.progress.find(u => u.userId === userId);

  if (!user) {
    user = createInitialUserProgress(userId);
    store.progress.push(user);
    writeProgress(store);
  }

  return { store, user };
}
