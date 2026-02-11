/* /games/remy-tank-run/remy.js */

const STORAGE_HIGH = "aidensarcade-remy-tank-high";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const speedEl = document.getElementById("speed");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySub = document.getElementById("overlaySub");
const overlayStart = document.getElementById("overlayStart");

const jumpBtn = document.getElementById("jumpBtn");
const duckBtn = document.getElementById("duckBtn");

const WORLD = {
  w: 960,
  h: 420,
  groundY: 330,
};

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
  nextSpawn: 1.0,
  obstacles: [],
  particles: [],
  lastTs: 0,
};

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

function resetState() {
  GAME.running = false;
  GAME.paused = false;
  GAME.gameOver = false;
  GAME.t = 0;
  GAME.score = 0;
  GAME.speed = 520;
  GAME.speedMult = 1;
  GAME.spawnTimer = 0;
  GAME.nextSpawn = 0.9;
  GAME.obstacles = [];
  GAME.particles = [];
  GAME.lastTs = 0;

  PLAYER.y = WORLD.groundY;
  PLAYER.vy = 0;
  PLAYER.onGround = true;
  PLAYER.ducking = false;

  scoreEl.textContent = "0";
  speedEl.textContent = "1.0";
  setOverlay(false);
  draw(0);
}

function startGame() {
  if (GAME.gameOver) resetState();
  if (!GAME.running) {
    GAME.running = true;
    GAME.paused = false;
    setOverlay(false);
    requestAnimationFrame(loop);
  }
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
  setOverlay(true, "Game Over", "Hit Start to run it back.");
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

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function spawnObstacle() {
  const tall = Math.random() < 0.45;
  const baseW = tall ? rand(78, 96) : rand(92, 128);
  const baseH = tall ? rand(78, 104) : rand(46, 58);

  const y = WORLD.groundY - baseH + 2;

  GAME.obstacles.push({
    x: WORLD.w + 40,
    y,
    w: baseW,
    h: baseH,
    kind: "cybertruck",
    glow: rand(0.55, 0.9),
  });
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function update(dt) {
  GAME.t += dt;

  GAME.speedMult = Math.min(2.35, 1 + GAME.t / 55);
  speedEl.textContent = GAME.speedMult.toFixed(1);

  GAME.spawnTimer += dt;
  if (GAME.spawnTimer >= GAME.nextSpawn) {
    GAME.spawnTimer = 0;
    spawnObstacle();
    const base = 1.05 - Math.min(0.45, GAME.t / 120);
    GAME.nextSpawn = rand(base, base + 0.55);
  }

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

  for (const o of GAME.obstacles) {
    o.x -= vx * dt;
  }

  GAME.obstacles = GAME.obstacles.filter((o) => o.x + o.w > -60);

  for (const p of GAME.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 1200 * dt;
  }
  GAME.particles = GAME.particles.filter((p) => p.life > 0);

  GAME.score += Math.floor(vx * dt * 0.05);
  scoreEl.textContent = String(GAME.score);

  const playerHitbox = {
    x: PLAYER.x + 10,
    y: PLAYER.y - PLAYER.h + (PLAYER.ducking ? 12 : 0),
    w: PLAYER.w - 20,
    h: PLAYER.h - (PLAYER.ducking ? 16 : 0),
  };

  for (const o of GAME.obstacles) {
    if (rectsOverlap(playerHitbox, o)) {
      burst(PLAYER.x + PLAYER.w * 0.5, PLAYER.y - 24, 18);
      return gameOver();
    }
  }
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

function drawCyberTruck(o) {
  const neon = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
  neon.addColorStop(0, `rgba(14,165,233,${0.85 * o.glow})`);
  neon.addColorStop(1, `rgba(20,184,166,${0.75 * o.glow})`);

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 14);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(o.x, o.y, o.w, o.h, 14);
  ctx.fill();

  ctx.fillStyle = neon;
  const cabH = Math.max(18, o.h * 0.38);
  roundRect(o.x + 8, o.y + 8, o.w - 16, cabH, 12);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(o.x + 10, o.y + cabH + 18);
  ctx.lineTo(o.x + o.w - 10, o.y + cabH + 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  const wy = o.y + o.h - 6;
  for (let i = 0; i < 2; i++) {
    const wx = o.x + 18 + i * (o.w - 36);
    ctx.beginPath();
    ctx.arc(wx, wy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.stroke();
  }
}

function drawParticles() {
  for (const p of GAME.particles) {
    const a = Math.max(0, Math.min(1, p.life));
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

  for (const o of GAME.obstacles) drawCyberTruck(o);
  drawTankKid();
  drawParticles();

  if (!GAME.running && !GAME.gameOver) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "900 20px ui-sans-serif, system-ui";
    ctx.fillText("Press Start / Space to begin", 28, 42);
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

function onKey(e) {
  const k = e.key.toLowerCase();
  if (k === " " || k === "arrowup" || k === "w") {
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

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(WORLD.w * dpr);
  canvas.height = Math.floor(WORLD.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

loadHigh();
fitCanvas();
resetState();
setOverlay(true, "Remy Tank Run", "Press Start or Space to begin.");

window.addEventListener("resize", fitCanvas);/* /games/remy-tank-run/remy.js */

const STORAGE_HIGH = "aidensarcade-remy-tank-high";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const speedEl = document.getElementById("speed");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlaySub = document.getElementById("overlaySub");
const overlayStart = document.getElementById("overlayStart");

const jumpBtn = document.getElementById("jumpBtn");
const duckBtn = document.getElementById("duckBtn");

const WORLD = {
  w: 960,
  h: 420,
  groundY: 330,
};

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
  nextSpawn: 1.0,
  obstacles: [],
  particles: [],
  lastTs: 0,
};

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

function resetState() {
  GAME.running = false;
  GAME.paused = false;
  GAME.gameOver = false;
  GAME.t = 0;
  GAME.score = 0;
  GAME.speed = 520;
  GAME.speedMult = 1;
  GAME.spawnTimer = 0;
  GAME.nextSpawn = 0.9;
  GAME.obstacles = [];
  GAME.particles = [];
  GAME.lastTs = 0;

  PLAYER.y = WORLD.groundY;
  PLAYER.vy = 0;
  PLAYER.onGround = true;
  PLAYER.ducking = false;

  scoreEl.textContent = "0";
  speedEl.textContent = "1.0";
  setOverlay(false);
  draw(0);
}

function startGame() {
  if (GAME.gameOver) resetState();
  if (!GAME.running) {
    GAME.running = true;
    GAME.paused = false;
    setOverlay(false);
    requestAnimationFrame(loop);
  }
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
  setOverlay(true, "Game Over", "Hit Start to run it back.");
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

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function spawnObstacle() {
  const tall = Math.random() < 0.45;
  const baseW = tall ? rand(78, 96) : rand(92, 128);
  const baseH = tall ? rand(78, 104) : rand(46, 58);

  const y = WORLD.groundY - baseH + 2;

  GAME.obstacles.push({
    x: WORLD.w + 40,
    y,
    w: baseW,
    h: baseH,
    kind: "cybertruck",
    glow: rand(0.55, 0.9),
  });
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function update(dt) {
  GAME.t += dt;

  GAME.speedMult = Math.min(2.35, 1 + GAME.t / 55);
  speedEl.textContent = GAME.speedMult.toFixed(1);

  GAME.spawnTimer += dt;
  if (GAME.spawnTimer >= GAME.nextSpawn) {
    GAME.spawnTimer = 0;
    spawnObstacle();
    const base = 1.05 - Math.min(0.45, GAME.t / 120);
    GAME.nextSpawn = rand(base, base + 0.55);
  }

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

  for (const o of GAME.obstacles) {
    o.x -= vx * dt;
  }

  GAME.obstacles = GAME.obstacles.filter((o) => o.x + o.w > -60);

  for (const p of GAME.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 1200 * dt;
  }
  GAME.particles = GAME.particles.filter((p) => p.life > 0);

  GAME.score += Math.floor(vx * dt * 0.05);
  scoreEl.textContent = String(GAME.score);

  const playerHitbox = {
    x: PLAYER.x + 10,
    y: PLAYER.y - PLAYER.h + (PLAYER.ducking ? 12 : 0),
    w: PLAYER.w - 20,
    h: PLAYER.h - (PLAYER.ducking ? 16 : 0),
  };

  for (const o of GAME.obstacles) {
    if (rectsOverlap(playerHitbox, o)) {
      burst(PLAYER.x + PLAYER.w * 0.5, PLAYER.y - 24, 18);
      return gameOver();
    }
  }
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

function drawCyberTruck(o) {
  const neon = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
  neon.addColorStop(0, `rgba(14,165,233,${0.85 * o.glow})`);
  neon.addColorStop(1, `rgba(20,184,166,${0.75 * o.glow})`);

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  roundRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4, 14);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(o.x, o.y, o.w, o.h, 14);
  ctx.fill();

  ctx.fillStyle = neon;
  const cabH = Math.max(18, o.h * 0.38);
  roundRect(o.x + 8, o.y + 8, o.w - 16, cabH, 12);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(o.x + 10, o.y + cabH + 18);
  ctx.lineTo(o.x + o.w - 10, o.y + cabH + 18);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  const wy = o.y + o.h - 6;
  for (let i = 0; i < 2; i++) {
    const wx = o.x + 18 + i * (o.w - 36);
    ctx.beginPath();
    ctx.arc(wx, wy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.stroke();
  }
}

function drawParticles() {
  for (const p of GAME.particles) {
    const a = Math.max(0, Math.min(1, p.life));
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

  for (const o of GAME.obstacles) drawCyberTruck(o);
  drawTankKid();
  drawParticles();

  if (!GAME.running && !GAME.gameOver) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "900 20px ui-sans-serif, system-ui";
    ctx.fillText("Press Start / Space to begin", 28, 42);
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

function onKey(e) {
  const k = e.key.toLowerCase();
  if (k === " " || k === "arrowup" || k === "w") {
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

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(WORLD.w * dpr);
  canvas.height = Math.floor(WORLD.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

loadHigh();
fitCanvas();
resetState();
setOverlay(true, "Remy Tank Run", "Press Start or Space to begin.");

window.addEventListener("resize", fitCanvas);
