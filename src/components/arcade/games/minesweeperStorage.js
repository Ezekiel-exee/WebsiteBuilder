const PREFIX = "arcade.minesweeper.best";

function keyFor(difficulty, rows, cols, mines) {
  return `${PREFIX}.${difficulty}.${cols}x${rows}.${mines}`;
}

export function loadBestTime(difficulty, rows, cols, mines) {
  try {
    const value = Number(window.localStorage.getItem(keyFor(difficulty, rows, cols, mines)));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

// Stores the time when it beats the saved one; returns the best time now on record.
export function saveBestTime(difficulty, rows, cols, mines, seconds) {
  const previous = loadBestTime(difficulty, rows, cols, mines);
  if (previous !== null && previous <= seconds) return previous;
  try {
    window.localStorage.setItem(keyFor(difficulty, rows, cols, mines), String(Math.max(0.1, seconds)));
  } catch {
    // storage may be unavailable (private mode); the best time just won't persist
  }
  return seconds;
}
