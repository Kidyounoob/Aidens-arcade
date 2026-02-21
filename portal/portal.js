const btnGo = document.getElementById("portalGo");
const input = document.getElementById("portalInput");
const frame = document.getElementById("portalFrame");

function launchProxy() {
    let url = input.value.trim();
    if (!url) return;

    // Fix the URL if it's just a word
    if (!url.includes(".") || url.includes(" ")) {
        url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    } else if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    // Encode it for Ultraviolet
    const encoded = btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
    
    // Send it to the frame
    frame.src = "https://fast-proxy.happydumbjunkday.workers.dev/uv/service/" + encoded;
}

// These lines stop the "disappearing" issue
btnGo.addEventListener("click", (e) => {
    e.preventDefault();
    launchProxy();
});

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        launchProxy();
    }
});
