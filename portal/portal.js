// public/portal/portal.js (or wherever your Vercel file lives)

const PROXY_ORIGIN = "https://fast-proxy.happydumbjunkday.workers.dev";

const btnGo = document.getElementById("portalGo");
const btnClear = document.getElementById("portalClear");
const input = document.getElementById("portalInput");
const frame = document.getElementById("portalFrame");
const msg = document.getElementById("portalMsg");

function setMsg(text = "") {
  if (!msg) return;
  msg.textContent = text;
}

function normalizeInput(raw) {
  let v = (raw || "").trim();
  if (!v) return "";

  // If it looks like a search (spaces or no dot), send to Google search
  if (v.includes(" ") || !v.includes(".")) {
    return "https://www.google.com/search?q=" + encodeURIComponent(v);
  }

  // Add scheme if missing
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  return v;
}

function navigateTo(url) {
  // Always go through the Worker hostname (NEVER an IP) to avoid Cloudflare 1003
  const dest = `${PROXY_ORIGIN}/go?url=${encodeURIComponent(url)}`;
  frame.src = dest;
  setMsg(`Loading: ${url}`);
}

function launchProxy(e) {
  if (e) e.preventDefault();
  const target = normalizeInput(input.value);
  if (!target) {
    setMsg("Enter a URL or search term.");
    return;
  }
  navigateTo(target);
}

function clearProxy(e) {
  if (e) e.preventDefault();
  input.value = "";
  setMsg("");

  // Go to a safe default that will work even if the SW hasn't registered yet
  frame.src = `${PROXY_ORIGIN}/go?url=${encodeURIComponent("https://example.com")}`;
}

btnGo?.addEventListener("click", launchProxy);
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") launchProxy(e);
});
btnClear?.addEventListener("click", clearProxy);

// Optional: show useful status while iframe loads
frame?.addEventListener("load", () => {
  try {
    const u = new URL(frame.src);
    if (u.origin === PROXY_ORIGIN) {
      if (u.pathname.startsWith("/service/")) setMsg("Loaded.");
      else if (u.pathname === "/go") setMsg("Starting proxy…");
      else setMsg("");
    } else {
      // If something ever changes the iframe to a different origin, warn (helps debug 1003)
      setMsg("Warning: iframe navigated away from proxy origin.");
    }
  } catch {
    setMsg("");
  }
});
