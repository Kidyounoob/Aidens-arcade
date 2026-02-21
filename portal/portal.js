const btnGo = document.getElementById("portalGo");
const input = document.getElementById("portalInput");
const frame = document.getElementById("portalFrame");

function launchProxy(e) {
    if (e) e.preventDefault(); // STOPS the "disappearing" reload
    
    let url = input.value.trim();
    if (!url) return;

    // Convert search terms to a Google search
    if (!url.includes(".") || url.includes(" ")) {
        url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    } else if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    // The special "Ultraviolet" way of loading links
    const encoded = btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
    frame.src = "https://fast-proxy.happydumbjunkday.workers.dev/uv/service/" + encoded;
}

btnGo.addEventListener("click", launchProxy);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") launchProxy(e);
});
