const input = document.getElementById("portalInput");
const btnGo = document.getElementById("portalGo");
const btnClear = document.getElementById("portalClear");
const frame = document.getElementById("portalFrame");
const msg = document.getElementById("portalMsg");

// The Free Proxy URL
const PROXY_URL = "https://api.allorigins.win/raw?url=";

function setMsg(text) {
    msg.textContent = text;
}

function normalizeUrl(url) {
    let str = url.trim();
    if (!str) return null;
    // Add https if missing
    if (!/^https?:\/\//i.test(str)) {
        str = "https://" + str;
    }
    try {
        return new URL(str);
    } catch (e) {
        return null;
    }
}

function go() {
    const urlObj = normalizeUrl(input.value);
    
    if (!urlObj) {
        setMsg("Please enter a valid URL (e.g., google.com)");
        return;
    }

    setMsg("Loading via proxy...");
    
    // Encode the target URL and attach it to the proxy
    const proxiedUrl = PROXY_URL + encodeURIComponent(urlObj.toString());
    
    frame.src = proxiedUrl;
}

function clear() {
    input.value = "";
    frame.src = "about:blank";
    setMsg("");
}

// Event Listeners
btnGo.addEventListener("click", go);
btnClear.addEventListener("click", clear);

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
});
