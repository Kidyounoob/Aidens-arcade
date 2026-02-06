/* /emulation/emulation.js */

/**
 * EmulatorJS expects EJS_* globals.
 * Required repo files:
 *   /emulatorjs/data/loader.js
 *   /emulatorjs/data/...
 */
const EMULATOR_LOADER = "../emulatorjs/data/loader.js";
const EMULATOR_DATA = "../emulatorjs/data/";

const note = document.getElementById("emuNote");
const coreSelect = document.getElementById("coreSelect");
const romInput = document.getElementById("romInput");
const biosInput = document.getElementById("biosInput");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const gameDiv = document.getElementById("game");

let romUrl = null;
let biosUrl = null;

function setNote(text) {
  if (note) note.textContent = text;
}

async function fileExists(url) {
  try {
    const r = await fetch(url, { method: "GET", cache: "no-store" });
    return r.ok;
  } catch {
    return false;
  }
}

function cleanup() {
  document.getElementById("ejs-loader")?.remove();
  if (gameDiv) gameDiv.innerHTML = "";

  if (romUrl) URL.revokeObjectURL(romUrl);
  if (biosUrl) URL.revokeObjectURL(biosUrl);
  romUrl = null;
  biosUrl = null;

  delete window.EJS_player;
  delete window.EJS_core;
  delete window.EJS_gameUrl;
  delete window.EJS_pathtodata;
  delete window.EJS_biosUrl;
}

function injectLoader() {
  const s = document.createElement("script");
  s.id = "ejs-loader";
  s.src = EMULATOR_LOADER;
  document.body.appendChild(s);
}

function start() {
  const romFile = romInput?.files?.[0];
  if (!romFile) {
    setNote("Pick a ROM file first.");
    return;
  }

  cleanup();

  romUrl = URL.createObjectURL(romFile);

  const biosFile = biosInput?.files?.[0] || null;
  biosUrl = biosFile ? URL.createObjectURL(biosFile) : null;

  window.EJS_player = "#game";
  window.EJS_core = coreSelect?.value || "gba";
  window.EJS_gameUrl = romUrl;
  window.EJS_pathtodata = EMULATOR_DATA;
  window.EJS_biosUrl = biosUrl || "";

  setNote("Loading… (first boot can take a bit)");
  injectLoader();
}

startBtn?.addEventListener("click", start);
stopBtn?.addEventListener("click", () => {
  cleanup();
  setNote("Stopped.");
});

(async () => {
  const ok = await fileExists(EMULATOR_LOADER);
  setNote(
    ok
      ? "Ready ✅ Upload a ROM and press Start."
      : "Missing emulator files ❌ Add /emulatorjs/data/loader.js + the rest of /emulatorjs/data/."
  );
})();

