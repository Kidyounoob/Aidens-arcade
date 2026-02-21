const btnGo = document.getElementById("portalGo");
const btnClear = document.getElementById("portalClear");
const frame = document.getElementById("portalFrame");
const input = document.querySelector(".portalInput");

function launchProxy(e) {
    if (e) e.preventDefault(); // This stops the "disappearing" page reload!
    
    let query = input.value.trim();
    if (!query) return;
    
    // If they didn't type http, add it so the proxy doesn't crash
    if (!query.includes(".") || query.includes(" ")) {
        query = "https://www.google.com/search?q=" + encodeURIComponent(query);
    } else if (!query.startsWith("http")) {
        query = "https://" + query;
    }

    // Turn the URL into the special proxy format
    const encoded = btoa(query).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
    frame.src = "https://fast-proxy.happydumbjunkday.workers.dev/uv/service/" + encoded;
}

btnGo.addEventListener("click", launchProxy);

// This makes the "Enter" key work too!
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") launchProxy(e);
});

btnClear.addEventListener("click", () => {
    input.value = "";
    frame.src = "https://fast-proxy.happydumbjunkday.workers.dev/";
});
