import cors from 'cors';
import express from 'express';

import { initCampaignStorage } from './storage/campaign-storage';
import { initVictoriesStorage } from './storage/campaign-victories-storage';
import { initDailyQuestsStorage } from './storage/daily-quests-storage';
import { initHeroesStorage } from './storage/heroes-storage';
import { initWatchtowerStorage } from './storage/watchtower-storage';
import { initPlayerLevelStorage } from './storage/player-level-storage';
import { initBanquetHallStorage } from './storage/banquet-hall-storage';
import campaignRouter from './routers/campaign.router';
import campaignVictoriesRouter from './routers/campaign-victories.router';
import dailyQuestsRouter from './routers/daily-quests.router';
import heroesRouter from './routers/heroes.router';
import watchtowerRouter from './routers/watchtower.router';
import playerLevelRouter from './routers/player-level.router';
import banquetHallRouter from './routers/banquet-hall.router';

const app = express();
const PORT = 4568;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ─── Init storage ─────────────────────────────────────────────────────────────

initCampaignStorage();
initHeroesStorage();
initVictoriesStorage();
initWatchtowerStorage();
initPlayerLevelStorage();
initDailyQuestsStorage();
initBanquetHallStorage();

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/campaign', campaignRouter);
app.use('/api/heroes', heroesRouter);
app.use('/api/campaign-victories', campaignVictoriesRouter);
app.use('/api/watchtower', watchtowerRouter);
app.use('/api/player-level', playerLevelRouter);
app.use('/api/daily-quests', dailyQuestsRouter);
app.use('/api/banquet-hall', banquetHallRouter);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Game Server running on http://localhost:${PORT}`);
});

export default app;
