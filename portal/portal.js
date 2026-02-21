const input = document.getElementById("portalInput");
const btnGo = document.getElementById("portalGo");
const btnClear = document.getElementById("portalClear");
const frame = document.getElementById("portalFrame");
const msg = document.getElementById("portalMsg");

// This is your new working proxy link!
const PROXY_URL = "https://fast-proxy.happydumbjunkday.workers.dev/?url=";

function setMsg(text) {
    msg.textContent = text;
}

function normalizeUrl(url) {
    let str = url.trim();
    if (!str) return null;
    if (!/^https?:\/\//i.test(str)) {
        str = "https://" + str;
    }
    try {
        return new URL(str);
    } catch (e) {
        return null;
    }
}

async function go() {
    const urlObj = normalizeUrl(input.value);
    
    if (!urlObj) {
        setMsg("Please enter a valid URL.");
        return;
    }

    setMsg("Fetching via private proxy...");
    
    try {
        const target = PROXY_URL + encodeURIComponent(urlObj.toString());
        const response = await fetch(target);
        let html = await response.text();

        const baseTag = `<base href="${urlObj.href}">`;
        if (html.includes('<head>')) {
            html = html.replace('<head>', '<head>' + baseTag);
        } else {
            html = baseTag + html;
        }

        frame.removeAttribute('src');
        frame.srcdoc = html;
        setMsg(""); 
        
    } catch (err) {
        setMsg("Error: Could not fetch the website.");
        console.error(err);
    }
}

function clear() {
    input.value = "";
    frame.srcdoc = "";
    frame.src = "about:blank";
    setMsg("");
}

btnGo.addEventListener("click", go);
btnClear.addEventListener("click", clear);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
});
