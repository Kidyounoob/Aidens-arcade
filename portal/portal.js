const btnGo = document.getElementById("portalGo");
const input = document.getElementById("portalInput");
const frame = document.getElementById("portalFrame");

const PROXY_ORIGIN = "https://fast-proxy.happydumbjunkday.workers.dev";

function normalizeUrl(raw) {
  let url = (raw || "").trim();
  if (!url) return "";

  // search term -> google
  if (!url.includes(".") || url.includes(" ")) {
    return "https://www.google.com/search?q=" + encodeURIComponent(url);
  }

  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url;
}

function launchProxy(e) {
  if (e) e.preventDefault();
  const target = normalizeUrl(input.value);
  if (!target) return;

  frame.src = `${PROXY_ORIGIN}/go?url=${encodeURIComponent(target)}`;
}

btnGo.addEventListener("click", launchProxy);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") launchProxy(e);
});
