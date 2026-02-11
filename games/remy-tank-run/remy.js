/* /games/remy-tank-run/remy.js */

const STORAGE = {
  high: "aidensarcade-remy-high",
  leaderboard: "aidensarcade-remy-leaderboard",
  settings: "aidensarcade-remy-settings",
  progress: "aidensarcade-remy-progress",
  achievements: "aidensarcade-remy-achievements",
  ghost: "aidensarcade-remy-ghost",
};

// ✅ Your car image (main obstacle + boss)
const OBSTACLE_IMG_SRC =
  "https://image2url.com/r2/default/images/1770830164179-3e663839-842b-4e92-9a7b-1cacc46b26c3.png";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const speedEl = document.getElementById("speed");
const coinsRunEl = document.getElementById("coinsRun");
const streakEl = document.getElementById("streak");
const shieldEl = document.getElementById("shield");

const topScoreEl = document.getElementById("topScore");
const topHighEl = document.getElementById("topHigh");
const topSpeedEl = document.getElementById("topSpeed");
const topCoinsEl = document.getElementById("topCoins");
const topStreakEl = document.getElementById("topStreak");
const shotStatusEl = document.getElementById("shotStatus");
const powerStatusEl = document.getElementById("powerStatus");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const settingsBtn = document.getElementById("settingsBtn");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySub = document.getElementById("overlaySub");
const overlayStart = document.getElementById("overlayStart");
const overlaySettings = document.getElementById("overlaySettings");

const scoreSubmit = document.getElementById("scoreSubmit");
const playerNameEl = document.getElementById("playerName");
const saveScoreBtn = document.getElementById("saveScoreBtn");

const jumpBtn = document.getElementById("jumpBtn");
const duckBtn = document.getElementById("duckBtn");
const shootBtn = document.getElementById("shootBtn");

const toastEl = document.getElementById("toast");

const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const difficultySelect = document.getElementById("difficultySelect");
const skinSelect = document.getElementById("skinSelect");
const resetHighBtn = document.getElementById("resetHighBtn");
const clearDataBtn = document.getElementById("clearDataBtn");
const dataNote = document.getElementById("dataNote");
const volumeRange = document.getElementById("volumeRange");
const volumeLabel = document.getElementById("volumeLabel");
const motionBlurToggle = document.getElementById("motionBlurToggle");
const alwaysRainToggle = document.getElementById("alwaysRainToggle");

const totalCoinsEl = document.getElementById("totalCoins");
const buyShotUpBtn = document.getElementById("buyShotUpBtn");
const shotUpInfo = document.getElementById("shotUpInfo");
const unlockSkinsBtn = document.getElementById("unlockSkinsBtn");
const skinsInfo = document.getElementById("skinsInfo");

const leaderboardList = document.getElementById("leaderboardList");
const achList = document.getElementById("achList");

// ---------- assets ----------
const obstacleImg = new Image();
obstacleImg.crossOrigin = "anonymous";
obstacleImg.src = OBSTACLE_IMG_SRC;
let obstacleAspect = 2.0;
obstacleImg.onload = () => {
  if (obstacleImg.naturalWidth && obstacleImg.naturalHeight) {
    obstacleAspect = obstacleImg.naturalWidth / obstacleImg.naturalHeight;
  }
};

// ---------- settings/progress ----------
const DEFAULT_SETTINGS = {
  volume: 0.7,
  motionBlur: false,
  alwaysRain: false,
  difficulty: "normal",
  skin: "neon",
};

const DEFAULT_PROGRESS = {
  totalCoins: 0,
  shotUpLevel: 0, // each level reduces base cooldown by 1s (min clamp)
  skinsUnlocked: false,
};

const SKINS = [
  { id: "neon", name: "Neon", c1: "rgba(14,165,233,0.95)", c2: "rgba(20,184,166,0.9)" },
  { id: "sunset", name: "Sunset", c1: "rgba(251,146,60,0.95)", c2: "rgba(244,63,94,0.9)" },
  { id: "lime", name: "Lime", c1: "rgba(132,204,22,0.95)", c2: "rgba(34,197,94,0.9)" },
  { id: "royal", name: "Royal", c1: "rgba(99,102,241,0.95)", c2: "rgba(168,85,247,0.9)" },
  { id: "mono", name: "Mono", c1: "rgba(255,255,255,0.85)", c2: "rgba(160,160,160,0.85)" },
];

function safeJsonParse(s, fallback) {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function loadSettings() {
  const raw = localStorage.getItem(STORAGE.settings);
  const s = safeJsonParse(raw, {});
  return { ...DEFAULT_SETTINGS, ...s };
}

function saveSettings(s) {
  localStorage.setItem(STORAGE.settings, JSON.stringify(s));
}

function loadProgress() {
  const raw = localStorage.getItem(STORAGE.progress);
  const p = safeJsonParse(raw, {});
  return { ...DEFAULT_PROGRESS, ...p };
}

function saveProgress(p) {
  localStorage.setItem(STORAGE.progress, JSON.stringify(p));
}

let SETTINGS = loadSettings();
let PROGRESS = loadProgress();

// ---------- achievements ----------
const ACH_DEFS = [
  { id: "score1000", name: "First 1,000", desc: "Reach 1,000 score in a run." },
  { id: "coins50", name: "Coin Collector", desc: "Collect 50 total coins." },
  { id: "shots10", name: "Sharpshooter", desc: "Destroy 10 obstacles with shots (total)." },
  { id: "streak20", name: "Combo King", desc: "Reach a 20 streak in one run." },
  { id: "noDuck", name: "No Duck Run", desc: "Score 800+ without ducking once." },
  { id: "bossDown", name: "Boss Down", desc: "Destroy a boss car." },
];

function loadAchievements() {
  const raw = localStorage.getItem(STORAGE.achievements);
  const a = safeJsonParse(raw, {});
  return typeof a === "object" && a ? a : {};
}

function saveAchievements(a) {
  localStorage.setItem(STORAGE.achievements, JSON.stringify(a));
}

let ACH = loadAchievements();

function unlockAchievement(id) {
  if (ACH[id]) return;
  ACH[id] = true;
  saveAchievements(ACH);

  const def = ACH_DEFS.find((d) => d.id === id);
  toast(`🏆 Achievement: ${def ? def.name : id}`);
  renderAchievements();
}

// ---------- leaderboard ----------
function loadLeaderboard() {
  const raw = localStorage.getItem(STORAGE.leaderboard);
  const list = safeJsonParse(raw, []);
  return Array.isArray(list) ? list : [];
}

function saveLeaderboard(list) {
  localStorage.setItem(STORAGE.leaderboard, JSON.stringify(list.slice(0, 10)));
}

let LEADERBOARD = loadLeaderboard();

// ---------- ghost ----------
function loadGhost() {
  const raw = localStorage.getItem(STORAGE.ghost);
  const g = safeJsonParse(raw, null);
  if (!g || typeof g !== "object") return null;
  if (!Array.isArray(g.samples) || typeof g.score !== "number") return null;
  return g;
}
function saveGhost(g) {
  localStorage.setItem(STORAGE.ghost, JSON.stringify(g));
}
let GHOST = loadGhost();

// ---------- audio (no external files needed) ----------
let audioCtx = null;

function ensureAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    audioCtx = null;
  }
}

function beep(freq, dur = 0.07, type = "sine") {
  if (!audioCtx || SETTINGS.volume <= 0) return;
  const t0 = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, SETTINGS.volume * 0.35), t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  o.connect(g);
  g.connect(audioCtx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function sfx(name) {
  ensureAudio();
  if (name === "jump") beep(420, 0.07, "triangle");
  if (name === "shoot") beep(720, 0.05, "square");
  if (name === "coin") beep(980, 0.06, "sine");
  if (name === "hit") beep(160, 0.12, "sawtooth");
  if (name === "power") beep(560, 0.10, "triangle");
  if (name === "shield") beep(320, 0.11, "triangle");
  if (name === "boss") beep(220, 0.15, "sawtooth");
}

// ---------- game constants ----------
const WORLD = { w: 960, h: 420, groundY: 330 };

const PLAYER = {
  x: 160,
  y: WORLD.groundY,
  w: 74,
  h: 46,
  vy: 0,
  gravity: 2400,
  jumpV: 860,
  onGround: true,
  ducking: false,
  jumpsUsed: 0,
};

const DIFFICULTY = {
  easy: { baseSpeed: 460, spawnBase: 1.15, spawnMin: 0.85, bossMin: 48, bossMax: 62 },
  normal: { baseSpeed: 520, spawnBase: 1.05, spawnMin: 0.65, bossMin: 40, bossMax: 55 },
  hard: { baseSpeed: 590, spawnBase: 0.95, spawnMin: 0.55, bossMin: 34, bossMax: 48 },
};

const GAME = {
  running: false,
  paused: false,
  gameOver: false,

  t: 0,
  score: 0,
  speed: 520,
  speedMult: 1,

  spawnTimer: 0,
  nextSpawn: 1.0,
  obstacles: [],
  particles: [],
  projectiles: [],

  pickups: [], // coins + powerups
  pickupTimer: 0,
  nextPickup: 1.3,

  lastTs: 0,

  // shooting
  baseShotCooldown: 10.0,
  shotTimer: 0,

  // power-ups
  power: { type: "none", t: 0 },

  // streak/coins
  streak: 0,
  bestStreak: 0,
  runCoins: 0,
  totalShotsHit: 0,
  duckUsedThisRun: false,
  bossKilledThisRun: false,

  // boss
  bossTimer: 0,
  nextBoss: 45,

  // weather
  rainOn: false,

  // ghost record
  record: [],
  nextRecord: 0,
};

// ---------- helpers ----------
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => (toastEl.hidden = true), 2200);
}

function setOverlay(show, title = "", sub = "") {
  overlay.hidden = !show;
  if (title) overlayTitle.textContent = title;
  if (sub) overlaySub.textContent = sub;
}

function effectiveShotCooldown() {
  const base = GAME.baseShotCooldown;
  const upgraded = clamp(base - PROGRESS.shotUpLevel, 3, base);
  if (GAME.power.type === "rapid") return 0.8;
  return upgraded;
}

function maxJumps() {
  return GAME.power.type === "double" ? 2 : 1;
}

// ---------- UI render ----------
function loadHigh() {
  const v = Number(localStorage.getItem(STORAGE.high) || "0");
  highEl.textContent = String(Number.isFinite(v) ? v : 0);
}

function saveHighIfNeeded() {
  const high = Number(highEl.textContent || "0");
  if (GAME.score > high) {
    localStorage.setItem(STORAGE.high, String(GAME.score));
    highEl.textContent = String(GAME.score);
  }
}

function syncUI() {
  scoreEl.textContent = String(GAME.score);
  speedEl.textContent = GAME.speedMult.toFixed(1);
  coinsRunEl.textContent = String(GAME.runCoins);
  streakEl.textContent = String(GAME.streak);
  shieldEl.textContent = GAME.power.type === "shield" ? "On" : "Off";

  if (topScoreEl) topScoreEl.textContent = String(GAME.score);
  if (topHighEl) topHighEl.textContent = highEl.textContent || "0";
  if (topSpeedEl) topSpeedEl.textContent = GAME.speedMult.toFixed(1);
  if (topCoinsEl) topCoinsEl.textContent = String(GAME.runCoins);
  if (topStreakEl) topStreakEl.textContent = String(GAME.streak);

  if (shotStatusEl) {
    if (!GAME.running) shotStatusEl.textContent = "—";
    else if (GAME.shotTimer <= 0) shotStatusEl.textContent = "Ready";
    else shotStatusEl.textContent = `${GAME.shotTimer.toFixed(1)}s`;
  }

  if (powerStatusEl) {
    if (GAME.power.type === "none") powerStatusEl.textContent = "None";
    else powerStatusEl.textContent = `${GAME.power.type} ${GAME.power.t.toFixed(1)}s`;
  }
}

function renderLeaderboard() {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = "";
  const list = LEADERBOARD.slice(0, 10);
  if (!list.length) {
    const li = document.createElement("li");
    li.textContent = "No scores yet.";
    leaderboardList.appendChild(li);
    return;
  }
  for (const e of list) {
    const li = document.createElement("li");
    const d = new Date(e.ts || Date.now());
    li.textContent = `${e.name || "Player"} — ${e.score} (${d.toLocaleDateString()})`;
    leaderboardList.appendChild(li);
  }
}

function renderAchievements() {
  if (!achList) return;
  achList.innerHTML = "";
  for (const a of ACH_DEFS) {
    const li = document.createElement("li");
    const got = !!ACH[a.id];
    li.textContent = `${got ? "✅" : "⬜"} ${a.name} — ${a.desc}`;
    achList.appendChild(li);
  }
}

function renderSkins() {
  if (!skinSelect) return;
  skinSelect.innerHTML = "";
  const allowed = PROGRESS.skinsUnlocked
    ? SKINS
    : SKINS.filter((s) => s.id === "neon" || s.id === "mono");

  for (const s of allowed) {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name + (PROGRESS.skinsUnlocked ? "" : (s.id === "neon" || s.id === "mono" ? "" : " (locked)"));
    skinSelect.appendChild(opt);
  }

  if (!allowed.some((s) => s.id === SETTINGS.skin)) SETTINGS.skin = allowed[0]?.id || "neon";
  skinSelect.value = SETTINGS.skin;
  saveSettings(SETTINGS);
}

function renderShop() {
  if (totalCoinsEl) totalCoinsEl.textContent = String(PROGRESS.totalCoins);

  const cd = clamp(GAME.baseShotCooldown - PROGRESS.shotUpLevel, 3, GAME.baseShotCooldown);
  const nextCost = 80 * (PROGRESS.shotUpLevel + 1);
  if (shotUpInfo) shotUpInfo.textContent = `Cooldown now: ${cd.toFixed(0)}s • Next cost: ${nextCost} coins`;

  if (skinsInfo) {
    skinsInfo.textContent = PROGRESS.skinsUnlocked ? "Skins unlocked ✅" : "Cost: 250 coins";
  }
}

function openSettings() {
  renderLeaderboard();
  renderAchievements();
  renderSkins();
  renderShop();

  volumeRange.value = String(SETTINGS.volume);
  volumeLabel.textContent = `Volume: ${(SETTINGS.volume * 100).toFixed(0)}%`;
  motionBlurToggle.checked = !!SETTINGS.motionBlur;
  alwaysRainToggle.checked = !!SETTINGS.alwaysRain;
  difficultySelect.value = SETTINGS.difficulty;

  settingsModal.hidden = false;
}

function closeSettingsModal() {
  settingsModal.hidden = true;
}

function qualifiesForTop10(score) {
  if (LEADERBOARD.length < 10) return true;
  return score > (LEADERBOARD[LEADERBOARD.length - 1]?.score || 0);
}

function showScoreSubmitIfNeeded() {
  if (!scoreSubmit) return;
  if (qualifiesForTop10(GAME.score)) {
    scoreSubmit.hidden = false;
    if (playerNameEl) playerNameEl.focus?.();
  } else {
    scoreSubmit.hidden = true;
  }
}

function saveScore() {
  const name = (playerNameEl?.value || "Player").trim().slice(0, 14) || "Player";
  LEADERBOARD.push({ name, score: GAME.score, ts: Date.now() });
  LEADERBOARD.sort((a, b) => b.score - a.score);
  LEADERBOARD = LEADERBOARD.slice(0, 10);
  saveLeaderboard(LEADERBOARD);
  renderLeaderboard();
  toast("Saved to Top 10 ✅");
  scoreSubmit.hidden = true;
}

// ---------- game state ----------
function applyDifficulty() {
  const d = DIFFICULTY[SETTINGS.difficulty] || DIFFICULTY.normal;
  GAME.speed = d.baseSpeed;
  GAME.nextSpawn = d.spawnBase;
  GAME.nextBoss = rand(d.bossMin, d.bossMax);
}

function resetState() {
  GAME.running = false;
  GAME.paused = false;
  GAME.gameOver = false;

  GAME.t = 0;
  GAME.score = 0;
  GAME.speedMult = 1;

  GAME.spawnTimer = 0;
  GAME.obstacles = [];
  GAME.particles = [];
  GAME.projectiles = [];

  GAME.pickups = [];
  GAME.pickupTimer = 0;
  GAME.nextPickup = 1.4;

  GAME.lastTs = 0;

  GAME.shotTimer = 0;

  GAME.power = { type: "none", t: 0 };

  GAME.streak = 0;
  GAME.bestStreak = 0;
  GAME.runCoins = 0;
  GAME.totalShotsHit = 0;
  GAME.duckUsedThisRun = false;
  GAME.bossKilledThisRun = false;

  GAME.bossTimer = 0;
  GAME.record = [];
  GAME.nextRecord = 0;

  PLAYER.y = WORLD.groundY;
  PLAYER.vy = 0;
  PLAYER.onGround = true;
  PLAYER.ducking = false;
  PLAYER.jumpsUsed = 0;

  applyDifficulty();
  setOverlay(false);
  draw();
  syncUI();
}

function startGame() {
  ensureAudio();
  if (GAME.gameOver) resetState();
  if (!GAME.running) {
    GAME.running = true;
    GAME.paused = false;
    scoreSubmit.hidden = true;
    setOverlay(false);
    requestAnimationFrame(loop);
  }
  syncUI();
}

function pauseToggle() {
  if (!GAME.running) return;
  GAME.paused = !GAME.paused;
  if (GAME.paused) {
    setOverlay(true, "Paused", "Press Pause again or Start to continue.");
  } else {
    setOverlay(false);
    requestAnimationFrame(loop);
  }
}

function endGame() {
  GAME.running = false;
  GAME.paused = false;
  GAME.gameOver = true;

  saveHighIfNeeded();

  // ghost: save if best
  if (!GHOST || GAME.score > (GHOST.score || 0)) {
    GHOST = { score: GAME.score, samples: GAME.record.slice(0, 1600) };
    saveGhost(GHOST);
    toast("👻 New ghost saved!");
  }

  // achievements
  if (GAME.score >= 1000) unlockAchievement("score1000");
  if (PROGRESS.totalCoins >= 50) unlockAchievement("coins50");
  if (GAME.totalShotsHit >= 10) unlockAchievement("shots10");
  if (GAME.bestStreak >= 20) unlockAchievement("streak20");
  if (GAME.bossKilledThisRun) unlockAchievement("bossDown");
  if (!GAME.duckUsedThisRun && GAME.score >= 800) unlockAchievement("noDuck");

  setOverlay(true, "Game Over", "Hit Start to run it back. (Settings has Leaderboard + Shop)");
  showScoreSubmitIfNeeded();
  syncUI();
}

function jump() {
  ensureAudio();
  if (GAME.gameOver) return;
  if (!GAME.running) startGame();

  const max = maxJumps();
  if (PLAYER.jumpsUsed >= max) return;

  PLAYER.vy = -PLAYER.jumpV;
  PLAYER.onGround = false;
  PLAYER.jumpsUsed += 1;
  PLAYER.ducking = false;

  sfx("jump");
  burst(PLAYER.x + PLAYER.w * 0.25, PLAYER.y + 24, 10);
}

function duck(down) {
  const d = Boolean(down);
  PLAYER.ducking = d;
  if (d) GAME.duckUsedThisRun = true;
}

function shoot() {
  ensureAudio();
  if (GAME.gameOver) return;
  if (!GAME.running) startGame();
  if (GAME.paused) return;
  if (GAME.shotTimer > 0) return;

  GAME.shotTimer = effectiveShotCooldown();
  sfx("shoot");

  const yBase = PLAYER.y - PLAYER.h + (PLAYER.ducking ? 14 : 6);
  GAME.projectiles.push({
    x: PLAYER.x + PLAYER.w + 8,
    y: yBase + 18,
    w: 16,
    h: 6,
    vx: 980,
  });

  burst(PLAYER.x + PLAYER.w + 10, yBase + 18, 8);
}

function burst(x, y, n) {
  for (let i = 0; i < n; i++) {
    GAME.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 260,
      vy: -Math.random() * 240,
      life: 0.35 + Math.random() * 0.35,
    });
  }
}

// ---------- spawning ----------
function spawnObstacle() {
  const r = Math.random();

  // Types:
  // car (image), low (small), drone (flying), billboard (overhead duck), boss (special timer)
  let kind = "car";
  if (r < 0.12) kind = "billboard";
  else if (r < 0.24) kind = "drone";
  else if (r < 0.34) kind = "low";

  if (kind === "car" || kind === "low") {
    const big = kind === "car" ? Math.random() < 0.45 : false;
    const h = kind === "low" ? rand(34, 44) : big ? rand(54, 76) : rand(42, 60);
    const w = Math.max(80, Math.min(160, h * obstacleAspect));
    const y = WORLD.groundY - h + 2;

    GAME.obstacles.push({
      kind,
      x: WORLD.w + 40,
      y,
      w,
      h,
      hp: 1,
      glow: rand(0.55, 0.9),
      passed: false,
    });
    return;
  }

  if (kind === "drone") {
    const w = rand(70, 96);
    const h = rand(34, 44);
    const y = rand(110, 175);
    GAME.obstacles.push({
      kind,
      x: WORLD.w + 40,
      y,
      w,
      h,
      hp: 1,
      glow: rand(0.55, 0.9),
      passed: false,
    });
    return;
  }

  if (kind === "billboard") {
    const w = rand(140, 190);
    const h = rand(24, 34);
    const y = WORLD.groundY - 88; // overhead, duck to shrink hitbox
    GAME.obstacles.push({
      kind,
      x: WORLD.w + 40,
      y,
      w,
      h,
      hp: 2,
      glow: rand(0.55, 0.9),
      passed: false,
    });
  }
}

function spawnBoss() {
  const h = rand(86, 110);
  const w = Math.max(220, Math.min(320, h * obstacleAspect));
  const y = WORLD.groundY - h + 2;

  GAME.obstacles.push({
    kind: "boss",
    x: WORLD.w + 60,
    y,
    w,
    h,
    hp: 3,
    glow: 1.0,
    passed: false,
  });

  sfx("boss");
  toast("💥 Boss car!");
}

function spawnPickup() {
  const r = Math.random();

  // coin most common
  if (r < 0.65) {
    GAME.pickups.push({
      kind: "coin",
      x: WORLD.w + 40,
      y: rand(200, 290),
      w: 22,
      h: 22,
      vy: rand(-12, 12),
      t: 0,
    });
    return;
  }

  // powerups
  const type = r < 0.78 ? "rapid" : r < 0.91 ? "shield" : "double";
  GAME.pickups.push({
    kind: "power",
    type,
    x: WORLD.w + 40,
    y: rand(160, 260),
    w: 30,
    h: 30,
    vy: rand(-10, 10),
    t: 0,
  });
}

// ---------- collisions / pickups ----------
function playerHitbox() {
  return {
    x: PLAYER.x + 10,
    y: PLAYER.y - PLAYER.h + (PLAYER.ducking ? 12 : 0),
    w: PLAYER.w - 20,
    h: PLAYER.h - (PLAYER.ducking ? 16 : 0),
  };
}

function obstacleHitbox(o) {
  if (o.kind === "car" || o.kind === "low" || o.kind === "boss") {
    return {
      x: o.x + 8,
      y: o.y + 8,
      w: Math.max(10, o.w - 16),
      h: Math.max(10, o.h - 12),
    };
  }
  if (o.kind === "drone") {
    return { x: o.x + 6, y: o.y + 6, w: o.w - 12, h: o.h - 12 };
  }
  if (o.kind === "billboard") {
    return { x: o.x + 6, y: o.y, w: o.w - 12, h: o.h };
  }
  return { x: o.x, y: o.y, w: o.w, h: o.h };
}

function pickupHitbox(p) {
  return { x: p.x, y: p.y, w: p.w, h: p.h };
}

function applyPower(type) {
  GAME.power.type = type;
  GAME.power.t = 6.5;
  sfx("power");

  if (type === "shield") sfx("shield");
  toast(type === "rapid" ? "⚡ Rapid fire!" : type === "shield" ? "🛡 Shield on!" : "⇈ Double jump!");
}

function collectCoin() {
  GAME.runCoins += 1;
  PROGRESS.totalCoins += 1;
  saveProgress(PROGRESS);
  sfx("coin");
  renderShop();
}

// ---------- update/draw ----------
function update(dt) {
  GAME.t += dt;

  // speed ramp
  GAME.speedMult = Math.min(2.45, 1 + GAME.t / 55);

  // shot cooldown
  if (GAME.shotTimer > 0) GAME.shotTimer = Math.max(0, GAME.shotTimer - dt);

  // power timer
  if (GAME.power.type !== "none") {
    GAME.power.t -= dt;
    if (GAME.power.t <= 0) GAME.power = { type: "none", t: 0 };
  }

  // boss timing
  GAME.bossTimer += dt;
  if (GAME.bossTimer >= GAME.nextBoss) {
    GAME.bossTimer = 0;
    const d = DIFFICULTY[SETTINGS.difficulty] || DIFFICULTY.normal;
    GAME.nextBoss = rand(d.bossMin, d.bossMax);
    spawnBoss();
  }

  // spawn obstacles
  GAME.spawnTimer += dt;
  if (GAME.spawnTimer >= GAME.nextSpawn) {
    GAME.spawnTimer = 0;
    spawnObstacle();

    const d = DIFFICULTY[SETTINGS.difficulty] || DIFFICULTY.normal;
    const base = d.spawnBase - Math.min(0.42, GAME.t / 140);
    const min = d.spawnMin;
    GAME.nextSpawn = rand(Math.max(min, base), Math.max(min + 0.35, base + 0.55));
  }

  // spawn pickups
  GAME.pickupTimer += dt;
  if (GAME.pickupTimer >= GAME.nextPickup) {
    GAME.pickupTimer = 0;
    spawnPickup();
    GAME.nextPickup = rand(1.1, 2.0);
  }

  // gravity
  PLAYER.vy += PLAYER.gravity * dt;
  PLAYER.y += PLAYER.vy * dt;

  const duckBonus = PLAYER.ducking ? 10 : 0;
  const ground = WORLD.groundY + duckBonus;

  if (PLAYER.y >= ground) {
    PLAYER.y = ground;
    PLAYER.vy = 0;
    PLAYER.onGround = true;
    PLAYER.jumpsUsed = 0;
  }

  // weather
  if (SETTINGS.alwaysRain) {
    GAME.rainOn = true;
  } else {
    const wave = Math.sin(GAME.t / 18);
    GAME.rainOn = wave > 0.55;
  }

  const vx = GAME.speed * GAME.speedMult;

  // move obstacles left
  for (const o of GAME.obstacles) o.x -= vx * dt;
  GAME.obstacles = GAME.obstacles.filter((o) => o.x + o.w > -120);

  // move projectiles right
  for (const p of GAME.projectiles) p.x += p.vx * dt;
  GAME.projectiles = GAME.projectiles.filter((p) => p.x < WORLD.w + 120);

  // move pickups
  for (const p of GAME.pickups) {
    p.t += dt;
    p.x -= vx * dt;
    p.y += Math.sin(p.t * 3.0) * (p.kind === "coin" ? 0.7 : 0.6);
  }
  GAME.pickups = GAME.pickups.filter((p) => p.x + p.w > -60);

  // particles
  for (const p of GAME.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 1200 * dt;
  }
  GAME.particles = GAME.particles.filter((p) => p.life > 0);

  // record ghost (every 0.1s)
  if (GAME.t >= GAME.nextRecord) {
    GAME.record.push({ t: GAME.t, y: PLAYER.y, d: PLAYER.ducking ? 1 : 0 });
    GAME.nextRecord = GAME.t + 0.1;
  }

  // projectile vs obstacle
  for (let i = GAME.projectiles.length - 1; i >= 0; i--) {
    const pr = GAME.projectiles[i];
    for (let j = GAME.obstacles.length - 1; j >= 0; j--) {
      const o = GAME.obstacles[j];
      if (rectsOverlap(pr, obstacleHitbox(o))) {
        GAME.projectiles.splice(i, 1);
        o.hp -= 1;
        burst(o.x + o.w * 0.5, o.y + o.h * 0.5, 12);
        if (o.hp <= 0) {
          GAME.obstacles.splice(j, 1);
          GAME.totalShotsHit += 1;
          if (o.kind === "boss") {
            GAME.bossKilledThisRun = true;
            GAME.score += 900;
            toast("💥 Boss destroyed!");
          } else {
            GAME.score += 200;
          }
        } else {
          GAME.score += 60;
        }
        break;
      }
    }
  }

  // pickups collect
  const ph = playerHitbox();
  for (let i = GAME.pickups.length - 1; i >= 0; i--) {
    const p = GAME.pickups[i];
    if (rectsOverlap(ph, pickupHitbox(p))) {
      GAME.pickups.splice(i, 1);
      if (p.kind === "coin") collectCoin();
      else if (p.kind === "power") applyPower(p.type);
    }
  }

  // score tick
  GAME.score += Math.floor(vx * dt * 0.05);

  // streak: count obstacles passed
  for (const o of GAME.obstacles) {
    if (!o.passed && o.x + o.w < PLAYER.x) {
      o.passed = true;
      GAME.streak += 1;
      GAME.bestStreak = Math.max(GAME.bestStreak, GAME.streak);

      const bonus = Math.floor(20 + GAME.streak * 4);
      GAME.score += bonus;

      if (GAME.streak % 5 === 0) toast(`🔥 Streak ${GAME.streak}! +${bonus}`);
    }
  }

  // collision
  for (const o of GAME.obstacles) {
    const oh = obstacleHitbox(o);
    if (rectsOverlap(ph, oh)) {
      if (GAME.power.type === "shield") {
        // consume shield
        GAME.power = { type: "none", t: 0 };
        sfx("shield");
        toast("🛡 Shield saved you!");
        burst(PLAYER.x + PLAYER.w * 0.5, PLAYER.y - 18, 18);
        // remove obstacle
        o.hp = 0;
        continue;
      }

      sfx("hit");
      burst(PLAYER.x + PLAYER.w * 0.5, PLAYER.y - 24, 18);
      return endGame();
    }
  }

  // streak resets if you get hit is already handled by endGame; also reset if you shoot? no.
  syncUI();
}

function skinColors() {
  const s = SKINS.find((x) => x.id === SETTINGS.skin) || SKINS[0];
  return { c1: s.c1, c2: s.c2 };
}

function drawSky() {
  const day = (Math.sin(GAME.t / 26) + 1) / 2; // 0..1
  const night = 1 - day;

  const g = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  g.addColorStop(0, `rgba(${Math.floor(2 + day * 24)},${Math.floor(6 + day * 34)},${Math.floor(17 + day * 70)},1)`);
  g.addColorStop(0.55, `rgba(${Math.floor(3 + day * 30)},${Math.floor(22 + day * 50)},${Math.floor(43 + day * 70)},1)`);
  g.addColorStop(1, `rgba(${Math.floor(1 + day * 18)},${Math.floor(10 + day * 20)},${Math.floor(20 + day * 40)},1)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

  // stars at night
  if (night > 0.35) {
    ctx.globalAlpha = clamp((night - 0.35) / 0.65, 0, 1) * 0.55;
    ctx.fillStyle = "rgba(255,255,255,1)";
    for (let i = 0; i < 42; i++) {
      const x = (i * 71 + (GAME.t * 15) % 71) % WORLD.w;
      const y = (i * 19) % 160;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  // streak lines
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "rgba(14,165,233,1)";
  for (let i = 0; i < 10; i++) {
    const x = (i * 120 + (GAME.t * 40) % 120) % WORLD.w;
    ctx.fillRect(WORLD.w - x, 60 + (i % 3) * 26, 60, 2);
  }
  ctx.globalAlpha = 1;
}

function drawGround() {
  const y = WORLD.groundY + 22;
  const g = ctx.createLinearGradient(0, y - 50, 0, y + 70);
  g.addColorStop(0, "rgba(20,184,166,0.10)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 80, WORLD.w, 140);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(WORLD.w, y);
  ctx.stroke();

  const dash = (GAME.t * 260) % 60;
  ctx.strokeStyle = "rgba(14,165,233,0.35)";
  ctx.lineWidth = 2;
  for (let x = -dash; x < WORLD.w; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + 26, y + 18);
    ctx.stroke();
  }
}

function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawTankKid(alpha = 1, ghost = false) {
  const baseY = PLAYER.y;
  const h = PLAYER.h;
  const w = PLAYER.w;
  const x = PLAYER.x;
  const y = baseY - h + (PLAYER.ducking ? 12 : 0);

  const { c1, c2 } = skinColors();
  const neon = ctx.createLinearGradient(x, y, x + w, y + h);
  neon.addColorStop(0, c1);
  neon.addColorStop(1, c2);

  ctx.globalAlpha = alpha;
  ctx.fillStyle = ghost ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

  const tankH = PLAYER.ducking ? 26 : 30;
  const tankY = baseY - tankH;

  ctx.fillStyle = ghost ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.10)";
  roundRect(x, tankY, w, tankH, 10);
  ctx.fill();

  ctx.strokeStyle = ghost ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  roundRect(x, tankY, w, tankH, 10);
  ctx.stroke();

  ctx.fillStyle = neon;
  roundRect(x + 8, tankY + 8, w - 16, tankH - 16, 8);
  ctx.fill();

  const wheelY = baseY - 6;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let i = 0; i < 4; i++) {
    const wx = x + 12 + i * 16;
    ctx.beginPath();
    ctx.arc(wx, wheelY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.stroke();
  }

  // barrel
  ctx.strokeStyle = ghost ? "rgba(255,255,255,0.10)" : "rgba(14,165,233,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 40, tankY + 10);
  ctx.lineTo(x + 70, tankY - (PLAYER.ducking ? 0 : 10));
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawObstacle(o) {
  if (o.kind === "car" || o.kind === "low" || o.kind === "boss") {
    // glow frame
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 14);
    ctx.fill();

    // image or fallback
    if (obstacleImg.complete && obstacleImg.naturalWidth > 0) {
      ctx.globalAlpha = 0.95;
      ctx.drawImage(obstacleImg, o.x, o.y, o.w, o.h);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = `rgba(14,165,233,${0.18 * o.glow})`;
      ctx.lineWidth = 2;
      roundRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2, 12);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(o.x, o.y, o.w, o.h, 14);
      ctx.fill();
    }

    // hp bar for boss
    if (o.kind === "boss") {
      const barW = o.w;
      const hpW = (barW * clamp(o.hp, 0, 3)) / 3;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      roundRect(o.x, o.y - 12, barW, 8, 4);
      ctx.fill();
      ctx.fillStyle = "rgba(244,63,94,0.9)";
      roundRect(o.x, o.y - 12, hpW, 8, 4);
      ctx.fill();
    }

    return;
  }

  if (o.kind === "drone") {
    const neon = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
    neon.addColorStop(0, `rgba(14,165,233,${0.8 * o.glow})`);
    neon.addColorStop(1, `rgba(20,184,166,${0.8 * o.glow})`);

    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 14);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(o.x, o.y, o.w, o.h, 14);
    ctx.fill();

    ctx.fillStyle = neon;
    roundRect(o.x + 8, o.y + 8, o.w - 16, o.h - 16, 10);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(o.x + 10, o.y + o.h - 8, o.w - 20, 2);
    return;
  }

  if (o.kind === "billboard") {
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(o.x, o.y, o.w, o.h, 12);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    roundRect(o.x, o.y, o.w, o.h, 12);
    ctx.stroke();

    ctx.fillStyle = "rgba(14,165,233,0.35)";
    ctx.font = "900 14px ui-sans-serif, system-ui";
    ctx.fillText("DUCK", o.x + 16, o.y + 22);
  }
}

function drawProjectiles() {
  for (const p of GAME.projectiles) {
    ctx.fillStyle = "rgba(14,165,233,0.95)";
    roundRect(p.x, p.y, p.w, p.h, 3);
    ctx.fill();

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "rgba(20,184,166,1)";
    roundRect(p.x - 8, p.y + 1, 8, p.h - 2, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawPickups() {
  for (const p of GAME.pickups) {
    if (p.kind === "coin") {
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = "rgba(250,204,21,0.9)";
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.20)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }

    // power-up
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(p.x - 2, p.y - 2, p.w + 4, p.h + 4, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(p.x, p.y, p.w, p.h, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "900 18px ui-sans-serif, system-ui";
    const icon = p.type === "rapid" ? "⚡" : p.type === "shield" ? "🛡" : "⇈";
    ctx.fillText(icon, p.x + 7, p.y + 22);
  }
}

function drawParticles() {
  for (const p of GAME.particles) {
    const a = clamp(p.life, 0, 1);
    ctx.globalAlpha = a * 0.8;
    ctx.fillStyle = "rgba(14,165,233,1)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawRain() {
  if (!GAME.rainOn) return;
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1;

  const t = GAME.t * 900;
  for (let i = 0; i < 70; i++) {
    const x = ((i * 47 + t) % (WORLD.w + 120)) - 60;
    const y = (i * 19 + (t * 0.6) % WORLD.h) % WORLD.h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 18);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawGhost() {
  if (!GHOST || !Array.isArray(GHOST.samples) || !GHOST.samples.length) return;
  if (!GAME.running) return;

  const s = GHOST.samples;

  // find samples around t
  const t = GAME.t;
  let i = 0;
  // quick forward scan (samples are small)
  while (i < s.length && s[i].t < t) i++;
  const a = s[Math.max(0, i - 1)];
  const b = s[Math.min(s.length - 1, i)];
  const span = Math.max(0.001, b.t - a.t);
  const k = clamp((t - a.t) / span, 0, 1);
  const y = a.y + (b.y - a.y) * k;
  const duck = (k < 0.5 ? a.d : b.d) === 1;

  // draw ghost tank at same x but y from ghost
  const oldY = PLAYER.y;
  const oldDuck = PLAYER.ducking;

  PLAYER.y = y;
  PLAYER.ducking = duck;
  drawTankKid(0.22, true);

  PLAYER.y = oldY;
  PLAYER.ducking = oldDuck;
}

function draw() {
  if (SETTINGS.motionBlur) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    ctx.globalAlpha = 1;
  } else {
    ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  }

  drawSky();
  drawRain();
  drawGround();

  drawGhost();

  for (const o of GAME.obstacles) drawObstacle(o);
  drawPickups();
  drawProjectiles();
  drawTankKid(1, false);
  drawParticles();

  if (!GAME.running && !GAME.gameOver) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "900 20px ui-sans-serif, system-ui";
    ctx.fillText("Press Start — Jump: ↑/tap — Shoot: Space", 28, 42);
  }
}

function loop(ts) {
  if (!GAME.running || GAME.paused) return;

  const t = ts / 1000;
  const last = GAME.lastTs || t;
  let dt = t - last;
  GAME.lastTs = t;

  dt = Math.min(dt, 0.03);

  update(dt);
  draw();

  if (GAME.running) requestAnimationFrame(loop);
}

// ---------- input ----------
function onKey(e) {
  const k = e.key.toLowerCase();

  if (k === " ") {
    e.preventDefault();
    shoot();
    return;
  }

  if (k === "arrowup" || k === "w") {
    e.preventDefault();
    jump();
  }

  if (k === "arrowdown" || k === "s") duck(true);
  if (k === "p") pauseToggle();
  if (k === "r") resetState();
}

function onKeyUp(e) {
  const k = e.key.toLowerCase();
  if (k === "arrowdown" || k === "s") duck(false);
}

function onTap() {
  jump();
}

// ---------- settings wiring ----------
function wireSettings() {
  settingsBtn?.addEventListener("click", openSettings);
  overlaySettings?.addEventListener("click", openSettings);
  closeSettings?.addEventListener("click", closeSettingsModal);

  settingsModal?.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettingsModal();
  });

  volumeRange?.addEventListener("input", () => {
    SETTINGS.volume = Number(volumeRange.value || "0");
    volumeLabel.textContent = `Volume: ${(SETTINGS.volume * 100).toFixed(0)}%`;
    saveSettings(SETTINGS);
  });

  motionBlurToggle?.addEventListener("change", () => {
    SETTINGS.motionBlur = !!motionBlurToggle.checked;
    saveSettings(SETTINGS);
  });

  alwaysRainToggle?.addEventListener("change", () => {
    SETTINGS.alwaysRain = !!alwaysRainToggle.checked;
    saveSettings(SETTINGS);
  });

  difficultySelect?.addEventListener("change", () => {
    SETTINGS.difficulty = difficultySelect.value || "normal";
    saveSettings(SETTINGS);
    applyDifficulty();
    toast(`Difficulty: ${SETTINGS.difficulty}`);
  });

  skinSelect?.addEventListener("change", () => {
    SETTINGS.skin = skinSelect.value || "neon";
    saveSettings(SETTINGS);
    toast(`Skin: ${SETTINGS.skin}`);
  });

  resetHighBtn?.addEventListener("click", () => {
    localStorage.setItem(STORAGE.high, "0");
    loadHigh();
    syncUI();
    toast("High score reset.");
  });

  clearDataBtn?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE.high);
    localStorage.removeItem(STORAGE.leaderboard);
    localStorage.removeItem(STORAGE.progress);
    localStorage.removeItem(STORAGE.settings);
    localStorage.removeItem(STORAGE.achievements);
    localStorage.removeItem(STORAGE.ghost);

    SETTINGS = loadSettings();
    PROGRESS = loadProgress();
    ACH = loadAchievements();
    LEADERBOARD = loadLeaderboard();
    GHOST = loadGhost();

    dataNote.textContent = "Cleared saved data ✅ (refresh if needed).";
    toast("Cleared saved data.");

    loadHigh();
    renderSkins();
    renderShop();
    renderLeaderboard();
    renderAchievements();
    applyDifficulty();
    resetState();
  });

  buyShotUpBtn?.addEventListener("click", () => {
    const cost = 80 * (PROGRESS.shotUpLevel + 1);
    if (PROGRESS.totalCoins < cost) return toast(`Need ${cost} coins.`);
    if (PROGRESS.shotUpLevel >= 7) return toast("Max upgrade reached.");

    PROGRESS.totalCoins -= cost;
    PROGRESS.shotUpLevel += 1;
    saveProgress(PROGRESS);
    renderShop();
    toast("Shot upgraded ✅");
  });

  unlockSkinsBtn?.addEventListener("click", () => {
    if (PROGRESS.skinsUnlocked) return toast("Skins already unlocked.");
    const cost = 250;
    if (PROGRESS.totalCoins < cost) return toast(`Need ${cost} coins.`);
    PROGRESS.totalCoins -= cost;
    PROGRESS.skinsUnlocked = true;
    saveProgress(PROGRESS);
    renderSkins();
    renderShop();
    toast("All skins unlocked ✅");
  });

  saveScoreBtn?.addEventListener("click", saveScore);
}

// ---------- startup ----------
startBtn?.addEventListener("click", startGame);
pauseBtn?.addEventListener("click", pauseToggle);
resetBtn?.addEventListener("click", resetState);
overlayStart?.addEventListener("click", startGame);

jumpBtn?.addEventListener("click", jump);
shootBtn?.addEventListener("click", shoot);

duckBtn?.addEventListener("mousedown", () => duck(true));
duckBtn?.addEventListener("mouseup", () => duck(false));
duckBtn?.addEventListener("mouseleave", () => duck(false));
duckBtn?.addEventListener("touchstart", (e) => {
  e.preventDefault();
  duck(true);
});
duckBtn?.addEventListener("touchend", () => duck(false));

window.addEventListener("keydown", onKey, { passive: false });
window.addEventListener("keyup", onKeyUp);
canvas.addEventListener("pointerdown", onTap);

function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(WORLD.w * dpr);
  canvas.height = Math.floor(WORLD.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function init() {
  loadHigh();
  renderLeaderboard();
  renderAchievements();
  renderSkins();
  renderShop();
  applyDifficulty();

  // settings UI initial values
  if (difficultySelect) difficultySelect.value = SETTINGS.difficulty;
  if (volumeRange) volumeRange.value = String(SETTINGS.volume);
  if (volumeLabel) volumeLabel.textContent = `Volume: ${(SETTINGS.volume * 100).toFixed(0)}%`;
  if (motionBlurToggle) motionBlurToggle.checked = !!SETTINGS.motionBlur;
  if (alwaysRainToggle) alwaysRainToggle.checked = !!SETTINGS.alwaysRain;

  wireSettings();
  fitCanvas();
  resetState();
  setOverlay(true, "Remy Tank Run", "Press Start. Jump: ↑ / tap. Shoot: Space. Open Settings for Shop + Top 10.");
}

init();
window.addEventListener("resize", fitCanvas);
