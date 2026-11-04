import { useState } from "react";
import { ARENA_H, ARENA_W, CAMPAIGN, ENEMY_TYPES, MAPS, POWERUPS, WEAPONS, tierForLevel } from "./byteBrawlEngine";

export function DropsGuide() {
  return (
    <details className="mt-3 rounded-xl border border-white/10 bg-[#0b0d12] p-3 font-mono text-[11px]">
      <summary className="cursor-pointer text-zinc-400">drops guide — diamond power-ups and square weapon crates</summary>
      <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2" aria-label="Drops guide">
        {Object.entries(POWERUPS).map(([id, power]) => (
          <li key={id} className="flex gap-2">
            <span className="w-4 shrink-0 text-center font-bold" style={{ color: power.color }}>{power.glyph}</span>
            <span><span style={{ color: power.color }}>{power.label}</span> <span className="text-zinc-500">— {power.blurb}{power.duration ? ` (${power.duration}s)` : ""}</span></span>
          </li>
        ))}
        {Object.entries(WEAPONS).filter(([id]) => id !== "pistol").map(([id, weapon]) => (
          <li key={id} className="flex gap-2">
            <span className="w-4 shrink-0 text-center font-bold text-lime-300">{weapon.glyph}</span>
            <span><span className="text-lime-300">{weapon.label}</span> <span className="text-zinc-500">— {weapon.ammo} shots</span></span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-zinc-600">// knocked-out bots often drop a power-up. crates vanish after a while.</p>
    </details>
  );
}

const PROGRESS_KEY = "blocksmith.byteBrawl.campaign";

export function readCampaignProgress() {
  try {
    const stored = Number(window.localStorage.getItem(PROGRESS_KEY));
    return Number.isFinite(stored) && stored >= 1 ? Math.min(stored, CAMPAIGN.length) : 1;
  } catch {
    return 1;
  }
}

export function saveCampaignProgress(unlocked) {
  try {
    if (unlocked > readCampaignProgress()) window.localStorage.setItem(PROGRESS_KEY, String(Math.min(unlocked, CAMPAIGN.length)));
  } catch {
    // Progress is optional when storage is unavailable.
  }
}

export function StagePreview({ map, active }) {
  return (
    <svg viewBox={`0 0 ${ARENA_W} ${ARENA_H}`} className="h-24 w-full rounded-md border border-white/10 bg-[#080a0f]" aria-hidden="true">
      <rect x="1" y="1" width={ARENA_W - 2} height={ARENA_H - 2} fill="none" stroke="rgba(251,113,133,0.35)" strokeWidth="4" strokeDasharray="14 14" />
      {map.platforms.map((platform) => (
        <g key={`${platform.x}-${platform.y}`}>
          <line x1={platform.x} y1={platform.y} x2={platform.x + platform.w} y2={platform.y} stroke={active ? "#a3e635" : "#22d3ee"} strokeWidth="9" strokeLinecap="round" />
          <rect x={platform.x} y={platform.y} width={platform.w} height="22" fill="none" stroke={active ? "#a3e635" : "#22d3ee"} strokeOpacity="0.35" strokeWidth="4" />
        </g>
      ))}
    </svg>
  );
}

function ModeTab({ id, current, onSelect, title, subtitle }) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`rounded-xl border p-4 text-left font-mono transition ${active ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-[#0b0d12] hover:border-white/20 hover:bg-white/[0.03]"}`}
    >
      <span className={`block text-sm font-semibold ${active ? "text-cyan-200" : "text-zinc-200"}`}>{title}</span>
      <span className="mt-1 block text-xs text-zinc-500">{subtitle}</span>
    </button>
  );
}

export default function ByteBrawlSetup({ onStart, onBack }) {
  const [mode, setMode] = useState("campaign");
  const [stage, setStage] = useState(0);
  const [opponents, setOpponents] = useState(1);
  const [unlocked] = useState(readCampaignProgress);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="text-emerald-400">~/arcade</span><span>/</span><span>byte-brawl</span><span>/</span><span>setup</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Choose your match</h2>
          <p className="mt-1 text-sm text-zinc-400">Play the campaign, or pick any stage for a versus match against bots.</p>
        </div>
        <button type="button" onClick={onBack} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
          &lt; games
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <ModeTab id="campaign" current={mode} onSelect={setMode} title="$ campaign" subtitle={`${CAMPAIGN.length} missions · bosses · unlock as you win`} />
        <ModeTab id="versus" current={mode} onSelect={setMode} title="$ versus" subtitle={`${MAPS.length} stages · new enemy type every 3 rounds`} />
        <ModeTab id="online" current={mode} onSelect={() => onStart({ mode: "online" }, 1)} title="$ online" subtitle="host or join with a room code · up to 3 players" />
      </div>

      {mode === "campaign" ? (
        <section aria-label="Campaign missions">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs text-zinc-500">
              <span className="text-zinc-300">{unlocked}</span> / {CAMPAIGN.length} missions unlocked
            </p>
            <button type="button" onClick={() => onStart({ mode: "campaign" }, 1)} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20">
              $ start from mission 1
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CAMPAIGN.map((mission, index) => {
              const number = index + 1;
              const locked = number > unlocked;
              return (
                <button
                  key={mission.title}
                  type="button"
                  disabled={locked}
                  onClick={() => onStart({ mode: "campaign" }, number)}
                  className="rounded-xl border border-white/10 bg-[#0b0d12] p-3 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <StagePreview map={MAPS[mission.map]} active={mission.bots.some((bot) => bot.boss)} />
                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    <span>Mission {String(number).padStart(2, "0")}</span>
                    <span>{locked ? "locked" : MAPS[mission.map].name}</span>
                  </div>
                  <p className={`mt-1 font-mono text-sm font-semibold ${mission.bots.some((bot) => bot.boss) ? "text-orange-300" : "text-zinc-100"}`}>{mission.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400">{mission.brief}</p>
                  <p className="mt-2 font-mono text-[10px]" style={{ color: ENEMY_TYPES[tierForLevel(number)].color }}>◆ {ENEMY_TYPES[tierForLevel(number)].name}</p>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section aria-label="Versus setup">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400" role="group" aria-label="Number of opponents">
              <span className="text-zinc-500">OPPONENTS</span>
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={opponents === count}
                  onClick={() => setOpponents(count)}
                  className={`h-8 w-8 rounded-lg border transition ${opponents === count ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100" : "border-white/10 hover:bg-white/5"}`}
                >
                  {count}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => onStart({ mode: "versus", stage, opponents }, 1)} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 font-mono text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20">
              $ fight on {MAPS[stage].name}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MAPS.map((map, index) => (
              <button
                key={map.name}
                type="button"
                aria-pressed={stage === index}
                onClick={() => setStage(index)}
                onDoubleClick={() => onStart({ mode: "versus", stage: index, opponents }, 1)}
                className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${stage === index ? "border-lime-300/60 bg-lime-300/5" : "border-white/10 bg-[#0b0d12] hover:border-cyan-400/30"}`}
              >
                <StagePreview map={map} active={stage === index} />
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{map.name}</p>
                <p className={`mt-1 font-mono text-sm font-semibold ${stage === index ? "text-lime-200" : "text-zinc-100"}`}>{map.title}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{map.blurb}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
