import fs from 'fs';
import path from 'path';

import type { WatchtowerStore } from '../types';

const NEWS_FILE = path.join(__dirname, '../db/watchtower-news.json');

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initWatchtowerStorage(): void {
  if (!fs.existsSync(NEWS_FILE)) {
    fs.writeFileSync(NEWS_FILE, JSON.stringify({ news: [] }, null, 2), 'utf8');
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function readNews(): WatchtowerStore {
  const raw = fs.readFileSync(NEWS_FILE, 'utf8');

  return JSON.parse(raw) as WatchtowerStore;
}

export function writeNews(data: WatchtowerStore): void {
  fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2), 'utf8');
}
