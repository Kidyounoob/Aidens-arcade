// /api/proxy.js
/**
 * Vercel Serverless proxy (safe-by-default)
 * Usage:
 *   /api/proxy?url=https%3A%2F%2Fapi.yourdomain.com%2Fv1%2Fstatus
 */

const ALLOWED_HOSTS = new Set([
  "api.yourdomain.com",
  // "cdn.yourdomain.com",
]);

function isPrivateOrLocalHost(hostname) {
  const h = (hostname || "").toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;

  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;

  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function setCors(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Range, If-None-Match");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (req.method === "OPTIONS") {
    setCors(res, origin);
    return res.status(204).end();
  }

  if (!["GET", "HEAD"].includes(req.method)) {
    setCors(res, origin);
    return res.status(405).send("Method not allowed");
  }

  const raw = (req.query.url || "").toString();
  if (!raw) {
    setCors(res, origin);
    return res.status(400).send("Missing ?url=");
  }

  let target;
  try {
    target = new URL(raw);
  } catch {
    setCors(res, origin);
    return res.status(400).send("Invalid url");
  }

  if (!["https:", "http:"].includes(target.protocol)) {
    setCors(res, origin);
    return res.status(400).send("Bad protocol");
  }

  if (isPrivateOrLocalHost(target.hostname) || !ALLOWED_HOSTS.has(target.hostname)) {
    setCors(res, origin);
    return res.status(403).send("Upstream not allowed");
  }

  const headers = {};
  if (req.headers.accept) headers["accept"] = req.headers.accept;
  if (req.headers.range) headers["range"] = req.headers.range;
  if (req.headers["if-none-match"]) headers["if-none-match"] = req.headers["if-none-match"];
  if (req.headers.authorization) headers["authorization"] = req.headers.authorization;

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    redirect: "follow",
  });

  setCors(res, origin);
  res.status(upstream.status);

  // copy content-type if present
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("content-type", ct);

  // stream body
  const buf = Buffer.from(await upstream.arrayBuffer());
  return res.send(buf);
}
