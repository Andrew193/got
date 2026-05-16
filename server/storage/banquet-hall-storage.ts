import fs from 'fs';
import path from 'path';

const PROGRESS_FILE = path.join(__dirname, '../db/banquet-hall-progress.json');

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Tracks which battles a user has completed for a specific hero.
 * Each battle can only be completed once, EXCEPT the final boss (s4b5)
 * which can be replayed indefinitely for 1 shard per win.
 */
export interface HeroBattleProgress {
  heroName: string;
  /** Set of completed battleIds, e.g. ["banquet-NightKing-s0-b0", ...] */
  completedBattles: string[];
}

export interface UserBanquetProgress {
  userId: string;
  heroes: HeroBattleProgress[];
}

export interface BanquetStore {
  progress: UserBanquetProgress[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * The final boss battle ID suffix — always replayable.
 * Format: banquet-{heroName}-s4-b5
 */
const FINAL_BOSS_SCREEN = 4;
const FINAL_BOSS_BATTLE = 5;

const BATTLE_ID_REGEX = /^banquet-.+-s[0-4]-b[0-5]$/;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initBanquetHallStorage(): void {
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ progress: [] }, null, 2), 'utf8');
  }
}

// ─── Pure logic ───────────────────────────────────────────────────────────────

export function isValidBanquetBattleId(battleId: string): boolean {
  return BATTLE_ID_REGEX.test(battleId);
}

export interface ParsedBanquetBattleId {
  heroName: string;
  screenIndex: number;
  battleIndex: number;
}

export function parseBanquetBattleId(battleId: string): ParsedBanquetBattleId | null {
  if (!isValidBanquetBattleId(battleId)) return null;

  // Format: banquet-{heroName}-s{screen}-b{battle}
  // heroName may contain spaces/hyphens, so we parse from the end
  const bMatch = battleId.match(/-b(\d)$/);
  const sMatch = battleId.match(/-s(\d)-b\d$/);

  if (!bMatch || !sMatch) return null;

  const battleIndex = parseInt(bMatch[1], 10);
  const screenIndex = parseInt(sMatch[1], 10);

  // heroName is everything between "banquet-" and "-s{n}-b{n}"
  const heroName = battleId.replace(/^banquet-/, '').replace(/-s\d-b\d$/, '');

  return { heroName, screenIndex, battleIndex };
}

export function isFinalBoss(screenIndex: number, battleIndex: number): boolean {
  return screenIndex === FINAL_BOSS_SCREEN && battleIndex === FINAL_BOSS_BATTLE;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function readBanquetProgress(): BanquetStore {
  const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');

  return JSON.parse(raw) as BanquetStore;
}

export function writeBanquetProgress(data: BanquetStore): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createInitialUserProgress(userId: string): UserBanquetProgress {
  return { userId, heroes: [] };
}

export function getOrCreateBanquetUser(userId: string): {
  store: BanquetStore;
  user: UserBanquetProgress;
} {
  const store = readBanquetProgress();
  let user = store.progress.find(u => u.userId === userId);

  if (!user) {
    user = createInitialUserProgress(userId);
    store.progress.push(user);
    writeBanquetProgress(store);
  }

  return { store, user };
}

export function getOrCreateHeroProgress(
  user: UserBanquetProgress,
  heroName: string,
): HeroBattleProgress {
  let hero = user.heroes.find(h => h.heroName === heroName);

  if (!hero) {
    hero = { heroName, completedBattles: [`banquet-${heroName}-s0-b0`] };
    user.heroes.push(hero);
  }

  return hero;
}
