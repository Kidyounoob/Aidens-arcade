// FILE: api/leaderboard.js
// Vercel Serverless Function (Node) + Redis Sorted Set leaderboard

import { createClient } from "redis";

const LEADERBOARD_KEY = "remy:leaderboard:v1";
const RATE_KEY_PREFIX = "remy:ratelimit:v1:";

let clientPromise = null;

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

function getEnv(nameUpper, nameLower, fallback = undefined) {
  return process.env[nameUpper] ?? process.env[nameLower] ?? fallback;
}

async function getRedisClient() {
  if (clientPromise) return clientPromise;

  const host = getEnv("REDIS_HOST", "redis_host");
  const port = Number(getEnv("REDIS_PORT", "redis_port", "6379"));
  const username = getEnv("REDIS_USER", "redis_user", "default"); // <-- supports redis_user
  const password = getEnv("REDIS_PASSWORD", "redis_password");
  const tls = String(getEnv("REDIS_TLS", "redis_tls", "true")).toLowerCase() === "true";

  if (!host || !password) throw new Error("Missing redis_host/redis_password env vars");

  const client = createClient({
    username,
    password,
    socket: {
      host,
      port,
      tls,
      servername: host,
    },
  });

  client.on("error", () => {});

  clientPromise = client.connect().then(() => client);
  return clientPromise;
}

function normalizeName(name) {
  const n = String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 14);
  return n.length ? n : "Player";
}

function normalizeScore(score) {
  const s = Number(score);
  if (!Number.isFinite(s)) return null;
  const n = Math.trunc(s);
  if (n < 0 || n > 10_000_000) return null;
  return n;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.end();
  }

  let redis;
  try {
    redis = await getRedisClient();
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: "Redis not configured" });
  }

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || "10")));

    try {
      const rows = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, limit - 1, { REV: true });

      const entries = rows.map((row, idx) => {
        let name = "Player";
        let ts = 0;

        try {
          const parsed = JSON.parse(row.value);
          name = normalizeName(parsed?.n);
          ts = Number(parsed?.t || 0);
        } catch {
          name = normalizeName(row.value);
        }

        return {
          rank: idx + 1,
          name,
          score: Math.trunc(row.score),
          ts,
        };
      });

      return sendJson(res, 200, { ok: true, entries });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: "Failed to fetch leaderboard" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      return sendJson(res, 400, { ok: false, error: "Invalid JSON" });
    }

    const name = normalizeName(body?.name);
    const score = normalizeScore(body?.score);
    if (score === null) return sendJson(res, 400, { ok: false, error: "Bad score" });

    // simple rate limit: 5 submits / 10 seconds / IP
    const ip = getIp(req);
    const rateKey = `${RATE_KEY_PREFIX}${ip}`;

    try {
      const n = await redis.incr(rateKey);
      if (n === 1) await redis.expire(rateKey, 10);
      if (n > 5) return sendJson(res, 429, { ok: false, error: "Too many submits" });

      const ts = Date.now();
      const member = JSON.stringify({
        n: name,
        t: ts,
        id: Math.random().toString(36).slice(2),
      });

      await redis.zAdd(LEADERBOARD_KEY, [{ score, value: member }]);

      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: "Failed to submit score" });
    }
  }

  return sendJson(res, 405, { ok: false, error: "Method not allowed" });
}
