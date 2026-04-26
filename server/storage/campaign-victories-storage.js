'use strict';

const fs = require('fs');
const path = require('path');

const VICTORIES_FILE = path.join(__dirname, '../db/campaign-victories.json');

const DIFFICULTIES = ['easy', 'normal', 'hard', 'very_hard'];

function initVictoriesStorage() {
  if (!fs.existsSync(VICTORIES_FILE)) {
    fs.writeFileSync(VICTORIES_FILE, JSON.stringify({ victories: [] }, null, 2), 'utf8');
  }
}

function readVictories() {
  const raw = fs.readFileSync(VICTORIES_FILE, 'utf8');

  return JSON.parse(raw);
}

function writeVictories(data) {
  fs.writeFileSync(VICTORIES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createInitialVictories(userId) {
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

function getOrCreateVictoriesUser(userId) {
  const store = readVictories();
  let user = store.victories.find(u => u.userId === userId);

  if (!user) {
    user = createInitialVictories(userId);
    store.victories.push(user);
    writeVictories(store);
  }

  return { store, user };
}

function isValidDifficulty(difficulty) {
  return DIFFICULTIES.includes(difficulty);
}

module.exports = {
  initVictoriesStorage,
  readVictories,
  writeVictories,
  createInitialVictories,
  getOrCreateVictoriesUser,
  isValidDifficulty,
};
