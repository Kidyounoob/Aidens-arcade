/* /games/games.js */
const gameSearch = document.getElementById("gameSearch");
const gameSort = document.getElementById("gameSort");
const gamesGrid = document.getElementById("gamesGrid");

const FALLBACK_GAMES = [
  {
    title: "Emulation",
    desc: "Play classic Nintendo systems (bring-your-own legal files).",
    tags: ["Nintendo", "ROM Upload"],
    status: "ready",
    href: "../emulation/",
  },
];

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidGame(g) {
  return (
    g &&
    typeof g.title === "string" &&
    typeof g.desc === "string" &&
    Array.isArray(g.tags) &&
    typeof g.status === "string"
  );
}

function normalizeGames(list) {
  const cleaned = (Array.isArray(list) ? list : [])
    .filter(isValidGame)
    .map((g) => ({
      title: g.title.trim(),
      desc: g.desc.trim(),
      tags: g.tags.map((t) => String(t).trim()).filter(Boolean),
      status: g.status === "ready" ? "ready" : "soon",
      href: typeof g.href === "string" && g.href.trim() ? g.href.trim() : null,
    }))
    .filter((g) => g.title.length > 0);

  return cleaned.length ? cleaned : FALLBACK_GAMES;
}

function matchesQuery(game, q) {
  if (!q) return true;
  const hay = `${game.title} ${game.desc} ${game.tags.join(" ")}`.toLowerCase();
  return hay.includes(q);
}

function sortGames(list, sort) {
  const byTitle = (a, b) => a.title.localeCompare(b.title);

  const byReady = (a, b) => {
    const ax = a.status === "ready" ? 0 : 1;
    const bx = b.status === "ready" ? 0 : 1;
    return ax - bx || byTitle(a, b);
  };

  if (sort === "za") return [...list].sort((a, b) => byTitle(b, a));
  if (sort === "az") return [...list].sort(byTitle);
  return [...list].sort(byReady);
}

function statusLabel(status) {
  return status === "ready" ? "Ready" : "Coming soon";
}

function render(games) {
  const q = (gameSearch?.value || "").trim().toLowerCase();
  const sort = gameSort?.value || "ready";

  const filtered = games.filter((g) => matchesQuery(g, q));
  const sorted = sortGames(filtered, sort);

  gamesGrid.innerHTML = "";

  for (const g of sorted) {
    const card = document.createElement("article");
    card.className = "card";

    const tags = g.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

    card.innerHTML = `
      <div class="status">
        <span class="statusDot" aria-hidden="true"></span>
        <span>${escapeHtml(statusLabel(g.status))}</span>
      </div>

      <h3>${escapeHtml(g.title)}</h3>
      <p>${escapeHtml(g.desc)}</p>

      <div class="tagsRow">${tags}</div>

      <div class="actionsRow">
        <button class="btn primary" type="button">${g.href ? "Open" : "Soon"}</button>
      </div>

      ${g.href ? "" : `<div class="miniNote">Add this game by creating a folder in <code>/games/</code> and updating <code>games.json</code>.</div>`}
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => {
      if (g.href) window.location.href = g.href;
      else alert("Coming soon. Add it by creating /games/<name>/ and setting href in games.json.");
    });

    gamesGrid.appendChild(card);
  }
}

async function loadGamesJson() {
  try {
    const res = await fetch("./games.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return normalizeGames(data);
  } catch (e) {
    return FALLBACK_GAMES;
  }
}

(async () => {
  const games = await loadGamesJson();
  render(games);

  gameSearch?.addEventListener("input", () => render(games));
  gameSort?.addEventListener("change", () => render(games));
})();

