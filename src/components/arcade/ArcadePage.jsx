import { useCallback, useEffect, useState } from "react";
import Icon from "../builder/Icon";
import ByteBrawl from "./ByteBrawlGame";
import BoardGame from "./BoardGame";
import { isBoardKind } from "./boardEngine";
import { readBoardInvite, readInviteCode } from "./byteBrawlNet";
import BombermanGame from "./games/BombermanGame";
import MinesweeperGame from "./games/MinesweeperGame";
import PacmanGame from "./games/PacmanGame";
import SnakeGame from "./games/SnakeGame";

const GAMES = [
  { id: "minesweeper", name: "Minesweeper", icon: "terminal", description: "Mouse, touch and keyboard Minesweeper with chording, best times, and boards that grow every level.", controls: "Click/Enter reveal · right-click/F flag · C chord" },
  { id: "bomberman", name: "Bomberman", icon: "bomb", description: "NES-style stages on a scrolling field: find the hidden exit, blast every enemy, and collect Fire, Bomb, Speed and more.", controls: "WASD to move · Space bomb · K detonate" },
  { id: "pacman", name: "Pac-Man", icon: "pacman", description: "The classic 28×31 maze with four ghost personalities, scatter and chase waves, fruit, and faster levels.", controls: "WASD to move · P to pause" },
  { id: "snake", name: "Snake", icon: "snake", description: "Smooth snake with combos, bonus bytes, power-ups, obstacle layouts, and level goals.", controls: "WASD to move · P to pause" },
  { id: "code-arena", name: "Byte Brawl", icon: "platform", description: "Gun Mayhem-style brawler with a 30-mission campaign, bosses, online rooms, and power-up drops. Every 3 levels a new enemy type with its own skill appears — 13 in all.", controls: "A/D move · W jump · S drop · J fire · P pause" },
  { id: "tic-tac-toe", name: "Tic Tac Toe", icon: "ttt", description: "Three in a row wins. Play the computer, a friend on the same screen, or an online room where you can switch games without reconnecting.", controls: "Click a square · 1–9 keys" },
  { id: "connect-4", name: "Connect 4", icon: "connect4", description: "Drop discs and line up four. Play the computer, pass and play, or an online room shared with Tic Tac Toe.", controls: "Click a column · 1–7 keys" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", color: "text-emerald-300" },
  { id: "medium", label: "Medium", color: "text-amber-300" },
  { id: "hard", label: "Hard", color: "text-rose-300" },
];

const GAME_COMPONENTS = {
  minesweeper: MinesweeperGame,
  bomberman: BombermanGame,
  pacman: PacmanGame,
  snake: SnakeGame,
  "code-arena": ByteBrawl,
  "tic-tac-toe": BoardGame,
  "connect-4": BoardGame,
};

function GameCard({ game, onPlay }) {
  return (
    <article className="group flex min-h-56 flex-col rounded-xl border border-white/10 bg-[#0b0d12] p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-[#0e1118]">
      <div className="mb-5 flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/5 font-mono text-lg text-cyan-300">
          {game.icon === "pacman" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 8.5A9 9 0 1 0 20.5 12" />
              <path d="M12 12 19 8M12 12l8 3" />
            </svg>
          ) : game.icon === "platform" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 19h7m4 0h7M5 19v-5l4-3 3 2 3-6 4 3v9" />
              <circle cx="12" cy="5" r="2" />
            </svg>
          ) : game.icon === "ttt" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
          ) : game.icon === "connect4" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.6" />
              <circle cx="15.5" cy="8.5" r="1.6" />
              <circle cx="8.5" cy="15.5" r="1.6" />
              <circle cx="15.5" cy="15.5" r="1.6" />
            </svg>
          ) : game.icon === "bomb" ? "*" : game.icon === "snake" ? ">" : "#"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">v2.0 / playable</span>
      </div>
      <h2 className="font-mono text-lg font-semibold text-zinc-100">{game.name}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">{game.description}</p>
      <button type="button" onClick={onPlay} className="mt-5 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-xs text-zinc-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/5 hover:text-cyan-200">
        <span><span className="text-emerald-400">$</span> launch {game.id}</span>
        <span aria-hidden="true">-&gt;</span>
      </button>
    </article>
  );
}

export default function ArcadePage({ onBack }) {
  const [initialInvite] = useState(() => readInviteCode());
  const [initialBoardInvite] = useState(() => readBoardInvite());
  const [selectedGame, setSelectedGame] = useState(initialInvite ? "code-arena" : initialBoardInvite ? (isBoardKind(initialBoardInvite.game) ? initialBoardInvite.game : "tic-tac-toe") : "");
  const [difficulty, setDifficulty] = useState("easy");
  const [level, setLevel] = useState(1);
  const [brawlSetup, setBrawlSetup] = useState(() => (initialInvite ? { mode: "online", invite: { code: initialInvite, nonce: 0 } } : null));
  const [boardInvite, setBoardInvite] = useState(() => (initialBoardInvite ? { code: initialBoardInvite.code, nonce: 0 } : null));
  const chosenGame = GAMES.find((game) => game.id === selectedGame);

  // An invite link (#/arcade/join/CODE for Byte Brawl, #/arcade/play/CODE/GAME for board games) drops the player
  // straight into that room, whether the page was just loaded or the link is opened while the arcade is already
  // showing. The hash is then reset so a refresh doesn't try to re-join a stale room.
  useEffect(() => {
    const consumeInvite = () => {
      const code = readInviteCode();
      const board = readBoardInvite();
      if (!code && !board) return;
      window.history.replaceState(null, "", "#/arcade");
      setLevel(1);
      if (code) {
        setSelectedGame("code-arena");
        setBrawlSetup((current) => ({ mode: "online", invite: { code, nonce: (current?.invite?.nonce ?? 0) + 1 } }));
      } else {
        setSelectedGame(isBoardKind(board.game) ? board.game : "tic-tac-toe");
        setBoardInvite((current) => ({ code: board.code, nonce: (current?.nonce ?? 0) + 1 }));
      }
    };
    // The initial link was already read into state above; only clean the URL.
    if (readInviteCode() || readBoardInvite()) window.history.replaceState(null, "", "#/arcade");
    window.addEventListener("hashchange", consumeInvite);
    return () => window.removeEventListener("hashchange", consumeInvite);
  }, []);

  const returnToGames = useCallback(() => {
    setSelectedGame("");
    setBrawlSetup(null);
    setBoardInvite(null);
    setLevel(1);
  }, []);
  const onLevelAdvance = useCallback(() => setLevel((current) => current + 1), []);
  const startBrawl = useCallback((setup, startLevel) => {
    setBrawlSetup(setup);
    setLevel(startLevel);
  }, []);
  const brawlMenu = useCallback(() => {
    setBrawlSetup(null);
    setLevel(1);
  }, []);
  const gameProps = { difficulty, level, onBack: returnToGames, onLevelAdvance, setup: brawlSetup, onSetup: startBrawl, onMenu: brawlMenu, kind: selectedGame, onKindChange: setSelectedGame, invite: boardInvite };
  const Game = GAME_COMPONENTS[selectedGame];
  // Board games share one component across both titles (and ignore difficulty changes) so an online room survives switching games.
  const gameKey = isBoardKind(selectedGame) ? "board" : `${selectedGame}-${difficulty}-${level}-${brawlSetup?.invite?.nonce ?? 0}`;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <Icon name="gamepad" className="h-4 w-4 text-cyan-300" />
            <span className="text-emerald-400">developer.arcade</span><span>/</span><span>games</span>
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{chosenGame ? chosenGame.name : "The Code Arcade"}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {chosenGame ? chosenGame.description : "Seven games rebuilt as a terminal playground, including two-player Tic Tac Toe and Connect 4. Pick a difficulty and play through progressively harder levels."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="h-10 rounded-lg border border-white/10 px-3 font-mono text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white">
              &lt; studio
            </button>
          )}
          <label className="grid gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Difficulty
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-[#0b0d12] px-3 text-xs normal-case tracking-normal text-zinc-200 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20">
              {DIFFICULTIES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {Game ? (
        <div className="rounded-2xl border border-white/10 bg-[#090b10]/90 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
            <span className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-cyan-200">{difficulty}</span>
            {!isBoardKind(selectedGame) && <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-zinc-400">level {level}</span>}
            <span className={`ml-auto ${DIFFICULTIES.find((item) => item.id === difficulty)?.color}`}>difficulty: {difficulty}</span>
          </div>
          <Game key={gameKey} {...gameProps} />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 font-mono text-xs text-zinc-600">
            <span className="text-emerald-400">user@blocksmith</span><span>:</span><span className="text-cyan-300">~/arcade</span><span>$ ls -la ./games</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {GAMES.map((game) => <GameCard key={game.id} game={game} onPlay={() => setSelectedGame(game.id)} />)}
          </div>
          <p className="mt-6 border-t border-white/5 pt-4 font-mono text-[11px] text-zinc-600">
            // single-player games run locally in your browser · online rooms (Byte Brawl, Tic Tac Toe, Connect 4) relay through Supabase Realtime
          </p>
        </>
      )}
    </main>
  );
}
