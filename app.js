/**
 * Why: premium touches (mode/theme save, mobile menu, scroll highlight, YouTube loader).
 */
const STORAGE_MODE = "arcadehub-mode";
const STORAGE_THEME = "arcadehub-theme";

const modeBtn = document.getElementById("modeBtn");
const modeIcon = document.getElementById("modeIcon");
const modeLabel = document.getElementById("modeLabel");

const themeSelect = document.getElementById("themeSelect");

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

const navLinks = Array.from(document.querySelectorAll(".link"));
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const yearEl = document.getElementById("year");

const ytInput = document.getElementById("ytInput");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const ytFrame = document.getElementById("ytFrame");

const DEFAULT_VIDEO = "aqz-KE-bpKQ";

function setMode(mode) {
  document.documentElement.setAttribute("data-mode", mode);
  localStorage.setItem(STORAGE_MODE, mode);

  const isDark = mode === "dark";
  modeIcon.textContent = isDark ? "☾" : "☀";
  if (modeLabel) modeLabel.textContent = isDark ? "Dark" : "Moonlit";
}

function initMode() {
  const saved = localStorage.getItem(STORAGE_MODE);
  if (saved === "dark" || saved === "light") return setMode(saved);

  // Why: always start in dark water (no device auto-switch)
  setMode("dark");
}

function toggleMode() {
  const current = document.documentElement.getAttribute("data-mode") || "dark";
  setMode(current === "dark" ? "light" : "dark");
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_THEME, theme);
  if (themeSelect) themeSelect.value = theme;
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME);
  if (saved) setTheme(saved);
  else setTheme(document.documentElement.getAttribute("data-theme") || "greatwave");
}

function initYear() {
  yearEl.textContent = String(new Date().getFullYear());
}

function initMobileMenu() {
  function close() {
    mobileMenu.hidden = true;
    burgerBtn.setAttribute("aria-expanded", "false");
  }

  function open() {
    mobileMenu.hidden = false;
    burgerBtn.setAttribute("aria-expanded", "true");
  }

  burgerBtn.addEventListener("click", () => {
    const expanded = burgerBtn.getAttribute("aria-expanded") === "true";
    expanded ? close() : open();
  });

  mobileMenu.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLAnchorElement) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 860) close();
  });
}

function setActive(id) {
  for (const a of navLinks) {
    const href = a.getAttribute("href") || "";
    a.setAttribute("aria-current", href === `#${id}` ? "true" : "false");
  }
}

function initScrollSpy() {
  if (!("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver(
    (entries) => {
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((x, y) => y.intersectionRatio - x.intersectionRatio)[0];
      if (best) setActive(best.target.id);
    },
    { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -60% 0px" }
  );

  for (const s of sections) obs.observe(s);
}

function parseYouTubeId(input) {
  const raw = (input || "").trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    const parts = url.pathname.split("/").filter(Boolean);

    const idxShorts = parts.indexOf("shorts");
    if (idxShorts !== -1 && parts[idxShorts + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[idxShorts + 1])) {
      return parts[idxShorts + 1];
    }

    const idxEmbed = parts.indexOf("embed");
    if (idxEmbed !== -1 && parts[idxEmbed + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[idxEmbed + 1])) {
      return parts[idxEmbed + 1];
    }
  } catch {
    // not a URL
  }

  return null;
}

function loadYouTube(id) {
  const safe = id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : DEFAULT_VIDEO;
  ytFrame.src = `https://www.youtube-nocookie.com/embed/${safe}`;
}

modeBtn.addEventListener("click", toggleMode);

themeSelect.addEventListener("change", (e) => {
  setTheme(e.target.value);
});

loadBtn.addEventListener("click", () => {
  const id = parseYouTubeId(ytInput.value);
  if (!id) {
    ytInput.value = "";
    ytInput.placeholder = "Invalid link/ID. Try again (YouTube link or 11-char ID).";
    return;
  }
  loadYouTube(id);
});

resetBtn.addEventListener("click", () => {
  ytInput.value = "";
  ytInput.placeholder = "Paste YouTube link or video ID...";
  loadYouTube(DEFAULT_VIDEO);
});

initMode();
initTheme();
initYear();
initMobileMenu();
initScrollSpy();

