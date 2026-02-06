/* /app.js */
/**
 * Why: shared UI across pages (theme/mode saved + mobile menu + active nav).
 */
const STORAGE_MODE = "aidensarcade-mode";
const STORAGE_THEME = "aidensarcade-theme";

const modeBtn = document.getElementById("modeBtn");
const modeIcon = document.getElementById("modeIcon");
const modeLabel = document.getElementById("modeLabel");

const themeSelect = document.getElementById("themeSelect");

const burgerBtn = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

const yearEl = document.getElementById("year");

function setMode(mode) {
  document.documentElement.setAttribute("data-mode", mode);
  localStorage.setItem(STORAGE_MODE, mode);

  const isDark = mode === "dark";
  if (modeIcon) modeIcon.textContent = isDark ? "☾" : "☀";
  if (modeLabel) modeLabel.textContent = isDark ? "Dark" : "Moonlit";
}

function initMode() {
  const saved = localStorage.getItem(STORAGE_MODE);
  if (saved === "dark" || saved === "light") return setMode(saved);
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
  if (saved) return setTheme(saved);
  setTheme(document.documentElement.getAttribute("data-theme") || "darkwater");
}

function initYear() {
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function initMobileMenu() {
  if (!burgerBtn || !mobileMenu) return;

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

function normalizePath(p) {
  return (p || "").replace(/\/+$/, "") || "/";
}

function initActiveNav() {
  const current = normalizePath(window.location.pathname);
  const all = Array.from(document.querySelectorAll("a.link, #mobileMenu a"));

  for (const a of all) {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#")) continue;

    const url = new URL(href, window.location.href);
    const target = normalizePath(url.pathname);

    if (target === current) {
      a.setAttribute("aria-current", "true");
    }
  }
}

modeBtn?.addEventListener("click", toggleMode);
themeSelect?.addEventListener("change", (e) => setTheme(e.target.value));

initMode();
initTheme();
initYear();
initMobileMenu();
initActiveNav();
