// ─── Campaign ────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'normal' | 'hard' | 'very_hard';

export interface DifficultyProgress {
  screenIndex: number;
  battleIndex: number;
}

export interface UserCampaignProgress {
  userId: string;
  unlockedDifficulties: Difficulty[];
  difficulties: Record<Difficulty, DifficultyProgress>;
}

export interface CampaignStore {
  progress: UserCampaignProgress[];
}

export interface ParsedBattleId {
  difficulty: Difficulty;
  screenIndex: number;
  battleIndex: number;
}

// ─── Heroes ──────────────────────────────────────────────────────────────────

export interface HeroProgressRecord {
  heroName: string;
  isUnlocked: boolean;
  level: number;
  rank: number;
  eq1Level: number;
  eq2Level: number;
  eq3Level: number;
  eq4Level: number;
  shards: number;
}

export interface UserHeroesProgress {
  userId: string;
  heroes: HeroProgressRecord[];
}

export interface HeroesStore {
  progress: UserHeroesProgress[];
}

export type HeroProgressPatch = Partial<
  Pick<
    HeroProgressRecord,
    'level' | 'rank' | 'eq1Level' | 'eq2Level' | 'eq3Level' | 'eq4Level' | 'shards'
  >
>;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  field?: string;
  value?: number;
}

// ─── Campaign Victories ───────────────────────────────────────────────────────

export interface UserVictories {
  userId: string;
  difficulties: Record<Difficulty, number>;
}

export interface VictoriesStore {
  victories: UserVictories[];
}

// ─── Watchtower ───────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  headers: { title: string }[];
  blocks: (
    | { type: 'paragraph'; text: string }
    | { type: 'hero'; heroName: string }
    | { type: 'table'; columns: Record<string, string>[]; rows: Record<string, string>[] }
  )[];
}

export interface WatchtowerStore {
  news: NewsItem[];
}
