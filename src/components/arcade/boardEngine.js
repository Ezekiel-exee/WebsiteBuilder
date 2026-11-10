// Pure rules and AI for the two-player board games. A game is a plain object so it can be sent over the wire as is.
// Seats are 0 (moves first on game one) and 1. `winner` is null while playing, a seat, or "draw".

export const BOARD_KINDS = {
  "tic-tac-toe": { id: "tic-tac-toe", name: "Tic Tac Toe", cols: 3, rows: 3, need: 3, gravity: false, marks: ["X", "O"] },
  "connect-4": { id: "connect-4", name: "Connect 4", cols: 7, rows: 6, need: 4, gravity: true, marks: ["Red", "Yellow"] },
};

export const isBoardKind = (kind) => Object.prototype.hasOwnProperty.call(BOARD_KINDS, kind);

export function createBoardGame(kind, starter = 0) {
  const spec = BOARD_KINDS[kind];
  return { kind, board: Array(spec.cols * spec.rows).fill(null), turn: starter, winner: null, line: [], lastMove: null, moves: 0 };
}

const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];

// Cells of the winning line through `index`, or null.
function lineThrough(board, spec, index, seat) {
  const { cols, rows, need } = spec;
  const row = Math.floor(index / cols);
  const col = index % cols;
  for (const [dr, dc] of DIRECTIONS) {
    const cells = [index];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < rows && c >= 0 && c < cols && board[r * cols + c] === seat) {
        cells.push(r * cols + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (cells.length >= need) return cells;
  }
  return null;
}

// Where a move lands: a cell index for Tic Tac Toe, a column for Connect 4 (the piece drops to the lowest free row).
function landingIndex(game, spec, move) {
  if (!Number.isInteger(move)) return -1;
  if (!spec.gravity) return move >= 0 && move < game.board.length && game.board[move] === null ? move : -1;
  if (move < 0 || move >= spec.cols) return -1;
  for (let row = spec.rows - 1; row >= 0; row -= 1) {
    if (game.board[row * spec.cols + move] === null) return row * spec.cols + move;
  }
  return -1;
}

// Returns the next game, or null when the move isn't allowed.
export function playBoardMove(game, move) {
  const spec = BOARD_KINDS[game.kind];
  if (!spec || game.winner !== null) return null;
  const index = landingIndex(game, spec, move);
  if (index < 0) return null;
  const board = game.board.slice();
  board[index] = game.turn;
  const line = lineThrough(board, spec, index, game.turn);
  const moves = game.moves + 1;
  return {
    ...game,
    board,
    moves,
    lastMove: index,
    line: line || [],
    winner: line ? game.turn : moves === board.length ? "draw" : null,
    turn: 1 - game.turn,
  };
}

export function legalBoardMoves(game) {
  const spec = BOARD_KINDS[game.kind];
  if (game.winner !== null) return [];
  const count = spec.gravity ? spec.cols : game.board.length;
  return Array.from({ length: count }, (_, move) => move).filter((move) => landingIndex(game, spec, move) >= 0);
}

function evaluateConnect(game, seat) {
  const { cols, rows, need } = BOARD_KINDS[game.kind];
  const { board } = game;
  let score = 0;
  for (let row = 0; row < rows; row += 1) {
    if (board[row * cols + 3] === seat) score += 3;
    else if (board[row * cols + 3] !== null) score -= 3;
  }
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      for (const [dr, dc] of DIRECTIONS) {
        const endRow = row + dr * (need - 1);
        const endCol = col + dc * (need - 1);
        if (endRow >= rows || endCol < 0 || endCol >= cols) continue;
        let mine = 0;
        let theirs = 0;
        for (let step = 0; step < need; step += 1) {
          const value = board[(row + dr * step) * cols + col + dc * step];
          if (value === seat) mine += 1;
          else if (value !== null) theirs += 1;
        }
        if (mine && theirs) continue;
        if (mine === 3) score += 30;
        else if (mine === 2) score += 6;
        else if (theirs === 3) score -= 36;
        else if (theirs === 2) score -= 5;
      }
    }
  }
  return score;
}

// Score from the point of view of the player whose turn it is.
function negamax(game, depth, alpha, beta) {
  if (game.winner === "draw") return 0;
  if (game.winner !== null) return -(1000 + depth);
  if (depth === 0) return BOARD_KINDS[game.kind].gravity ? evaluateConnect(game, game.turn) : 0;
  let best = -Infinity;
  for (const move of orderedMoves(game)) {
    best = Math.max(best, -negamax(playBoardMove(game, move), depth - 1, -beta, -alpha));
    alpha = Math.max(alpha, best);
    if (alpha >= beta) break;
  }
  return best;
}

// Centre-first ordering prunes far more of the Connect 4 tree.
function orderedMoves(game) {
  const spec = BOARD_KINDS[game.kind];
  const centre = (spec.cols - 1) / 2;
  const key = (move) => (spec.gravity ? Math.abs(move - centre) : Math.abs((move % spec.cols) - centre) + Math.abs(Math.floor(move / spec.cols) - (spec.rows - 1) / 2));
  return legalBoardMoves(game).sort((a, b) => key(a) - key(b));
}

const MISTAKE_CHANCE = {
  "tic-tac-toe": { easy: 0.6, medium: 0.15, hard: 0 },
  "connect-4": { easy: 0.3, medium: 0, hard: 0 },
};
const SEARCH_DEPTH = { easy: 2, medium: 4, hard: 6 };

export function chooseBoardMove(game, difficulty = "medium") {
  const moves = orderedMoves(game);
  if (!moves.length) return null;
  const spec = BOARD_KINDS[game.kind];
  if (Math.random() < (MISTAKE_CHANCE[game.kind][difficulty] ?? 0)) return moves[Math.floor(Math.random() * moves.length)];
  const depth = spec.gravity ? SEARCH_DEPTH[difficulty] ?? 4 : 9;
  let bestScore = -Infinity;
  let best = [];
  for (const move of moves) {
    const score = -negamax(playBoardMove(game, move), depth - 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      best = [move];
    } else if (score === bestScore) {
      best.push(move);
    }
  }
  return best[Math.floor(Math.random() * best.length)];
}
