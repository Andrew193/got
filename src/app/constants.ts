import moment from "moment";

export const DATE_FORMAT = "MM/DD/YYYY";
export const BATTLE_SPEED = 500;
export const USER_TOKEN = 'user';
export const TODAY = moment().format(DATE_FORMAT);

export const getDiagonals = (checkDiagonals: boolean) => {
  return checkDiagonals
    ? [
      {di: -1, dj: 0},  // Up
      {di: 1, dj: 0},   // Down
      {di: 0, dj: -1},  // Left
      {di: 0, dj: 1},   // Right
      {di: -1, dj: -1}, // Up-Left
      {di: -1, dj: 1},  // Up-Right
      {di: 1, dj: -1},  // Down-Left
      {di: 1, dj: 1}    // Down-Right
    ]
    : [
      {di: -1, dj: 0},
      {di: 1, dj: 0},
      {di: 0, dj: -1},
      {di: 0, dj: 1}
    ];
}

export const frontRoutes = {
  base: "",
  taverna: "taverna",
  preview: "preview",
  battleField: "test-b",
  training: "training",
  trainingBattle: "training-battle",
  dailyBoss: "daily-boss",
  dailyBossBattle: "fight",
  login: "login",
  summonTree: "summon-tree",
  giftStore: "gift-lands"
}
