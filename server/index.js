'use strict';

const express = require('express');
const cors = require('cors');

const campaignRouter = require('./routers/campaign.router');
const heroesRouter = require('./routers/heroes.router');
const campaignVictoriesRouter = require('./routers/campaign-victories.router');
const { initCampaignStorage } = require('./storage/campaign-storage');
const { initHeroesStorage } = require('./storage/heroes-storage');
const { initVictoriesStorage } = require('./storage/campaign-victories-storage');

const app = express();
const PORT = 4568;

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// --- Init storage ---
initCampaignStorage();
initHeroesStorage();
initVictoriesStorage();

// --- Routes ---
app.use('/api/campaign', campaignRouter);
app.use('/api/heroes', heroesRouter);
app.use('/api/campaign-victories', campaignVictoriesRouter);

// --- Start ---
app.listen(PORT, () => {
  console.log(`Game Server running on http://localhost:${PORT}`);
});

module.exports = app;
