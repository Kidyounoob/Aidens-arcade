const input = document.getElementById("portalInput");
const btnGo = document.getElementById("portalGo");
const btnClear = document.getElementById("portalClear");
const frame = document.getElementById("portalFrame");
const msg = document.getElementById("portalMsg");

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

    setMsg("Loading with layout fixes...");
    
    // With x-frame-bypass, we just set the URL directly.
    // The component handles the proxying for us!
    frame.src = urlObj.toString();
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
