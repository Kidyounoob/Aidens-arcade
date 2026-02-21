const input = document.getElementById("portalInput");
    const btnGo = document.getElementById("portalGo");
    const btnClear = document.getElementById("portalClear");
    const frame = document.getElementById("portalFrame");
    const msg = document.getElementById("portalMsg");
    
    // YOUR NEW PRIVATE PROXY
    const PROXY_URL = "https://arcade-proxy.happydumbjunkday.workers.dev/?url=";
    
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
    
    function go() {
        const urlObj = normalizeUrl(input.value);
    
        if (!urlObj) {
            setMsg("Please enter a valid URL.");
            return;
        }
    
        setMsg("Loading via private proxy...");
        frame.src = PROXY_URL + encodeURIComponent(urlObj.toString());
    }
    
    function clear() {
        input.value = "";
        frame.src = "about:blank";
        setMsg("");
    }
    
    btnGo.addEventListener("click", go);
    btnClear.addEventListener("click", clear);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") go();
    });
