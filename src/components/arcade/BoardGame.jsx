import { useEffect, useState } from "react";
import { BOARD_KINDS, chooseBoardMove, createBoardGame, playBoardMove } from "./boardEngine";
import { BoardSurface, PlayerChips, ResultPanel, SeatBadge, digitMove, useDelayed } from "./BoardParts";
import BoardOnline from "./BoardOnline";
import { GameFrame } from "./GameFrame";

const CPU_THINK_MS = 450;
const RESULT_DELAY_MS = 800;

const MODES = [
  { id: "cpu", title: "$ vs computer", text: "Play the computer. It gets tougher on higher difficulty settings (top right)." },
  { id: "local", title: "$ pass & play", text: "Two players share this screen and take turns." },
  { id: "online", title: "$ online", text: "Create a room and send a friend the invite link. Stay in the room and switch between board games without reconnecting." },
];

function ModeMenu({ kind, onPick, onBack }) {
  const spec = BOARD_KINDS[kind];
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="text-emerald-400">~/arcade</span><span>/</span><span>{kind}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Choose how to play</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
            <SeatBadge kind={kind} seat={0} /> {spec.marks[0]} vs <SeatBadge kind={kind} seat={1} /> {spec.marks[1]} — get {spec.need} in a row to win.
          </p>
        </div>
        <button type="button" onClick={onBack} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          &lt; games
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {MODES.map((mode) => (
          <button key={mode.id} type="button" onClick={() => onPick(mode.id)} className="rounded-xl border border-white/10 bg-[#0b0d12] p-5 text-left font-mono transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-[#0e1118] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            <span className="block text-sm font-semibold text-zinc-100">{mode.title}</span>
            <span className="mt-2 block text-xs leading-5 text-zinc-500">{mode.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function OfflineMatch({ kind, vsCpu, difficulty, onMenu, onBack }) {
  const spec = BOARD_KINDS[kind];
  const [round, setRound] = useState(0);
  const [game, setGame] = useState(() => createBoardGame(kind, 0));
  const [scores, setScores] = useState({ 0: 0, 1: 0, draw: 0 });
  const names = vsCpu ? ["You", "Computer"] : ["Player 1", "Player 2"];
  const cpuTurn = vsCpu && game.winner === null && game.turn === 1;
  const showResult = useDelayed(game.winner !== null, RESULT_DELAY_MS);

  const commit = (next) => {
    setGame(next);
    if (next.winner !== null) setScores((current) => ({ ...current, [next.winner]: current[next.winner] + 1 }));
  };
  const move = (value) => {
    if (cpuTurn) return;
    const next = playBoardMove(game, value);
    if (next) commit(next);
  };
  const newRound = () => {
    setRound((current) => current + 1);
    setGame(createBoardGame(kind, (round + 1) % 2));
  };

  useEffect(() => {
    if (!cpuTurn) return undefined;
    const timer = window.setTimeout(() => {
      const choice = chooseBoardMove(game, difficulty);
      const next = choice === null ? null : playBoardMove(game, choice);
      if (next) commit(next);
    }, CPU_THINK_MS);
    return () => window.clearTimeout(timer);
    // commit only closes over state setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpuTurn, game, difficulty]);

  const onKeyDown = (event) => {
    const value = digitMove(kind, event.key);
    if (value !== null) move(value);
  };

  let tone = "draw";
  let title = "It's a draw";
  let subtitle = "The board is full — nobody connected.";
  if (game.winner === 0 || game.winner === 1) {
    tone = vsCpu && game.winner === 1 ? "lose" : "win";
    title = vsCpu ? (game.winner === 0 ? "You win!" : "Computer wins") : `${names[game.winner]} wins!`;
    subtitle = `${spec.marks[game.winner]} connected ${spec.need} in a row.`;
  }
  const actions = [
    { label: "$ play again", onClick: newRound, primary: true },
    { label: "$ change mode", onClick: onMenu },
    { label: "< all games", onClick: onBack },
  ];
  const turnName = names[game.turn];

  return (
    <GameFrame
      title={spec.name}
      description={vsCpu ? `You are ${spec.marks[0]}. Beat the computer (${difficulty}).` : `Pass & play — ${spec.marks[0]} goes first this round.`}
      status={game.winner === null ? "running" : "won"}
      metrics={[{ label: "ROUND", value: round + 1 }, { label: "MOVES", value: game.moves }, { label: names[0].toUpperCase(), value: scores[0] }, { label: names[1].toUpperCase(), value: scores[1] }, { label: "DRAWS", value: scores.draw }]}
      onBack={onBack}
      onRestart={newRound}
      extraActions={
        <button type="button" onClick={onMenu} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          &lt; modes
        </button>
      }
      onKeyDown={onKeyDown}
      controls={`Click ${spec.gravity ? "a column" : "a square"} or press ${spec.gravity ? "1–7" : "1–9"} to place a piece. Get ${spec.need} in a row — across, up and down, or diagonally — to win. The first player alternates each round.`}
    >
      <PlayerChips game={game} players={names.map((name, seat) => ({ name, tag: vsCpu && seat === 1 ? "CPU" : "" }))} />
      <BoardSurface game={game} onMove={move} disabled={cpuTurn} />
      <p role="status" className="mt-4 text-center font-mono text-xs text-zinc-500">
        {game.winner === null ? (cpuTurn ? "computer is thinking…" : vsCpu ? "your turn" : `${turnName}'s turn`) : "round finished"}
      </p>
      {showResult && (
        <ResultPanel
          key={round}
          tone={tone}
          title={title}
          subtitle={subtitle}
          badge={game.winner === 0 || game.winner === 1 ? <SeatBadge kind={kind} seat={game.winner} size="h-7 w-7" /> : null}
          scores={[{ label: names[0], value: scores[0] }, { label: "Draws", value: scores.draw }, { label: names[1], value: scores[1] }]}
          actions={actions}
        />
      )}
    </GameFrame>
  );
}

export default function BoardGame({ kind, onKindChange, difficulty, onBack, invite }) {
  const [mode, setMode] = useState(invite ? "online" : "menu");
  // An invite is only used for the first online session; leaving the room must not re-join it.
  const [activeInvite, setActiveInvite] = useState(invite);
  useEffect(() => {
    if (!invite) return;
    setActiveInvite(invite);
    setMode("online");
  }, [invite]);
  const toMenu = () => {
    setActiveInvite(null);
    setMode("menu");
  };

  if (mode === "online") return <BoardOnline kind={kind} onKindChange={onKindChange} onExit={toMenu} onBack={onBack} invite={activeInvite} />;
  if (mode === "cpu" || mode === "local") return <OfflineMatch key={`${kind}-${mode}`} kind={kind} vsCpu={mode === "cpu"} difficulty={difficulty} onMenu={toMenu} onBack={onBack} />;
  return <ModeMenu kind={kind} onPick={setMode} onBack={onBack} />;
}
