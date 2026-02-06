/* /watch/watch.js */
const ytInput = document.getElementById("ytInput");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const ytFrame = document.getElementById("ytFrame");

const DEFAULT_VIDEO = "aqz-KE-bpKQ";

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
    if (idxShorts !== -1 && /^[a-zA-Z0-9_-]{11}$/.test(parts[idxShorts + 1] || "")) {
      return parts[idxShorts + 1];
    }

    const idxEmbed = parts.indexOf("embed");
    if (idxEmbed !== -1 && /^[a-zA-Z0-9_-]{11}$/.test(parts[idxEmbed + 1] || "")) {
      return parts[idxEmbed + 1];
    }
  } catch {
    // ignore
  }

  return null;
}

function loadYouTube(id) {
  const safe = id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : DEFAULT_VIDEO;
  ytFrame.src = `https://www.youtube-nocookie.com/embed/${safe}`;
}

loadBtn?.addEventListener("click", () => {
  const id = parseYouTubeId(ytInput.value);
  if (!id) {
    ytInput.value = "";
    ytInput.placeholder = "Invalid link/ID. Try again…";
    return;
  }
  loadYouTube(id);
});

resetBtn?.addEventListener("click", () => {
  ytInput.value = "";
  ytInput.placeholder = "Paste YouTube link or video ID…";
  loadYouTube(DEFAULT_VIDEO);
});

