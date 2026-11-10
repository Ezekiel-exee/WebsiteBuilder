import { useEffect, useRef, useState } from "react";
import { BOARD_KINDS } from "./boardEngine";

// Mirrors a flag after a delay, so the final move and winning line are visible before the result dialog opens.
export function useDelayed(flag, ms) {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setDelayed(true), ms);
    return () => window.clearTimeout(timer);
  }, [flag, ms]);
  return flag && delayed;
}

// Digit keys pick a cell (Tic Tac Toe) or column (Connect 4).
export function digitMove(kind, key) {
  if (!/^[1-9]$/.test(key)) return null;
  const move = Number(key) - 1;
  const limit = BOARD_KINDS[kind].gravity ? BOARD_KINDS[kind].cols : BOARD_KINDS[kind].cols * BOARD_KINDS[kind].rows;
  return move < limit ? move : null;
}

export const SEAT_COLORS = {
  "tic-tac-toe": ["#67e8f9", "#fcd34d"],
  "connect-4": ["#fb7185", "#fcd34d"],
};

function Mark({ seat, color, className = "h-full w-full" }) {
  return seat === 0 ? (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth="3" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" />
    </svg>
  );
}

export function SeatBadge({ kind, seat, size = "h-5 w-5" }) {
  const color = SEAT_COLORS[kind][seat];
  if (kind === "tic-tac-toe") return <span className={`inline-block ${size}`}><Mark seat={seat} color={color} /></span>;
  return <span className={`inline-block rounded-full ${size}`} style={{ backgroundColor: color }} aria-hidden="true" />;
}

function TicTacToeBoard({ game, onMove, disabled }) {
  const [x, o] = SEAT_COLORS["tic-tac-toe"];
  const colors = [x, o];
  return (
    <div role="group" aria-label="Tic Tac Toe board" className="mx-auto grid w-full max-w-[22rem] grid-cols-3 gap-2">
      {game.board.map((value, index) => {
        const winning = game.line.includes(index);
        const label = `Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}, ${value === null ? "empty" : BOARD_KINDS["tic-tac-toe"].marks[value]}`;
        return (
          <button
            key={index}
            type="button"
            aria-label={label}
            disabled={disabled || value !== null || game.winner !== null}
            onClick={() => onMove(index)}
            className={`grid aspect-square place-items-center rounded-xl border p-3 transition enabled:cursor-pointer enabled:hover:border-cyan-300/40 enabled:hover:bg-cyan-300/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:p-4 ${winning ? "board-win border-emerald-300/70 bg-emerald-300/10" : "border-white/10 bg-[#0b0d12]"}`}
          >
            {value !== null && (
              <span key={`${index}-${value}`} className={`block h-full w-full ${index === game.lastMove ? "board-pop" : ""}`}>
                <Mark seat={value} color={colors[value]} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ConnectFourBoard({ game, onMove, disabled }) {
  const { cols, rows } = BOARD_KINDS["connect-4"];
  const colors = SEAT_COLORS["connect-4"];
  return (
    <div role="group" aria-label="Connect 4 board" className="mx-auto w-full max-w-[34rem] rounded-2xl border border-blue-300/20 bg-blue-700 p-2 shadow-xl shadow-blue-950/50 sm:p-3">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: cols }, (_, col) => {
          const full = game.board[col] !== null;
          return (
            <button
              key={col}
              type="button"
              aria-label={`Drop a piece in column ${col + 1}${full ? " (full)" : ""}`}
              disabled={disabled || full || game.winner !== null}
              onClick={() => onMove(col)}
              className="grid gap-1 rounded-xl p-0.5 transition enabled:cursor-pointer enabled:hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:gap-2"
            >
              {Array.from({ length: rows }, (_, row) => {
                const index = row * cols + col;
                const value = game.board[index];
                const winning = game.line.includes(index);
                return (
                  <span key={row} className="relative block aspect-square rounded-full bg-[#05070b] shadow-inner">
                    {value !== null && (
                      <span
                        key={`${index}-${game.moves}`}
                        className={`absolute inset-0 z-10 rounded-full ${index === game.lastMove ? "board-drop" : ""} ${winning ? "board-win ring-4 ring-white" : ""}`}
                        style={{ backgroundColor: colors[value], "--drop-rows": row + 1, boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.25)" }}
                      />
                    )}
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BoardSurface({ game, onMove, disabled }) {
  return game.kind === "connect-4" ? <ConnectFourBoard game={game} onMove={onMove} disabled={disabled} /> : <TicTacToeBoard game={game} onMove={onMove} disabled={disabled} />;
}

// Who is playing and whose turn it is. `players` is [{ name, tag }] indexed by seat.
export function PlayerChips({ game, players }) {
  return (
    <ul aria-label="Players" className="mx-auto mb-4 flex max-w-[34rem] flex-wrap justify-center gap-2 font-mono text-xs">
      {players.map((player, seat) => {
        const active = game.winner === null && game.turn === seat;
        const won = game.winner === seat;
        return (
          <li key={seat} className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${won ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100" : active ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-zinc-400"}`}>
            <SeatBadge kind={game.kind} seat={seat} />
            <span className="font-semibold">{player.name}</span>
            {player.tag && <span className="text-[10px] text-zinc-500">{player.tag}</span>}
            {active && <span className="text-[10px] uppercase tracking-wider text-cyan-300">turn</span>}
            {won && <span className="text-[10px] uppercase tracking-wider text-emerald-300">winner</span>}
          </li>
        );
      })}
    </ul>
  );
}

const TONES = {
  win: { caption: "VICTORY", border: "border-emerald-300/40", glow: "shadow-emerald-950/50", text: "text-emerald-300", ring: "bg-emerald-300/10" },
  lose: { caption: "DEFEAT", border: "border-rose-400/40", glow: "shadow-rose-950/50", text: "text-rose-300", ring: "bg-rose-400/10" },
  draw: { caption: "STALEMATE", border: "border-amber-300/40", glow: "shadow-amber-950/50", text: "text-amber-300", ring: "bg-amber-300/10" },
};

function ResultActions({ actions, firstRef }) {
  return (
    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
      {actions.map((action, index) => (
        <button
          key={action.label}
          ref={index === 0 ? firstRef : undefined}
          type="button"
          disabled={action.disabled}
          onClick={action.onClick}
          className={`rounded-lg border px-5 py-2.5 font-mono text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:opacity-50 ${action.primary ? "border-cyan-300/30 bg-cyan-300/10 font-semibold text-cyan-100 enabled:hover:bg-cyan-300/20" : "border-white/10 text-zinc-300 enabled:hover:bg-white/5"}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

// The finished-game UI: a modal first, which can be dismissed to inspect the final board (it then stays as an inline banner).
// Mount it with a fresh `key` for every game so it opens again.
export function ResultPanel({ tone, title, subtitle, badge, scores, actions, note }) {
  const [dismissed, setDismissed] = useState(false);
  const firstRef = useRef(null);
  const style = TONES[tone];
  useEffect(() => {
    if (!dismissed) firstRef.current?.focus();
  }, [dismissed]);

  const summary = (
    <>
      <p className={`font-mono text-xs font-semibold tracking-[0.2em] ${style.text}`}>{style.caption}</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        {badge && <span className={`grid h-12 w-12 place-items-center rounded-full ${style.ring}`}>{badge}</span>}
        <h3 id="board-result-title" className="text-3xl font-bold tracking-tight text-white">{title}</h3>
      </div>
      {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
      {scores && (
        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 text-left font-mono text-xs">
          {scores.map((score) => (
            <div key={score.label} className="bg-[#0b0d12] px-3 py-2 text-center">
              <dt className="truncate text-[10px] uppercase tracking-wider text-zinc-500">{score.label}</dt>
              <dd className="mt-0.5 text-lg font-semibold text-white">{score.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {note && <p className="mt-3 font-mono text-xs text-zinc-500">{note}</p>}
    </>
  );

  if (dismissed) {
    return (
      <div role="status" className={`result-in mx-auto mt-5 max-w-[34rem] rounded-xl border bg-[#0b0d12] p-4 text-center ${style.border}`}>
        <p className={`font-mono text-sm font-semibold ${style.text}`}>{style.caption} · {title}</p>
        <ResultActions actions={actions} firstRef={firstRef} />
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#05070b]/75 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="board-result-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setDismissed(true);
        }
      }}
    >
      <div className={`result-in w-full max-w-sm rounded-xl border bg-[#0b0d12] p-6 text-center shadow-2xl ${style.border} ${style.glow}`}>
        {summary}
        <ResultActions actions={actions} firstRef={firstRef} />
        <button type="button" onClick={() => setDismissed(true)} className="mt-3 font-mono text-xs text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline">
          view board
        </button>
      </div>
    </div>
  );
}
