/* /portal/portal.js */
const input = document.getElementById("portalInput");
const goBtn = document.getElementById("portalGo");
const clearBtn = document.getElementById("portalClear");
const frame = document.getElementById("portalFrame");
const msg = document.getElementById("portalMsg");

const EMBED_ALLOWLIST = [
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "itch.io",
  "html-classic.itch.zone",
  "itch.zone",
];

function setMsg(t) {
  if (msg) msg.textContent = t || "";
}

function normalizeUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return null;

  try {
    // If it starts with / or ./ it's a relative internal link
    if (s.startsWith("/") || s.startsWith("./")) {
        return new URL(s, window.location.origin);
    }
    const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function canEmbed(urlObj) {
  const host = urlObj.hostname.toLowerCase();
  const currentHost = window.location.hostname.toLowerCase();

  // Allow if it's the same website OR in the allowlist
  return host === currentHost || EMBED_ALLOWLIST.some((d) => host === d || host.endsWith(`.${d}`));
}

function go() {
  const urlObj = normalizeUrl(input.value);
  if (!urlObj) {
    setMsg("That doesn’t look like a valid URL.");
    return;
  }

  if (!canEmbed(urlObj)) {
    setMsg("This site usually doesn’t allow embedding — opening in a new tab.");
    window.open(urlObj.toString(), "_blank", "noopener,noreferrer");
    return;
  }

  setMsg("Trying to embed… If it fails, the site is blocking iframes.");
  frame.src = urlObj.toString();
}

function clear() {
  input.value = "";
  frame.src = "about:blank";
  setMsg("");
}

goBtn?.addEventListener("click", go);
clearBtn?.addEventListener("click", clear);
