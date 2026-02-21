const btnGo = document.getElementById("portalGo");
const btnClear = document.getElementById("portalClear");
const frame = document.getElementById("portalFrame");
const msg = document.getElementById("portalMsg");

frame.src = "https://fast-proxy.happydumbjunkday.workers.dev/";
msg.textContent = "Proxy loaded! Please type your game into the search bar inside the window below.";

function resetProxy() {
    frame.src = "https://fast-proxy.happydumbjunkday.workers.dev/";
}

btnGo.addEventListener("click", resetProxy);
btnClear.addEventListener("click", resetProxy);
