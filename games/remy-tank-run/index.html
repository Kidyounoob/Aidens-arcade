/* /games/remy-tank-run/remy.js */

const STORAGE_HIGH = "aidensarcade-remy-tank-high";
const STORAGE_LOCAL_LB = "aidensarcade-remy-tank-local-leaderboard-v1";

const OBSTACLE_CAR_IMG =
  "https://image2url.com/r2/default/images/1770830164179-3e663839-842b-4e92-9a7b-1cacc46b26c3.png";

const TESLA_PLANE_IMG =
  "https://image2url.com/r2/default/images/1770836095512-89ec5bd3-5c8e-4a45-8d3e-d1f9a99d01c7.png";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const speedEl = document.getElementById("speed");
const powerHudEl = document.getElementById("powerHud");

const topScoreEl = document.getElementById("topScore");
const topHighEl = document.getElementById("topHigh");
const topSpeedEl = document.getElementById("topSpeed");
const shotStatusEl = document.getElementById("shotStatus");
const powerTopEl = document.getElementById("powerTop");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySub = document.getElementById("overlaySub");
const overlayStart = document.getElementById("overlayStart");

const jumpBtn = document.getElementById("jumpBtn");
const duckBtn = document.getElementById("duckBtn");

// leaderboard UI
const lbStatusEl = document.getElementById("lbStatus");
const lbListEl = document.getElementById("lbList");
const lbNameEl = document.getElementById("lbName");
const lbSubmitBtn = document.getElementById("lbSubmit");
const lbHintEl = document.getElementById("lbHint");

// ---------- images ----------
const carImg = new Image();
carImg.crossOrigin = "anonymous";
carImg.src = OBSTACLE_CAR_IMG;
let carAspect = 2.0;
carImg.onload = () => {
  if (carImg.naturalWidth && carImg.naturalHeight) carAspect = carImg.naturalWidth / carImg.naturalHeight;
};

const planeImg = new Image();
planeImg.crossOrigin = "anonymous";
planeImg.src = TESLA_PLANE_IMG;
let planeAspect = 2.6;
planeImg.onload = () => {
  if (planeImg.naturalWidth && planeImg.naturalHeight) planeAspect = planeImg.naturalWidth / planeImg.naturalHeight;
};

// ---------- world ----------
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
  nextSpawn: 0.95,

  obstacles: [],
  particles: [],
  projectiles: [],

  // powerups
  pickups: [],
  pickupTimer: 0,
  nextPickup: 1.6,
  power: { type: "none", t: 0 }, // "rapid" | "shield" | "none"

  // shooting
  baseShotCooldown: 10.0,
  shotTimer: 0,

  lastTs: 0,

  // leaderboard submit
  lastRunScore: 0,
  canSubmit: false,
};

// ---------- util ----------
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function setOverlay(show, title = "", sub = "") {
  overlay.hidden = !show;
  if (title) overlayTitle.textContent = title;
  if (sub) overlaySub.textContent = sub;
}

function loadHigh() {
  const v = Number(localStorage.getItem(STORAGE_HIGH) || "0");
  highEl.textContent = String(Number.isFinite(v) ? v : 0);
}

function saveHighIfNeeded() {
  const high = Number(highEl.textContent || "0");
  if (GAME.score > high) {
    localStorage.setItem(STORAGE_HIGH, String(GAME.score));
    highEl.textContent = String(GAME.score);
  }
}

function powerLabel() {
  if (GAME.power.type === "rapid") return `⚡ ${GAME.power.t.toFixed(1)}s`;
  if (GAME.power.type === "shield") return `🛡`;
  return "None";
}

function effectiveShotCooldown() {
  return GAME.power.type === "rapid" ? 0.25 : GAME.baseShotCooldown;
}

function syncUI() {
  scoreEl.textContent = String(GAME.score);
  speedEl.textContent = GAME.speedMult.toFixed(1);

  if (topScoreEl) topScoreEl.textContent = String(GAME.score);
  if (topHighEl) topHighEl.textContent = highEl.textContent || "0";
  if (topSpeedEl) topSpeedEl.textContent = GAME.speedMult.toFixed(1);

  if (shotStatusEl) {
    if (!GAME.running) shotStatusEl.textContent = "—";
    else if (GAME.shotTimer <= 0) shotStatusEl.textContent = "Ready";
    else shotStatusEl.textContent = `${GAME.shotTimer.toFixed(1)}s`;
  }

  const p = powerLabel();
  if (powerHudEl) powerHudEl.textContent = p;
  if (powerTopEl) powerTopEl.textContent = p;
}

function resetState() {
  GAME.running = false;
  GAME.paused = false;
  GAME.gameOver = false;

  GAME.t = 0;
  GAME.score = 0;

  GAME.speed = 520;
  GAME.speedMult = 1;

  GAME.spawnTimer = 0;
  GAME.nextSpawn = 0.95;
  GAME.obstacles = [];
  GAME.particles = [];
  GAME.projectiles = [];

  GAME.pickups = [];
  GAME.pickupTimer = 0;
  GAME.nextPickup = 1.6;
  GAME.power = { type: "none", t: 0 };

  GAME.baseShotCooldown = 10.0;
  GAME.shotTimer = 0;

  GAME.lastTs = 0;

  PLAYER.y = WORLD.groundY;
  PLAYER.vy = 0;
  PLAYER.onGround = true;
  PLAYER.ducking = false;

  GAME.lastRunScore = 0;
  GAME.canSubmit = false;
  setSubmitEnabled(false);

  setOverlay(false);
  draw();
  syncUI();
}

// ---------- particles ----------
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

// ---------- gameplay ----------
function startGame() {
  if (GAME.gameOver) resetState();
  if (!GAME.running) {
    GAME.running = true;
    GAME.paused = false;
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

function gameOver() {
  GAME.running = false;
  GAME.paused = false;
  GAME.gameOver = true;

  saveHighIfNeeded();

  GAME.lastRunScore = GAME.score;
  GAME.canSubmit = GAME.score > 0;
  setSubmitEnabled(GAME.canSubmit);

  setOverlay(true, "Game Over", "Submit your score on the left leaderboard.");
  syncUI();
}

function jump() {
  if (GAME.gameOver) return;
  if (!GAME.running) startGame();
  if (!PLAYER.onGround) return;

  PLAYER.vy = -PLAYER.jumpV;
  PLAYER.onGround = false;
  PLAYER.ducking = false;

  burst(PLAYER.x + PLAYER.w * 0.25, PLAYER.y + 24, 10);
}

function duck(down) {
  PLAYER.ducking = Boolean(down);
}

function shoot() {
  if (GAME.gameOver) return;
  if (!GAME.running) startGame();
  if (GAME.paused) return;
  if (GAME.shotTimer > 0) return;

  GAME.shotTimer = effectiveShotCooldown();

  const yBase = PLAYER.y - PLAYER.h + (PLAYER.ducking ? 14 : 6);
  GAME.projectiles.push({
    x: PLAYER.x + PLAYER.w + 8,
    y: yBase + 18,
    w: 16,
    h: 6,
    vx: 980,
  });

  burst(PLAYER.x + PLAYER.w + 10, yBase + 18, 6);
}

// ---------- spawn ----------
function spawnCar() {
  const tall = Math.random() < 0.45;
  const h = tall ? rand(54, 72) : rand(44, 58);
  const w = Math.max(90, Math.min(170, h * carAspect));
  const y = WORLD.groundY - h + 2;

  GAME.obstacles.push({
    kind: "car",
    x: WORLD.w + 40,
    y,
    w,
    h,
    hp: 1,
  });
}

function spawnPlane() {
  const h = rand(50, 68);
  const w = Math.max(120, Math.min(220, h * planeAspect));
  const y = rand(110, 190);

  GAME.obstacles.push({
    kind: "plane",
    x: WORLD.w + 60,
    y,
    w,
    h,
    hp: 1,
  });
}

function spawnObstacle() {
  // ~22% planes, rest cars
  if (Math.random() < 0.22) spawnPlane();
  else spawnCar();
}

function spawnPickup() {
  // more rapid than shield
  const type = Math.random() < 0.65 ? "rapid" : "shield";
  const y = rand(150, 260);

  GAME.pickups.push({
    kind: "power",
    type,
    x: WORLD.w + 40,
    y,
    w: 34,
    h: 34,
    t: 0,
  });
}

function applyPower(type) {
  if (type === "rapid") {
    GAME.power.type = "rapid";
    GAME.power.t = 6.0;
    GAME.shotTimer = 0;
    return;
  }
  if (type === "shield") {
    GAME.power.type = "shield";
    GAME.power.t = 9999; // stays until hit
  }
}

// ---------- collision shapes ----------
function playerHitbox() {
  return {
    x: PLAYER.x + 10,
    y: PLAYER.y - PLAYER.h + (PLAYER.ducking ? 12 : 0),
    w: PLAYER.w - 20,
    h: PLAYER.h - (PLAYER.ducking ? 16 : 0),
  };
}

function obstacleHitbox(o) {
  if (o.kind === "car") {
    return { x: o.x + 10, y: o.y + 8, w: o.w - 20, h: o.h - 10 };
  }
  // plane: smaller hitbox inside image
  return { x: o.x + 14, y: o.y + 10, w: o.w - 28, h: o.h - 20 };
}

// ---------- update ----------
function update(dt) {
  GAME.t += dt;

  GAME.speedMult = Math.min(2.35, 1 + GAME.t / 55);

  if (GAME.shotTimer > 0) GAME.shotTimer = Math.max(0, GAME.shotTimer - dt);

  if (GAME.power.type === "rapid") {
    GAME.power.t -= dt;
    if (GAME.power.t <= 0) GAME.power = { type: "none", t: 0 };
  }

  // spawn obstacles
  GAME.spawnTimer += dt;
  if (GAME.spawnTimer >= GAME.nextSpawn) {
    GAME.spawnTimer = 0;
    spawnObstacle();

    const base = 1.05 - Math.min(0.45, GAME.t / 120);
    GAME.nextSpawn = rand(base, base + 0.55);
  }

  // spawn powerups (not too often)
  GAME.pickupTimer += dt;
  if (GAME.pickupTimer >= GAME.nextPickup) {
    GAME.pickupTimer = 0;
    spawnPickup();
    GAME.nextPickup = rand(1.8, 3.2);
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
  }

  const vx = GAME.speed * GAME.speedMult;

  for (const o of GAME.obstacles) o.x -= vx * dt;
  GAME.obstacles = GAME.obstacles.filter((o) => o.x + o.w > -90);

  for (const pr of GAME.projectiles) pr.x += pr.vx * dt;
  GAME.projectiles = GAME.projectiles.filter((p) => p.x < WORLD.w + 120);

  for (const p of GAME.pickups) {
    p.t += dt;
    p.x -= vx * dt;
    p.y += Math.sin(p.t * 3.2) * 0.6;
  }
  GAME.pickups = GAME.pickups.filter((p) => p.x + p.w > -80);

  for (const p of GAME.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 1200 * dt;
  }
  GAME.particles = GAME.particles.filter((p) => p.life > 0);

  // score
  GAME.score += Math.floor(vx * dt * 0.05);

  // projectile vs obstacle (shootable cars + planes)
  for (let i = GAME.projectiles.length - 1; i >= 0; i--) {
    const pr = GAME.projectiles[i];
    for (let j = GAME.obstacles.length - 1; j >= 0; j--) {
      const o = GAME.obstacles[j];
      if (rectsOverlap(pr, obstacleHitbox(o))) {
        GAME.projectiles.splice(i, 1);
        GAME.obstacles.splice(j, 1);
        GAME.score += o.kind === "plane" ? 350 : 200;
        burst(o.x + o.w * 0.5, o.y + o.h * 0.5, 14);
        break;
      }
    }
  }

  // pickup collect
  const ph = playerHitbox();
  for (let i = GAME.pickups.length - 1; i >= 0; i--) {
    const p = GAME.pickups[i];
    if (rectsOverlap(ph, p)) {
      GAME.pickups.splice(i, 1);
      applyPower(p.type);
      burst(p.x + p.w * 0.5, p.y + p.h * 0.5, 10);
    }
  }

  // player collision with obstacles
  for (let j = GAME.obstacles.length - 1; j >= 0; j--) {
    const o = GAME.obstacles[j];
    if (rectsOverlap(ph, obstacleHitbox(o))) {
      if (GAME.power.type === "shield") {
        GAME.power = { type: "none", t: 0 };
        GAME.obstacles.splice(j, 1);
        burst(PLAYER.x + PLAYER.w * 0.5, PLAYER.y - 24, 18);
        GAME.score += 120;
        break;
      }
      burst(PLAYER.x + PLAYER.w * 0.5, PLAYER.y - 24, 18);
      return gameOver();
    }
  }

  syncUI();
}

// ---------- drawing ----------
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

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, WORLD.h);
  g.addColorStop(0, "rgba(2,6,17,1)");
  g.addColorStop(0.55, "rgba(3,22,43,1)");
  g.addColorStop(1, "rgba(1,10,20,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WORLD.w, WORLD.h);

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

function drawTankKid() {
  const baseY = PLAYER.y;
  const h = PLAYER.h;
  const w = PLAYER.w;
  const x = PLAYER.x;
  const y = baseY - h + (PLAYER.ducking ? 12 : 0);

  const neon = ctx.createLinearGradient(x, y, x + w, y + h);
  neon.addColorStop(0, "rgba(14,165,233,0.95)");
  neon.addColorStop(1, "rgba(20,184,166,0.9)");

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

  const tankH = PLAYER.ducking ? 26 : 30;
  const tankY = baseY - tankH;

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(x, tankY, w, tankH, 10);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
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

  if (!PLAYER.ducking) {
    const kidX = x + 22;
    const kidY = tankY - 22;

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    roundRect(kidX - 6, kidY - 6, 34, 26, 10);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.arc(kidX + 10, kidY + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.arc(kidX + 6, kidY + 8, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(kidX + 13, kidY + 8, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(kidX + 10, kidY + 12, 5, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(14,165,233,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 40, tankY + 10);
  ctx.lineTo(x + 70, tankY - (PLAYER.ducking ? 0 : 10));
  ctx.stroke();
}

function drawCar(o) {
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 14);
  ctx.fill();

  if (carImg.complete && carImg.naturalWidth > 0) {
    ctx.globalAlpha = 0.95;
    ctx.drawImage(carImg, o.x, o.y, o.w, o.h);
    ctx.globalAlpha = 1;
    return;
  }

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(o.x, o.y, o.w, o.h, 14);
  ctx.fill();
}

function drawPlane(o) {
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 16);
  ctx.fill();

  if (planeImg.complete && planeImg.naturalWidth > 0) {
    ctx.globalAlpha = 0.96;
    ctx.drawImage(planeImg, o.x, o.y, o.w, o.h);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "rgba(14,165,233,0.18)";
    ctx.lineWidth = 2;
    roundRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2, 14);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(o.x, o.y, o.w, o.h, 16);
  ctx.fill();
}

function drawPickups() {
  for (const p of GAME.pickups) {
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(p.x - 2, p.y - 2, p.w + 4, p.h + 4, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(p.x, p.y, p.w, p.h, 12);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "900 18px ui-sans-serif, system-ui";
    ctx.fillText(p.type === "rapid" ? "⚡" : "🛡", p.x + 8, p.y + 23);
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

function draw() {
  ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  drawSky();
  drawGround();

  for (const o of GAME.obstacles) {
    if (o.kind === "plane") drawPlane(o);
    else drawCar(o);
  }

  drawPickups();
  drawProjectiles();
  drawTankKid();
  drawParticles();

  if (!GAME.running && !GAME.gameOver) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "900 20px ui-sans-serif, system-ui";
    ctx.fillText("Start — Jump: ↑ / tap — Shoot: Space", 28, 42);
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

  // Space = shoot
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

// ---------- canvas scaling ----------
function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(WORLD.w * dpr);
  canvas.height = Math.floor(WORLD.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ---------- leaderboard (local + optional Firebase realtime) ----------
let lbMode = "local"; // "local" | "firebase"
let db = null;

function setSubmitEnabled(on) {
  if (!lbSubmitBtn) return;
  lbSubmitBtn.disabled = !on;
  if (lbHintEl) lbHintEl.textContent = on ? `Submitting: ${GAME.lastRunScore}` : "Finish a run to submit.";
}

function readLocalLB() {
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_LB);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeLocalLB(list) {
  localStorage.setItem(STORAGE_LOCAL_LB, JSON.stringify(list.slice(0, 20)));
}

function renderLB(list) {
  if (!lbListEl) return;
  lbListEl.innerHTML = "";
  const top = (list || []).slice(0, 10);

  if (!top.length) {
    const li = document.createElement("li");
    li.textContent = "No scores yet.";
    lbListEl.appendChild(li);
    return;
  }

  for (const e of top) {
    const li = document.createElement("li");
    const name = (e.name || "Player").slice(0, 14);
    li.textContent = `${name} — ${Number(e.score || 0)}`;
    lbListEl.appendChild(li);
  }
}

function addLocalScore(name, score) {
  const list = readLocalLB();
  list.push({ name, score, ts: Date.now() });
  list.sort((a, b) => (b.score || 0) - (a.score || 0));
  writeLocalLB(list);
  renderLB(list);
}

function initLocalLB() {
  lbMode = "local";
  if (lbStatusEl) lbStatusEl.textContent = "Local";
  renderLB(readLocalLB());
}

function tryInitFirebaseLB() {
  const cfg = window.REMY_FIREBASE_CONFIG;
  if (!cfg || !window.firebase || !firebase?.initializeApp) return false;

  try {
    firebase.initializeApp(cfg);
    db = firebase.firestore();
    lbMode = "firebase";
    if (lbStatusEl) lbStatusEl.textContent = "Online";

    db.collection("remy_tank_run_scores")
      .orderBy("score", "desc")
      .limit(10)
      .onSnapshot(
        (snap) => {
          const list = [];
          snap.forEach((doc) => list.push(doc.data()));
          renderLB(list);
        },
        () => {
          initLocalLB();
        }
      );

    return true;
  } catch {
    return false;
  }
}

async function submitScore() {
  if (!GAME.canSubmit) return;

  const name = (lbNameEl?.value || "Player").trim().slice(0, 14) || "Player";
  const score = Number(GAME.lastRunScore || 0);

  // Always keep local too (nice fallback)
  addLocalScore(name, score);

  if (lbMode !== "firebase" || !db) {
    GAME.canSubmit = false;
    setSubmitEnabled(false);
    return;
  }

  try {
    await db.collection("remy_tank_run_scores").add({
      name,
      score,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    GAME.canSubmit = false;
    setSubmitEnabled(false);
  } catch {
    // still ok because local already saved
    GAME.canSubmit = false;
    setSubmitEnabled(false);
  }
}

// ---------- wiring ----------
startBtn?.addEventListener("click", startGame);
pauseBtn?.addEventListener("click", pauseToggle);
resetBtn?.addEventListener("click", resetState);

overlayStart?.addEventListener("click", startGame);

jumpBtn?.addEventListener("click", jump);
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

lbSubmitBtn?.addEventListener("click", submitScore);

// ---------- boot ----------
loadHigh();
fitCanvas();
resetState();
setOverlay(true, "Remy Tank Run", "Press Start. Shoot planes with Space. Grab ⚡ / 🛡.");

window.addEventListener("resize", fitCanvas);

// Leaderboard init (try firebase, else local)
const firebaseOk = tryInitFirebaseLB();
if (!firebaseOk) initLocalLB();
