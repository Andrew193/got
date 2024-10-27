export const BATTLE_SPEED = 500;

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
