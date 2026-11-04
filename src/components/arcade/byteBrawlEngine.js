export const ARENA_W = 800;
export const ARENA_H = 450;
export const STEP = 1 / 120;

const GRAVITY = 1400;
const MOVE_SPEED = 235;
const MAX_FALL = 780;
const FIGHTER_W = 18;
const FIGHTER_H = 36;
const BLAST = { left: -150, right: ARENA_W + 150, top: -280, bottom: ARENA_H + 130 };
const PLAYER_COLORS = ["#a3e635", "#f1f5f9", "#818cf8"];
const BOSS_COLOR = "#fb923c";

export const ENEMY_TYPES = [
  { skill: "none", name: "KIDDIE", color: "#fb7185", blurb: "Basic bot. Shoots and jumps." },
  { skill: "dash", name: "SPRINTER", color: "#fbbf24", blurb: "Dashes across the stage to close the gap." },
  { skill: "shield", name: "FIREWALL", color: "#38bdf8", blurb: "Shield absorbs 3 hits and recharges." },
  { skill: "blink", name: "PHANTOM", color: "#c084fc", blurb: "Teleports next to you and back to safety." },
  { skill: "heavy", name: "TITAN", color: "#2dd4bf", blurb: "Armored: takes half knockback, moves slower." },
  { skill: "overclock", name: "OVERCLOCK", color: "#f472b6", blurb: "Rapid fire, triple jump, regenerates damage." },
];

export function tierForLevel(level) {
  return Math.min(ENEMY_TYPES.length - 1, Math.floor((level - 1) / 3));
}
const FONT = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const WEAPONS = {
  pistol: { label: "PISTOL", glyph: "P", cooldown: 0.3, speed: 780, life: 0.9, pellets: 1, spread: 0.02, damage: 5, knock: 215, recoil: 40, ammo: Infinity, length: 12 },
  smg: { label: "SMG", glyph: "S", cooldown: 0.085, speed: 840, life: 0.7, pellets: 1, spread: 0.07, damage: 2, knock: 95, recoil: 22, ammo: 45, length: 17 },
  shotgun: { label: "SHOTGUN", glyph: "G", cooldown: 0.8, speed: 700, life: 0.3, pellets: 6, spread: 0.3, damage: 3, knock: 135, recoil: 330, ammo: 8, length: 19 },
  sniper: { label: "SNIPER", glyph: "N", cooldown: 1.05, speed: 1500, life: 0.8, pellets: 1, spread: 0, damage: 16, knock: 650, recoil: 140, ammo: 5, length: 25 },
  launcher: { label: "LAUNCHER", glyph: "L", cooldown: 0.95, speed: 500, life: 1.1, pellets: 1, spread: 0.01, damage: 14, knock: 600, recoil: 170, ammo: 4, length: 21, explosive: true, radius: 72 },
};

const CRATE_WEAPONS = ["smg", "shotgun", "sniper", "launcher"];

export const POWERUPS = {
  sudo: { label: "SUDO", glyph: "#", color: "#fb7185", duration: 10, weight: 3, blurb: "Your hits knock 1.8× harder." },
  turbo: { label: "TURBO", glyph: ">", color: "#fbbf24", duration: 8, weight: 3, blurb: "Faster movement and fire rate." },
  sandbox: { label: "SANDBOX", glyph: "O", color: "#38bdf8", duration: 0, weight: 3, blurb: "Absorbs the next 2 hits." },
  gc: { label: "GARBAGE COLLECT", glyph: "%", color: "#34d399", duration: 0, weight: 3, blurb: "Wipes 60% of your damage." },
  loop: { label: "WHILE(TRUE)", glyph: "∞", color: "#c084fc", duration: 10, weight: 2, blurb: "Unlimited jumps in mid-air." },
  segfault: { label: "SEGFAULT", glyph: "!", color: "#fb923c", duration: 0, weight: 2, blurb: "Shockwave blasts nearby enemies away." },
  lag: { label: "LATENCY", glyph: "~", color: "#2dd4bf", duration: 6, weight: 2, blurb: "Enemies move and shoot at half speed." },
  commit: { label: "GIT COMMIT", glyph: "+", color: "#a3e635", duration: 0, weight: 1, blurb: "Save point: +1 stock." },
};

const BUFF_IDS = ["sudo", "turbo", "loop", "lag"];

function pickPowerup() {
  const entries = Object.entries(POWERUPS);
  let roll = Math.random() * entries.reduce((total, [, power]) => total + power.weight, 0);
  for (const [id, power] of entries) {
    roll -= power.weight;
    if (roll <= 0) return id;
  }
  return entries[0][0];
}

export const MAPS = [
  {
    name: "main.js",
    title: "Main Thread",
    blurb: "A wide floor with three platforms above it. The classic arena.",
    platforms: [{ x: 150, y: 320, w: 500 }, { x: 30, y: 225, w: 160 }, { x: 610, y: 225, w: 160 }, { x: 310, y: 150, w: 180 }],
    spawns: [{ x: 250, y: 320 }, { x: 550, y: 320 }, { x: 110, y: 225 }, { x: 690, y: 225 }],
  },
  {
    name: "index.html",
    title: "Split Layout",
    blurb: "Two big islands with a gap in the middle and platforms above.",
    platforms: [{ x: 40, y: 330, w: 290 }, { x: 470, y: 330, w: 290 }, { x: 325, y: 235, w: 150 }, { x: 90, y: 150, w: 170 }, { x: 540, y: 150, w: 170 }],
    spawns: [{ x: 180, y: 330 }, { x: 620, y: 330 }, { x: 400, y: 235 }, { x: 175, y: 150 }],
  },
  {
    name: "node_modules",
    title: "Deep Dependencies",
    blurb: "A tall stack of mid-sized platforms. Great for double jumps.",
    platforms: [{ x: 60, y: 340, w: 180 }, { x: 310, y: 310, w: 180 }, { x: 560, y: 340, w: 180 }, { x: 180, y: 215, w: 150 }, { x: 470, y: 215, w: 150 }, { x: 325, y: 120, w: 150 }],
    spawns: [{ x: 150, y: 340 }, { x: 650, y: 340 }, { x: 400, y: 310 }, { x: 255, y: 215 }],
  },
  {
    name: "package.json",
    title: "Twin Towers",
    blurb: "Symmetric towers on both sides with a bridge in the middle.",
    platforms: [{ x: 50, y: 345, w: 220 }, { x: 530, y: 345, w: 220 }, { x: 90, y: 255, w: 140 }, { x: 570, y: 255, w: 140 }, { x: 330, y: 270, w: 140 }, { x: 140, y: 165, w: 120 }, { x: 540, y: 165, w: 120 }],
    spawns: [{ x: 160, y: 345 }, { x: 640, y: 345 }, { x: 400, y: 270 }, { x: 160, y: 165 }],
  },
  {
    name: "README.md",
    title: "Tiny Island",
    blurb: "One small island and a tiny perch. Knockback decides everything.",
    platforms: [{ x: 250, y: 330, w: 300 }, { x: 360, y: 220, w: 80 }],
    spawns: [{ x: 290, y: 330 }, { x: 510, y: 330 }, { x: 400, y: 220 }, { x: 400, y: 330 }],
  },
  {
    name: ".gitignore",
    title: "Staircase",
    blurb: "Five steps climbing to the right. High ground wins.",
    platforms: [{ x: 40, y: 350, w: 160 }, { x: 190, y: 300, w: 140 }, { x: 330, y: 250, w: 140 }, { x: 470, y: 200, w: 140 }, { x: 610, y: 150, w: 150 }],
    spawns: [{ x: 100, y: 350 }, { x: 260, y: 300 }, { x: 540, y: 200 }, { x: 690, y: 150 }],
  },
  {
    name: "docker.yml",
    title: "Floating Grid",
    blurb: "Eight small platforms in a grid. Keep moving or get launched.",
    platforms: [{ x: 100, y: 340, w: 120 }, { x: 340, y: 340, w: 120 }, { x: 580, y: 340, w: 120 }, { x: 220, y: 250, w: 120 }, { x: 460, y: 250, w: 120 }, { x: 100, y: 160, w: 120 }, { x: 340, y: 160, w: 120 }, { x: 580, y: 160, w: 120 }],
    spawns: [{ x: 160, y: 340 }, { x: 640, y: 340 }, { x: 400, y: 340 }, { x: 400, y: 160 }],
  },
];

export const CAMPAIGN = [
  { title: "Hello, World", map: 0, brief: "Knock out one rookie Kiddie.", bots: [{ stocks: 2 }] },
  { title: "Cold Start", map: 1, brief: "A tougher Kiddie on a split stage.", bots: [{ stocks: 3 }] },
  { title: "BOSS: Null Pointer", map: 4, brief: "A heavy boss with a shotgun on a tiny island.", bots: [{ stocks: 4, boss: true, weapon: "shotgun" }] },
  { title: "Quick Fix", map: 3, brief: "New enemy: Sprinters dash straight at you.", bots: [{ stocks: 2 }, { stocks: 2 }] },
  { title: "Hot Reload", map: 5, brief: "Sprinters, one with an SMG.", bots: [{ stocks: 2 }, { stocks: 2, weapon: "smg" }] },
  { title: "BOSS: Race Condition", map: 1, brief: "A dashing boss and a Sprinter minion.", bots: [{ stocks: 4, boss: true, weapon: "smg" }, { stocks: 2 }] },
  { title: "Packet Filter", map: 2, brief: "New enemy: Firewalls shield against 3 hits.", bots: [{ stocks: 2 }, { stocks: 2 }] },
  { title: "Zero Trust", map: 6, brief: "Three Firewalls on a grid of tiny platforms.", bots: [{ stocks: 2 }, { stocks: 2 }, { stocks: 2 }] },
  { title: "BOSS: Firewall Prime", map: 0, brief: "A shielded sniper boss.", bots: [{ stocks: 4, boss: true, weapon: "sniper" }] },
  { title: "Ghost Process", map: 4, brief: "New enemy: Phantoms teleport next to you.", bots: [{ stocks: 2 }, { stocks: 2 }] },
  { title: "Segfault", map: 5, brief: "Phantom snipers on the staircase.", bots: [{ stocks: 3, weapon: "sniper" }, { stocks: 3, weapon: "sniper" }] },
  { title: "BOSS: Memory Leak", map: 3, brief: "A teleporting launcher boss with a Phantom minion.", bots: [{ stocks: 5, boss: true, weapon: "launcher" }, { stocks: 2 }] },
  { title: "Monolith", map: 6, brief: "New enemy: Titans take half the knockback.", bots: [{ stocks: 2, weapon: "shotgun" }, { stocks: 2, weapon: "shotgun" }] },
  { title: "Legacy Code", map: 2, brief: "Three armored Titans with heavy weapons.", bots: [{ stocks: 2, weapon: "launcher" }, { stocks: 2, weapon: "shotgun" }, { stocks: 2, weapon: "smg" }] },
  { title: "FINAL BOSS: Kernel Panic", map: 1, brief: "An armored launcher boss with a Phantom and a Firewall.", bots: [{ stocks: 6, boss: true, weapon: "launcher" }, { stocks: 2, tier: 3 }, { stocks: 2, tier: 2 }] },
];

const AI_PROFILES = {
  easy: { reaction: 0.34, fireChance: 0.45, spreadError: 0.14, speed: 0.78 },
  medium: { reaction: 0.2, fireChance: 0.7, spreadError: 0.07, speed: 0.92 },
  hard: { reaction: 0.1, fireChance: 0.92, spreadError: 0.025, speed: 1 },
};

const sign = (value) => (value > 0 ? 1 : value < 0 ? -1 : 0);
const approach = (value, target, amount) => (value < target ? Math.min(target, value + amount) : Math.max(target, value - amount));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const centerX = (fighter) => fighter.x + FIGHTER_W / 2;

function createFighter(id, name, color, team, stocks, spawn, ai, spec = {}) {
  const weapon = spec.weapon || "pistol";
  const ammo = spec.boss ? Infinity : WEAPONS[weapon].ammo;
  const skill = spec.skill || "none";
  const heavy = skill === "heavy";
  return {
    id,
    name,
    color,
    team,
    stocks,
    human: !ai,
    points: 0,
    kos: 0,
    skill,
    typeIndex: spec.typeIndex || 0,
    skillTimer: 2 + Math.random() * 2,
    shield: skill === "shield" ? 3 : 0,
    maxStocks: stocks + 2,
    buffs: { sudo: 0, turbo: 0, loop: 0, lag: 0 },
    maxJumps: skill === "overclock" ? 2 : 1,
    fireRate: skill === "overclock" ? 0.55 : 1,
    boss: Boolean(spec.boss),
    knockResist: heavy ? (spec.boss ? 0.4 : 0.5) : spec.boss ? 0.55 : 1,
    loadout: { weapon, ammo },
    x: spawn.x - FIGHTER_W / 2,
    y: spawn.y - FIGHTER_H,
    vx: 0,
    vy: 0,
    facing: ai ? -1 : 1,
    grounded: true,
    jumps: skill === "overclock" ? 2 : 1,
    damage: 0,
    weapon,
    ammo,
    cooldown: 0,
    invuln: 1,
    drop: 0,
    flash: 0,
    lastAttacker: null,
    lastAttackedAt: -10,
    ai,
  };
}

export function createBrawl(level, difficulty, setup = { mode: "versus", stage: 0, opponents: 1 }) {
  const online = setup.mode === "online";
  const rivals = online && setup.teamMode === "rivals";
  const campaign = setup.mode === "campaign";
  const mission = campaign ? CAMPAIGN[Math.min(level, CAMPAIGN.length) - 1] : null;
  const map = MAPS[(campaign ? mission.map : setup.stage) % MAPS.length];
  const profile = AI_PROFILES[difficulty] || AI_PROFILES.easy;
  const playerStocks = rivals ? 3 : { easy: 5, medium: 4, hard: 3 }[difficulty] || 4;
  const baseStocks = { easy: 2, medium: 2, hard: 3 }[difficulty] || 2;
  const levelPressure = campaign ? 1 : Math.max(0.6, 1 - (level - 1) * 0.05);
  const tier = tierForLevel(level);
  const roster = rivals
    ? []
    : campaign
      ? mission.bots.map((spec) => ({ ...spec, stocks: Math.max(1, spec.stocks + (difficulty === "hard" ? 1 : 0)) }))
      : Array.from({ length: Math.min(3, Math.max(1, setup.opponents || 1)) }, () => ({ stocks: Math.min(4, baseStocks + Math.floor((level - 1) / 3)) }));
  const humans = online
    ? setup.players.map((player, index) => createFighter(player.id, player.name, PLAYER_COLORS[index % PLAYER_COLORS.length], rivals ? 100 + player.id : 0, playerStocks, map.spawns[index % map.spawns.length], null))
    : [createFighter(0, "YOU", PLAYER_COLORS[0], 0, playerStocks, map.spawns[0], null)];
  const fighters = [...humans];
  roster.forEach((spec, index) => {
    const type = ENEMY_TYPES[spec.tier ?? tier];
    const typeIndex = spec.tier ?? tier;
    const heavy = type.skill === "heavy";
    const ai = {
      ...profile,
      speed: (spec.boss ? Math.max(profile.speed, 0.9) : profile.speed) * (heavy ? 0.85 : 1),
      reaction: profile.reaction * levelPressure * (spec.boss ? 0.8 : 1),
      timer: Math.random() * 0.3,
      dir: 0,
      face: 1,
      jump: false,
      down: false,
      fire: false,
    };
    const name = spec.boss ? `BOSS ${type.name}` : roster.length > 1 ? `${type.name}_${index + 1}` : type.name;
    fighters.push(createFighter(10 + index, name, spec.boss ? BOSS_COLOR : type.color, 1, spec.stocks, map.spawns[(humans.length + index) % map.spawns.length], ai, { ...spec, skill: type.skill, typeIndex }));
  });
  return { map, fighters, bullets: [], crates: [], fx: [], clock: 0, crateTimer: 2.5, level, difficulty, mode: setup.mode, mission, rivals, online, me: 0, countdown: 0 };
}

export function enemyTypes(world) {
  const seen = new Set();
  return world.fighters.filter((fighter) => !fighter.human && !seen.has(fighter.typeIndex) && seen.add(fighter.typeIndex)).map((fighter) => ENEMY_TYPES[fighter.typeIndex]);
}

function overPlatform(map, fighter) {
  const cx = centerX(fighter);
  const feet = fighter.y + FIGHTER_H;
  return map.platforms.find((platform) => cx >= platform.x - 4 && cx <= platform.x + platform.w + 4 && platform.y >= feet - 6);
}

function floorAhead(map, fighter, dir) {
  const probe = centerX(fighter) + dir * 26;
  const feet = fighter.y + FIGHTER_H;
  return map.platforms.some((platform) => probe >= platform.x && probe <= platform.x + platform.w && Math.abs(platform.y - feet) < 8);
}

function canLeap(map, fighter, dir) {
  const cx = centerX(fighter);
  const feet = fighter.y + FIGHTER_H;
  return map.platforms.some((platform) => {
    if (Math.abs(platform.y - feet) < 8 && cx >= platform.x && cx <= platform.x + platform.w) return false;
    if (platform.y < feet - 130 || platform.y > feet + 160) return false;
    return dir > 0 ? platform.x + platform.w > cx + 20 && platform.x - cx < 170 : platform.x < cx - 20 && cx - (platform.x + platform.w) < 170;
  });
}

function pushFx(world, fx) {
  if (world.fx.length < 70) world.fx.push(fx);
}

function burst(world, x, y, color, count, speed) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    pushFx(world, { type: "spark", x, y, vx: Math.cos(angle) * speed * (0.4 + Math.random()), vy: Math.sin(angle) * speed * (0.4 + Math.random()), t: 0, life: 0.35, color });
  }
}

function applyKnock(world, fighter, dirX, dirY, knockForce, damage, attacker) {
  if (fighter.shield > 0) {
    fighter.shield -= 1;
    fighter.skillTimer = Math.max(fighter.skillTimer, 4);
    pushFx(world, { type: "ring", x: centerX(fighter), y: fighter.y + 18, r: 0, max: 30, t: 0, life: 0.25, color: "#38bdf8" });
    return;
  }
  const sudoBoost = attacker && attacker.buffs.sudo > 0 ? 1.8 : 1;
  const knock = knockForce * sudoBoost * fighter.knockResist;
  fighter.damage += damage * (sudoBoost > 1 ? 1.5 : 1);
  const scale = 1 + fighter.damage / 65;
  fighter.vx = clamp(fighter.vx + dirX * knock * scale, -1400, 1400);
  fighter.vy = clamp(fighter.vy + (dirY * knock * 0.5 - knock * 0.25) * scale, -620, 620);
  if (fighter.vy < -40) fighter.grounded = false;
  fighter.flash = 0.12;
  if (attacker) {
    fighter.lastAttacker = attacker.id;
    fighter.lastAttackedAt = world.clock;
    if (attacker.human) attacker.points += 5;
  }
  burst(world, centerX(fighter), fighter.y + 16, fighter.color, 4, 140);
}

function explode(world, bullet) {
  pushFx(world, { type: "ring", x: bullet.x, y: bullet.y, r: 0, max: bullet.radius, t: 0, life: 0.3, color: "#fb923c" });
  const attacker = world.fighters.find((fighter) => fighter.id === bullet.owner);
  for (const fighter of world.fighters) {
    if (fighter.stocks <= 0 || fighter.team === bullet.team || fighter.invuln > 0) continue;
    const dx = centerX(fighter) - bullet.x;
    const dy = fighter.y + FIGHTER_H / 2 - bullet.y;
    const distance = Math.hypot(dx, dy);
    if (distance > bullet.radius + 14) continue;
    const falloff = 1 - (distance / (bullet.radius + 14)) * 0.5;
    applyKnock(world, fighter, distance ? dx / distance : sign(bullet.vx), distance ? dy / distance : 0, bullet.knock * falloff, bullet.damage, attacker);
  }
}

function spawnPoint(world) {
  const spawn = world.map.spawns[Math.floor(Math.random() * world.map.spawns.length)];
  return spawn.x;
}

function knockOut(world, fighter) {
  fighter.stocks -= 1;
  const edgeX = clamp(centerX(fighter), 8, ARENA_W - 8);
  const edgeY = clamp(fighter.y, 8, ARENA_H - 8);
  burst(world, edgeX, edgeY, fighter.color, 18, 320);
  pushFx(world, { type: "ring", x: edgeX, y: edgeY, r: 0, max: 60, t: 0, life: 0.4, color: fighter.color });
  const killer = world.fighters.find((candidate) => candidate.id === fighter.lastAttacker);
  if (killer && killer.human && killer.team !== fighter.team && world.clock - fighter.lastAttackedAt < 6) {
    killer.points += 100;
    killer.kos += 1;
  }
  fighter.lastAttacker = null;
  if (!fighter.human && Math.random() < (fighter.boss ? 1 : 0.4)) spawnCrate(world, pickPowerup());
  if (fighter.stocks <= 0) {
    fighter.vx = 0;
    fighter.vy = 0;
    return;
  }
  for (const id of BUFF_IDS) fighter.buffs[id] = 0;
  fighter.x = spawnPoint(world) - FIGHTER_W / 2;
  fighter.y = -60;
  fighter.vx = 0;
  fighter.vy = 0;
  fighter.damage = 0;
  fighter.weapon = fighter.loadout.weapon;
  fighter.ammo = fighter.loadout.ammo;
  fighter.invuln = 2.5;
  fighter.jumps = fighter.maxJumps;
  fighter.shield = fighter.skill === "shield" ? 3 : 0;
}

function fireWeapon(world, fighter, spread) {
  const weapon = WEAPONS[fighter.weapon];
  fighter.cooldown = weapon.cooldown * fighter.fireRate;
  const muzzleX = centerX(fighter) + fighter.facing * (8 + weapon.length);
  const muzzleY = fighter.y + 19;
  for (let pellet = 0; pellet < weapon.pellets; pellet += 1) {
    const angle = (Math.random() - 0.5) * 2 * (weapon.spread + spread);
    world.bullets.push({
      x: muzzleX,
      y: muzzleY,
      vx: fighter.facing * weapon.speed * Math.cos(angle),
      vy: weapon.speed * Math.sin(angle),
      life: weapon.life,
      owner: fighter.id,
      team: fighter.team,
      damage: weapon.damage,
      knock: weapon.knock,
      explosive: Boolean(weapon.explosive),
      radius: weapon.radius,
      color: fighter.color,
    });
  }
  fighter.vx -= fighter.facing * weapon.recoil;
  burst(world, muzzleX, muzzleY, "#ffffff", 2, 120);
  if (Number.isFinite(fighter.ammo)) {
    fighter.ammo -= 1;
    if (fighter.ammo <= 0) {
      fighter.weapon = "pistol";
      fighter.ammo = Infinity;
    }
  }
}

function updateFighter(world, fighter, control, dt) {
  const buffs = fighter.buffs;
  for (const id of BUFF_IDS) buffs[id] = Math.max(0, buffs[id] - dt);
  fighter.invuln = Math.max(0, fighter.invuln - dt);
  fighter.cooldown = Math.max(0, fighter.cooldown - dt * (buffs.turbo > 0 ? 1.8 : 1) * (buffs.lag > 0 ? 0.5 : 1));
  fighter.flash = Math.max(0, fighter.flash - dt);
  fighter.drop = Math.max(0, fighter.drop - dt);

  const speedScale = (fighter.ai ? fighter.ai.speed : 1) * (buffs.turbo > 0 ? 1.35 : 1) * (buffs.lag > 0 ? 0.5 : 1);
  const maxSpeed = MOVE_SPEED * speedScale;
  const dir = control.dir;
  if (dir) fighter.facing = dir;
  else if (control.face) fighter.facing = control.face;

  if (dir && (Math.abs(fighter.vx) <= maxSpeed || sign(fighter.vx) !== dir)) {
    fighter.vx = approach(fighter.vx, dir * maxSpeed, (fighter.grounded ? 3400 : 1900) * dt);
  } else {
    const friction = fighter.grounded ? (Math.abs(fighter.vx) > maxSpeed * 1.3 ? 1100 : 2600) : 70;
    fighter.vx = approach(fighter.vx, 0, friction * dt);
  }

  if (control.jump) {
    if (fighter.grounded) {
      fighter.vy = -560;
      fighter.grounded = false;
    } else if (fighter.jumps > 0 || buffs.loop > 0) {
      fighter.vy = -500;
      if (buffs.loop <= 0) fighter.jumps -= 1;
      burst(world, centerX(fighter), fighter.y + FIGHTER_H, "#ffffff", 3, 90);
    }
  }
  if (control.down && fighter.grounded) {
    fighter.drop = 0.25;
    fighter.grounded = false;
  }

  const previousBottom = fighter.y + FIGHTER_H;
  fighter.vy = Math.min(MAX_FALL, fighter.vy + GRAVITY * dt);
  fighter.x += fighter.vx * dt;
  fighter.y += fighter.vy * dt;
  fighter.grounded = false;
  if (fighter.vy >= 0 && fighter.drop <= 0) {
    const bottom = fighter.y + FIGHTER_H;
    for (const platform of world.map.platforms) {
      if (previousBottom <= platform.y + 2 && bottom >= platform.y && fighter.x + FIGHTER_W > platform.x + 2 && fighter.x < platform.x + platform.w - 2) {
        fighter.y = platform.y - FIGHTER_H;
        fighter.vy = 0;
        fighter.grounded = true;
        fighter.jumps = fighter.maxJumps;
        break;
      }
    }
  }

  if (control.fire && fighter.cooldown <= 0) fireWeapon(world, fighter, fighter.ai ? fighter.ai.spreadError : 0);

  if (fighter.x < BLAST.left || fighter.x > BLAST.right || fighter.y > BLAST.bottom || fighter.y < BLAST.top) knockOut(world, fighter);
}

function nearestCrate(world, fighter) {
  let best = null;
  let bestDistance = 300;
  for (const crate of world.crates) {
    if (WEAPONS[crate.item] && fighter.weapon !== "pistol") continue;
    const distance = Math.abs(crate.x - centerX(fighter));
    if (distance < bestDistance && Math.abs(crate.y - fighter.y) < 150) {
      best = crate;
      bestDistance = distance;
    }
  }
  return best;
}

function decide(world, fighter, target) {
  const ai = fighter.ai;
  const weapon = WEAPONS[fighter.weapon];
  const crate = nearestCrate(world, fighter);
  if (crate) {
    const dx = crate.x - centerX(fighter);
    ai.dir = Math.abs(dx) > 8 ? sign(dx) : 0;
    ai.face = sign(dx) || ai.face;
    ai.fire = false;
    if (fighter.grounded && crate.y < fighter.y - 10) ai.jump = true;
    return;
  }
  const dx = centerX(target) - centerX(fighter);
  const dy = target.y - fighter.y;
  const distance = Math.abs(dx);
  const preferred = fighter.weapon === "shotgun" ? 110 : fighter.weapon === "launcher" ? 260 : fighter.weapon === "sniper" ? 380 : 190;
  ai.face = sign(dx) || ai.face;
  ai.dir = distance > preferred + 30 ? sign(dx) : 0;
  if (dy < -40 && fighter.grounded && Math.random() < 0.8) ai.jump = true;
  else if (dy < -40 && !fighter.grounded && fighter.jumps > 0 && fighter.vy > 0) ai.jump = true;
  else if (dy > 70 && distance < 70 && fighter.grounded) ai.down = true;
  else if (Math.abs(dy) < 45 && fighter.grounded && Math.random() < 0.07) ai.jump = true;
  const range = weapon.speed * weapon.life * 0.9;
  const aligned = Math.abs(dy) < 45 && distance < range && target.invuln <= 0;
  ai.fire = aligned && Math.random() < ai.fireChance;
}

function nearestHuman(world, fighter) {
  let best = null;
  let bestDistance = Infinity;
  for (const candidate of world.fighters) {
    if (!candidate.human || candidate.stocks <= 0) continue;
    const distance = Math.hypot(candidate.x - fighter.x, (candidate.y - fighter.y) * 1.5);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function thinkBot(world, fighter, dt) {
  const ai = fighter.ai;
  const target = nearestHuman(world, fighter);
  const control = { dir: 0, jump: false, down: false, fire: false, face: ai.face };
  if (!target) return control;

  const over = overPlatform(world.map, fighter);
  if (!over) {
    let nearest = world.map.platforms[0];
    for (const platform of world.map.platforms) {
      if (Math.abs(platform.x + platform.w / 2 - centerX(fighter)) < Math.abs(nearest.x + nearest.w / 2 - centerX(fighter))) nearest = platform;
    }
    control.dir = sign(nearest.x + nearest.w / 2 - centerX(fighter));
    control.jump = fighter.jumps > 0 && fighter.vy > 0 && fighter.y + FIGHTER_H > nearest.y - 6;
    return control;
  }

  ai.timer -= dt;
  if (ai.timer <= 0) {
    ai.timer = ai.reaction * (0.7 + Math.random() * 0.6);
    decide(world, fighter, target);
  }
  control.dir = ai.dir;
  control.face = ai.face;
  control.fire = ai.fire;
  control.jump = ai.jump;
  control.down = ai.down;
  ai.jump = false;
  ai.down = false;

  if (fighter.grounded && control.dir && !floorAhead(world.map, fighter, control.dir)) {
    if (canLeap(world.map, fighter, control.dir)) control.jump = true;
    else control.dir = 0;
  }
  return control;
}

function updateBullets(world, dt) {
  for (let index = world.bullets.length - 1; index >= 0; index -= 1) {
    const bullet = world.bullets[index];
    const previousX = bullet.x;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    let spent = bullet.life <= 0 || bullet.x < BLAST.left || bullet.x > BLAST.right || bullet.y < BLAST.top || bullet.y > BLAST.bottom;
    let exploded = false;
    if (!spent) {
      const left = Math.min(previousX, bullet.x) - 2;
      const right = Math.max(previousX, bullet.x) + 2;
      for (const fighter of world.fighters) {
        if (fighter.stocks <= 0 || fighter.team === bullet.team || fighter.invuln > 0) continue;
        if (right > fighter.x && left < fighter.x + FIGHTER_W && bullet.y + 2 > fighter.y && bullet.y - 2 < fighter.y + FIGHTER_H) {
          if (bullet.explosive) {
            explode(world, bullet);
            exploded = true;
          } else {
            applyKnock(world, fighter, sign(bullet.vx), 0, bullet.knock, bullet.damage, world.fighters.find((owner) => owner.id === bullet.owner));
          }
          spent = true;
          break;
        }
      }
    }
    if (spent && bullet.explosive && !exploded && bullet.life <= 0) explode(world, bullet);
    if (spent) world.bullets.splice(index, 1);
  }
}

function spawnCrate(world, item) {
  if (world.crates.length >= 4) return;
  const platform = world.map.platforms[Math.floor(Math.random() * world.map.platforms.length)];
  world.crates.push({ x: platform.x + 14 + Math.random() * (platform.w - 28), y: -30, vy: 0, ttl: 22, item });
}

function applyPowerup(world, fighter, id) {
  const power = POWERUPS[id];
  const x = centerX(fighter);
  pushFx(world, { type: "text", x, y: fighter.y - 14, text: power.label, color: power.color, t: 0, life: 1.2 });
  pushFx(world, { type: "ring", x, y: fighter.y + 18, r: 0, max: 34, t: 0, life: 0.35, color: power.color });
  if (id === "sandbox") fighter.shield = Math.min(4, fighter.shield + 2);
  else if (id === "gc") fighter.damage *= 0.4;
  else if (id === "commit") fighter.stocks = Math.min(fighter.maxStocks, fighter.stocks + 1);
  else if (id === "segfault") {
    pushFx(world, { type: "ring", x, y: fighter.y + 18, r: 0, max: 130, t: 0, life: 0.45, color: power.color });
    burst(world, x, fighter.y + 18, power.color, 14, 260);
    for (const other of world.fighters) {
      if (other.stocks <= 0 || other.team === fighter.team || other.invuln > 0) continue;
      const dx = centerX(other) - x;
      const dy = other.y + FIGHTER_H / 2 - (fighter.y + 18);
      const distance = Math.hypot(dx, dy);
      if (distance > 130) continue;
      applyKnock(world, other, sign(dx) || fighter.facing, distance ? dy / distance : 0, 520, 8, fighter);
    }
  } else if (id === "lag") {
    for (const other of world.fighters) if (other.stocks > 0 && other.team !== fighter.team) other.buffs.lag = power.duration;
  } else fighter.buffs[id] = power.duration;
}

function updateCrates(world, dt) {
  world.crateTimer -= dt;
  if (world.crateTimer <= 0) {
    world.crateTimer = 6 + Math.random() * 3;
    if (world.crates.length < 3) spawnCrate(world, Math.random() < 0.5 ? pickPowerup() : CRATE_WEAPONS[Math.floor(Math.random() * CRATE_WEAPONS.length)]);
  }
  for (let index = world.crates.length - 1; index >= 0; index -= 1) {
    const crate = world.crates[index];
    const previousBottom = crate.y + 9;
    crate.ttl -= dt;
    crate.vy = Math.min(MAX_FALL, crate.vy + GRAVITY * dt);
    crate.y += crate.vy * dt;
    for (const platform of world.map.platforms) {
      if (crate.vy >= 0 && previousBottom <= platform.y + 2 && crate.y + 9 >= platform.y && crate.x > platform.x && crate.x < platform.x + platform.w) {
        crate.y = platform.y - 9;
        crate.vy = 0;
      }
    }
    const taker = world.fighters.find((fighter) => fighter.stocks > 0 && Math.abs(centerX(fighter) - crate.x) < 16 && crate.y > fighter.y - 8 && crate.y < fighter.y + FIGHTER_H + 8);
    if (taker) {
      if (WEAPONS[crate.item]) {
        taker.weapon = crate.item;
        taker.ammo = WEAPONS[crate.item].ammo;
        pushFx(world, { type: "ring", x: crate.x, y: crate.y, r: 0, max: 26, t: 0, life: 0.3, color: taker.color });
      } else {
        applyPowerup(world, taker, crate.item);
      }
      world.crates.splice(index, 1);
    } else if (crate.y > ARENA_H + 80 || crate.ttl <= 0) {
      world.crates.splice(index, 1);
    }
  }
}

function updateFx(world, dt) {
  for (let index = world.fx.length - 1; index >= 0; index -= 1) {
    const fx = world.fx[index];
    fx.t += dt;
    if (fx.type === "spark") {
      fx.x += fx.vx * dt;
      fx.y += fx.vy * dt;
    } else if (fx.type === "text") {
      fx.y -= 26 * dt;
    } else {
      fx.r = fx.max * (fx.t / fx.life);
    }
    if (fx.t >= fx.life) world.fx.splice(index, 1);
  }
}

function blinkTo(world, fighter, platform) {
  pushFx(world, { type: "ring", x: centerX(fighter), y: fighter.y + 18, r: 0, max: 30, t: 0, life: 0.3, color: fighter.color });
  fighter.x = platform.x + 14 + Math.random() * Math.max(1, platform.w - 28) - FIGHTER_W / 2;
  fighter.y = platform.y - FIGHTER_H - 2;
  fighter.vx = 0;
  fighter.vy = 0;
  fighter.invuln = Math.max(fighter.invuln, 0.3);
  pushFx(world, { type: "ring", x: centerX(fighter), y: fighter.y + 18, r: 0, max: 30, t: 0, life: 0.3, color: fighter.color });
  burst(world, centerX(fighter), fighter.y + 18, fighter.color, 8, 200);
}

function updateSkills(world, fighter, dt) {
  const target = nearestHuman(world, fighter);
  fighter.skillTimer -= dt;
  const hard = world.difficulty === "hard" ? 0.75 : 1;
  if (fighter.skill === "overclock") fighter.damage = Math.max(0, fighter.damage - 3 * dt);
  if (fighter.skill === "shield") {
    if (fighter.shield >= 3) fighter.skillTimer = 6;
    else if (fighter.skillTimer <= 0) {
      fighter.shield += 1;
      fighter.skillTimer = 6 * hard;
    }
    return;
  }
  if (!target) return;
  if (fighter.skill === "dash" && fighter.skillTimer <= 0) {
    const dx = centerX(target) - centerX(fighter);
    if (Math.abs(dx) > 140) {
      fighter.vx = sign(dx) * 640;
      fighter.facing = sign(dx);
      fighter.skillTimer = (2 + Math.random() * 1.5) * hard;
      burst(world, centerX(fighter), fighter.y + 24, fighter.color, 6, 160);
    }
  }
  if (fighter.skill === "blink") {
    const platforms = world.map.platforms;
    const over = overPlatform(world.map, fighter);
    if (fighter.skillTimer <= 0 || (!over && fighter.skillTimer < 3)) {
      const feet = target.y + FIGHTER_H;
      let destination = platforms[0];
      if (!over) {
        for (const platform of platforms) {
          if (Math.abs(platform.x + platform.w / 2 - centerX(fighter)) < Math.abs(destination.x + destination.w / 2 - centerX(fighter))) destination = platform;
        }
      } else {
        for (const platform of platforms) {
          if (Math.abs(platform.y - feet) < Math.abs(destination.y - feet)) destination = platform;
        }
      }
      blinkTo(world, fighter, destination);
      fighter.skillTimer = (4.5 + Math.random() * 1.5) * hard;
    }
  }
}

export function stepBrawl(world, dt, controls) {
  world.clock += dt;
  for (const fighter of world.fighters) {
    if (fighter.stocks <= 0) continue;
    if (!fighter.human) updateSkills(world, fighter, dt);
    updateFighter(world, fighter, fighter.human ? controls[fighter.id] || IDLE_CONTROL : thinkBot(world, fighter, dt), dt);
  }
  updateBullets(world, dt);
  updateCrates(world, dt);
  updateFx(world, dt);
}

const IDLE_CONTROL = { dir: 0, jump: false, down: false, fire: false };

export function matchOutcome(world) {
  const humans = world.fighters.filter((fighter) => fighter.human);
  if (world.rivals) {
    const alive = humans.filter((fighter) => fighter.stocks > 0);
    return alive.length <= 1 ? { winnerId: alive[0] ? alive[0].id : null } : null;
  }
  if (humans.every((fighter) => fighter.stocks <= 0)) return { won: false };
  if (world.fighters.every((fighter) => fighter.human || fighter.stocks <= 0)) return { won: true };
  return null;
}

export function brawlResult(world, myId = 0) {
  const outcome = matchOutcome(world);
  if (!outcome) return "running";
  if (world.rivals) return outcome.winnerId === myId ? "won" : "lost";
  return outcome.won ? "won" : "lost";
}

export function brawlHud(world, myId = 0) {
  const player = world.fighters.find((fighter) => fighter.id === myId) || world.fighters[0];
  return {
    stocks: player.stocks,
    damage: Math.round(player.damage),
    foes: world.fighters.filter((fighter) => fighter.team !== player.team).reduce((total, fighter) => total + Math.max(0, fighter.stocks), 0),
    knockouts: player.kos,
    score: player.points,
  };
}

export function describeFighters(world) {
  return world.fighters.map((fighter) => ({
    id: fighter.id,
    name: fighter.name,
    color: fighter.color,
    team: fighter.team,
    human: fighter.human,
    skill: fighter.skill,
    typeIndex: fighter.typeIndex,
    boss: fighter.boss,
    stocks: fighter.stocks,
    x: fighter.x,
    y: fighter.y,
  }));
}

const round1 = (value) => Math.round(value * 10) / 10;

export function snapshotBrawl(world) {
  return {
    c: Math.round(world.clock * 100) / 100,
    cd: world.countdown > 0 ? Math.ceil(world.countdown) : 0,
    f: world.fighters.map((f) => [f.id, round1(f.x), round1(f.y), Math.round(f.vx), Math.round(f.vy), f.facing, f.stocks, Math.round(f.damage), f.weapon, Number.isFinite(f.ammo) ? f.ammo : -1, f.shield, f.invuln > 0 ? 1 : 0, f.flash > 0 ? 1 : 0, f.cooldown > 0 ? Math.round(f.cooldown * 100) : 0, f.grounded ? 1 : 0, f.points, f.kos, BUFF_IDS.map((id) => round1(f.buffs[id]))]),
    b: world.bullets.map((b) => [Math.round(b.x), Math.round(b.y), Math.round(b.vx), Math.round(b.vy), b.owner, b.explosive ? 1 : 0]),
    k: world.crates.map((crate) => [Math.round(crate.x), Math.round(crate.y), crate.item, Math.round(crate.ttl)]),
    x: world.fx.slice(0, 24).map((fx) => [fx.type === "ring" ? 0 : fx.type === "spark" ? 1 : 2, Math.round(fx.x), Math.round(fx.y), fx.type === "ring" ? Math.round(fx.max) : Math.round(fx.vx || 0), fx.type === "spark" ? Math.round(fx.vy) : 0, Math.round(fx.t * 100), Math.round(fx.life * 100), fx.color, fx.text || ""]),
  };
}

export function createViewWorld(start) {
  const map = MAPS[start.stage % MAPS.length];
  return {
    map,
    fighters: start.fighters.map((fighter) => ({
      ...fighter,
      vx: 0,
      vy: 0,
      tx: fighter.x,
      ty: fighter.y,
      facing: 1,
      damage: 0,
      weapon: "pistol",
      ammo: Infinity,
      shield: fighter.skill === "shield" ? 3 : 0,
      invuln: 1,
      flash: 0,
      cooldown: 0,
      grounded: true,
      points: 0,
      kos: 0,
      buffs: { sudo: 0, turbo: 0, loop: 0, lag: 0 },
    })),
    bullets: [],
    crates: [],
    fx: [],
    clock: 0,
    level: start.level,
    mode: "online",
    mission: null,
    rivals: start.teamMode === "rivals",
    online: true,
    me: start.me,
    countdown: 3,
    snapAt: 0,
  };
}

export function applySnapshot(view, snap, now) {
  view.clock = snap.c;
  view.countdown = snap.cd;
  view.snapAt = now;
  for (const row of snap.f) {
    const fighter = view.fighters.find((candidate) => candidate.id === row[0]);
    if (!fighter) continue;
    fighter.tx = row[1];
    fighter.ty = row[2];
    if (Math.hypot(fighter.tx - fighter.x, fighter.ty - fighter.y) > 110) {
      fighter.x = fighter.tx;
      fighter.y = fighter.ty;
    }
    fighter.vx = row[3];
    fighter.vy = row[4];
    fighter.facing = row[5];
    fighter.stocks = row[6];
    fighter.damage = row[7];
    fighter.weapon = row[8];
    fighter.ammo = row[9] < 0 ? Infinity : row[9];
    fighter.shield = row[10];
    fighter.invuln = row[11];
    fighter.flash = row[12] ? 0.1 : 0;
    fighter.cooldown = row[13] / 100;
    fighter.grounded = Boolean(row[14]);
    fighter.points = row[15];
    fighter.kos = row[16];
    BUFF_IDS.forEach((id, buffIndex) => {
      fighter.buffs[id] = row[17][buffIndex];
    });
  }
  const colors = new Map(view.fighters.map((fighter) => [fighter.id, fighter.color]));
  view.bullets = snap.b.map((row) => ({ x: row[0], y: row[1], vx: row[2], vy: row[3], color: colors.get(row[4]) || "#ffffff", explosive: Boolean(row[5]) }));
  view.crates = snap.k.map((row) => ({ x: row[0], y: row[1], item: row[2], ttl: row[3] }));
  view.fx = snap.x.map((row) => {
    const base = { x: row[1], y: row[2], t: row[5] / 100, life: row[6] / 100, color: row[7] };
    if (row[0] === 0) return { ...base, type: "ring", r: 0, max: row[3] };
    if (row[0] === 1) return { ...base, type: "spark", vx: row[3], vy: row[4] };
    return { ...base, type: "text", text: row[8] };
  });
}

export function advanceView(view, dt) {
  const smoothing = 1 - Math.exp(-dt * 24);
  for (const fighter of view.fighters) {
    fighter.x += (fighter.tx + fighter.vx * 0.03 - fighter.x) * smoothing;
    fighter.y += (fighter.ty + fighter.vy * 0.03 - fighter.y) * smoothing;
  }
  for (const bullet of view.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
  }
  updateFx(view, dt);
}

function drawFighter(context, world, fighter) {
  const cx = centerX(fighter);
  const feet = fighter.y + FIGHTER_H;
  if (fighter.invuln > 0 && Math.floor(world.clock * 14) % 2 === 0) return;
  const weapon = WEAPONS[fighter.weapon];
  context.strokeStyle = fighter.flash > 0 ? "#ffffff" : fighter.color;
  context.lineWidth = fighter.skill === "heavy" ? 3.5 : 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.arc(cx, fighter.y + 7, 6, 0, Math.PI * 2);
  context.moveTo(cx, fighter.y + 13);
  context.lineTo(cx, fighter.y + 24);
  const stride = fighter.grounded ? (Math.abs(fighter.vx) > 25 ? Math.sin(fighter.x * 0.13) * 7 : 3) : 5;
  const lift = fighter.grounded ? 0 : 5;
  context.moveTo(cx, fighter.y + 24);
  context.lineTo(cx + stride, feet - lift);
  context.moveTo(cx, fighter.y + 24);
  context.lineTo(cx - stride, feet);
  const handX = cx + fighter.facing * 8;
  context.moveTo(cx, fighter.y + 16);
  context.lineTo(cx - fighter.facing * 5, fighter.y + 22);
  context.moveTo(cx, fighter.y + 16);
  context.lineTo(handX, fighter.y + 19);
  context.moveTo(handX, fighter.y + 19);
  context.lineTo(handX + fighter.facing * weapon.length, fighter.y + 19);
  context.moveTo(handX + fighter.facing * 2, fighter.y + 19);
  context.lineTo(handX + fighter.facing * 2, fighter.y + 24);
  context.stroke();
  if (fighter.boss) {
    context.beginPath();
    context.moveTo(cx - 5, fighter.y + 2);
    context.lineTo(cx - 8, fighter.y - 6);
    context.moveTo(cx + 5, fighter.y + 2);
    context.lineTo(cx + 8, fighter.y - 6);
    context.stroke();
  }
  if (fighter.cooldown > weapon.cooldown - 0.05) {
    const muzzle = handX + fighter.facing * (weapon.length + 4);
    context.beginPath();
    context.moveTo(muzzle, fighter.y + 19);
    context.lineTo(muzzle + fighter.facing * 7, fighter.y + 15);
    context.moveTo(muzzle, fighter.y + 19);
    context.lineTo(muzzle + fighter.facing * 9, fighter.y + 19);
    context.moveTo(muzzle, fighter.y + 19);
    context.lineTo(muzzle + fighter.facing * 7, fighter.y + 23);
    context.stroke();
  }
  if (fighter.invuln > 0) {
    context.setLineDash([3, 4]);
    context.beginPath();
    context.arc(cx, fighter.y + 20, 24, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }
  if (fighter.shield > 0) {
    context.lineWidth = 1.5;
    context.strokeStyle = "#38bdf8";
    context.beginPath();
    context.arc(cx, fighter.y + 19, 26, 0, Math.PI * 2);
    context.stroke();
    for (let charge = 0; charge < fighter.shield; charge += 1) {
      context.beginPath();
      context.arc(cx - 8 + charge * 8, fighter.y - 30, 2.5, 0, Math.PI * 2);
      context.stroke();
    }
  }
  const activeBuffs = BUFF_IDS.filter((id) => fighter.buffs[id] > 0);
  if (activeBuffs.length) {
    context.font = "9px ui-monospace, monospace";
    context.textAlign = fighter.facing > 0 ? "right" : "left";
    activeBuffs.forEach((id, index) => {
      context.fillStyle = POWERUPS[id].color;
      context.fillText(`${POWERUPS[id].label} ${Math.ceil(fighter.buffs[id])}s`, cx - fighter.facing * 16, fighter.y + 4 + index * 10);
    });
    context.lineWidth = 2;
    if (fighter.buffs.turbo > 0 && Math.abs(fighter.vx) > 60) {
      context.strokeStyle = POWERUPS.turbo.color;
      context.beginPath();
      for (let streak = 0; streak < 3; streak += 1) {
        const y = fighter.y + 10 + streak * 9;
        context.moveTo(cx - Math.sign(fighter.vx) * 12, y);
        context.lineTo(cx - Math.sign(fighter.vx) * (24 + streak * 5), y);
      }
      context.stroke();
    }
    if (fighter.buffs.sudo > 0) {
      context.strokeStyle = POWERUPS.sudo.color;
      context.beginPath();
      context.arc(cx + fighter.facing * 8, fighter.y + 19, 5, 0, Math.PI * 2);
      context.stroke();
    }
    if (fighter.buffs.loop > 0) {
      context.fillStyle = POWERUPS.loop.color;
      context.font = "13px ui-monospace, monospace";
      context.textAlign = "center";
      context.fillText("∞", cx, feet + 14);
    }
    if (fighter.buffs.lag > 0) {
      context.strokeStyle = POWERUPS.lag.color;
      context.setLineDash([2, 3]);
      context.strokeRect(cx - 14, fighter.y - 3, 28, FIGHTER_H + 6);
      context.setLineDash([]);
    }
  }
  context.font = FONT;
  context.textAlign = "center";
  const heat = clamp(fighter.damage / 150, 0, 1);
  context.fillStyle = `rgb(${Math.round(226 + heat * 25)}, ${Math.round(232 - heat * 120)}, ${Math.round(240 - heat * 130)})`;
  context.fillText(`${Math.round(fighter.damage)}%`, cx, fighter.y - 8);
  if (fighter.id === world.me) {
    context.fillStyle = fighter.color;
    context.fillText("▼", cx, fighter.y - 20);
  }
  if (world.online && fighter.human) {
    context.fillStyle = fighter.color;
    context.fillText(fighter.name, cx, fighter.y - (fighter.id === world.me ? 32 : 20));
  }
}

function drawOffscreen(context, fighter) {
  const cx = centerX(fighter);
  const cy = fighter.y + FIGHTER_H / 2;
  if (cx >= 0 && cx <= ARENA_W && cy >= 0 && cy <= ARENA_H) return;
  const x = clamp(cx, 16, ARENA_W - 16);
  const y = clamp(cy, 16, ARENA_H - 16);
  const angle = Math.atan2(ARENA_H / 2 - y, ARENA_W / 2 - x) + Math.PI;
  context.strokeStyle = fighter.color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x + Math.cos(angle) * 9, y + Math.sin(angle) * 9);
  context.lineTo(x + Math.cos(angle + 2.5) * 9, y + Math.sin(angle + 2.5) * 9);
  context.lineTo(x + Math.cos(angle - 2.5) * 9, y + Math.sin(angle - 2.5) * 9);
  context.closePath();
  context.stroke();
}

function drawHud(context, world) {
  const columnWidth = ARENA_W / world.fighters.length;
  world.fighters.forEach((fighter, index) => {
    const left = index * columnWidth + 14;
    context.strokeStyle = fighter.stocks > 0 ? fighter.color : "#334155";
    context.lineWidth = 1;
    context.strokeRect(left, 34, columnWidth - 28, 48);
    context.font = FONT;
    context.textAlign = "left";
    context.fillStyle = fighter.stocks > 0 ? fighter.color : "#475569";
    context.fillText(fighter.name, left + 8, 49);
    const weapon = WEAPONS[fighter.weapon];
    context.fillStyle = "#94a3b8";
    context.fillText(`${weapon.label}${Number.isFinite(fighter.ammo) ? ` ×${fighter.ammo}` : ""}`, left + 8, 63);
    if (!fighter.human && fighter.shield === 0 && fighter.skill === "shield") {
      context.fillStyle = "#64748b";
      context.fillText("shield down", left + 54, 76);
    }
    context.strokeStyle = fighter.color;
    for (let stock = 0; stock < Math.min(fighter.stocks, 7); stock += 1) {
      context.beginPath();
      context.arc(left + 12 + stock * 12, 76, 4, 0, Math.PI * 2);
      context.stroke();
    }
  });
}

export function drawBrawl(context, world, overlay) {
  context.clearRect(0, 0, ARENA_W, ARENA_H);
  context.fillStyle = "#080a0f";
  context.fillRect(0, 0, ARENA_W, ARENA_H);
  context.strokeStyle = "#111923";
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 0; x <= ARENA_W; x += 40) {
    context.moveTo(x, 0);
    context.lineTo(x, ARENA_H);
  }
  for (let y = 0; y <= ARENA_H; y += 40) {
    context.moveTo(0, y);
    context.lineTo(ARENA_W, y);
  }
  context.stroke();
  context.strokeStyle = "rgba(251, 113, 133, 0.35)";
  context.setLineDash([6, 6]);
  context.strokeRect(1, 1, ARENA_W - 2, ARENA_H - 2);
  context.setLineDash([]);
  context.font = FONT;
  context.textAlign = "left";
  context.fillStyle = "#475569";
  context.fillText(`// ${world.map.name}`, 14, 22);
  context.textAlign = "right";
  context.fillText(world.mode === "campaign" && world.mission ? `MISSION ${world.level}/${CAMPAIGN.length} · ${world.mission.title}` : world.online ? `ONLINE · ${world.rivals ? "RIVALS" : "ALLIES"} · ${world.map.title.toUpperCase()}` : `VERSUS · ${world.map.title.toUpperCase()}`, ARENA_W - 14, 22);

  for (const platform of world.map.platforms) {
    context.strokeStyle = "#22d3ee";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(platform.x, platform.y);
    context.lineTo(platform.x + platform.w, platform.y);
    context.stroke();
    context.strokeStyle = "rgba(34, 211, 238, 0.4)";
    context.lineWidth = 1;
    context.strokeRect(platform.x, platform.y, platform.w, 10);
    context.beginPath();
    for (let x = platform.x + 10; x < platform.x + platform.w - 4; x += 10) {
      context.moveTo(x, platform.y);
      context.lineTo(x - 5, platform.y + 10);
    }
    context.stroke();
  }

  for (const crate of world.crates) {
    if (crate.ttl < 4 && Math.floor(world.clock * 8) % 2 === 0) continue;
    const power = POWERUPS[crate.item];
    context.lineWidth = 2;
    context.textAlign = "center";
    if (power) {
      const pulse = 1 + Math.sin(world.clock * 6) * 0.12;
      context.strokeStyle = power.color;
      context.fillStyle = power.color;
      context.beginPath();
      context.moveTo(crate.x, crate.y - 12 * pulse);
      context.lineTo(crate.x + 12 * pulse, crate.y);
      context.lineTo(crate.x, crate.y + 12 * pulse);
      context.lineTo(crate.x - 12 * pulse, crate.y);
      context.closePath();
      context.stroke();
      context.font = "bold 12px ui-monospace, monospace";
      context.fillText(power.glyph, crate.x, crate.y + 4);
      context.font = "9px ui-monospace, monospace";
      context.fillText(power.label, crate.x, crate.y - 17);
      context.font = FONT;
    } else {
      context.strokeStyle = "#a3e635";
      context.fillStyle = "#a3e635";
      context.strokeRect(crate.x - 9, crate.y - 9, 18, 18);
      context.fillText(WEAPONS[crate.item].glyph, crate.x, crate.y + 4);
    }
  }

  for (const bullet of world.bullets) {
    context.strokeStyle = bullet.color;
    context.lineWidth = bullet.explosive ? 4 : 2;
    context.beginPath();
    context.moveTo(bullet.x - bullet.vx * 0.018, bullet.y - bullet.vy * 0.018);
    context.lineTo(bullet.x, bullet.y);
    context.stroke();
  }

  for (const fighter of world.fighters) {
    if (fighter.stocks > 0) drawFighter(context, world, fighter);
  }

  for (const fx of world.fx) {
    const alpha = 1 - fx.t / fx.life;
    context.globalAlpha = alpha;
    context.strokeStyle = fx.color;
    context.lineWidth = 2;
    if (fx.type === "text") {
      context.font = "bold 11px ui-monospace, monospace";
      context.textAlign = "center";
      context.fillStyle = fx.color;
      context.fillText(fx.text, fx.x, fx.y);
      context.font = FONT;
    } else if (fx.type === "ring") {
      context.beginPath();
      context.arc(fx.x, fx.y, fx.r, 0, Math.PI * 2);
      context.stroke();
    } else {
      context.beginPath();
      context.moveTo(fx.x, fx.y);
      context.lineTo(fx.x - fx.vx * 0.03, fx.y - fx.vy * 0.03);
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  for (const fighter of world.fighters) {
    if (fighter.stocks > 0) drawOffscreen(context, fighter);
  }
  drawHud(context, world);

  if (overlay === "countdown") {
    context.fillStyle = "rgba(8, 10, 15, 0.55)";
    context.fillRect(0, 0, ARENA_W, ARENA_H);
    context.textAlign = "center";
    context.font = "bold 56px ui-monospace, monospace";
    context.fillStyle = "#a3e635";
    context.fillText(String(Math.max(1, Math.ceil(world.countdown))), ARENA_W / 2, ARENA_H / 2 + 12);
    context.font = "12px ui-monospace, monospace";
    context.fillStyle = "#94a3b8";
    context.fillText("GET READY", ARENA_W / 2, ARENA_H / 2 + 40);
  } else if (overlay) {
    context.fillStyle = "rgba(8, 10, 15, 0.72)";
    context.fillRect(0, 0, ARENA_W, ARENA_H);
    context.textAlign = "center";
    context.font = "bold 20px ui-monospace, monospace";
    context.fillStyle = overlay === "paused" ? "#fbbf24" : "#a3e635";
    context.fillText(overlay === "paused" ? "PAUSED — PRESS P" : "PRESS A / D / W TO DEPLOY", ARENA_W / 2, ARENA_H / 2 - 6);
    context.font = "12px ui-monospace, monospace";
    context.fillStyle = "#94a3b8";
    context.fillText("A/D move · W jump (double) · S drop · J fire · pick up weapon crates", ARENA_W / 2, ARENA_H / 2 + 22);
    context.fillText("damage raises knockback — blast every bot off the screen", ARENA_W / 2, ARENA_H / 2 + 42);
    const introTypes = enemyTypes(world);
    context.fillStyle = "#94a3b8";
    introTypes.forEach((type, index) => {
      context.fillStyle = type.color;
      context.fillText(`◆ ${type.name}: ${type.blurb}`, ARENA_W / 2, ARENA_H / 2 + 72 + index * 18);
    });
  }
}
