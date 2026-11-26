const crypto = require("node:crypto");

const RESEND_API = "https://api.resend.com";
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getNewsletterConfig() {
  const apiUrl = (process.env.NEWSLETTER_API_URL || "https://xukobong.vercel.app").replace(/\/$/, "");
  const allowedOrigins = (process.env.NEWSLETTER_ALLOWED_ORIGINS || "https://xukobong.vercel.app")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!apiUrl.startsWith("https://")) throw new Error("NEWSLETTER_API_URL must use HTTPS");
  allowedOrigins.push(new URL(apiUrl).origin);
  const signingSecret = requiredEnv("NEWSLETTER_SIGNING_SECRET");
  if (Buffer.byteLength(signingSecret) < 32) throw new Error("NEWSLETTER_SIGNING_SECRET must be at least 32 bytes");

  return {
    apiUrl,
    allowedOrigins,
    apiKey: requiredEnv("RESEND_API_KEY"),
    segmentId: requiredEnv("RESEND_SEGMENT_ID"),
    fromEmail: requiredEnv("RESEND_FROM_EMAIL"),
    signingSecret
  };
}

function setCors(req, res, allowedOrigins) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }
  return !origin || allowedOrigins.includes(origin);
}

function signToken(email, secret) {
  const payload = Buffer.from(JSON.stringify({
    email,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    nonce: crypto.randomBytes(16).toString("base64url")
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token, secret) {
  if (typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch (error) {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!claims.email || claims.expiresAt < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch (error) {
    return null;
  }
}

async function resendRequest(path, config, method = "GET", body) {
  const response = await fetch(`${RESEND_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function htmlPage(title, message, extra = "") {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff"><title>${title} — xukobong</title>
<style>
  *{box-sizing:border-box}body{margin:0;padding:2rem 1rem;background:#f7f7f8;color:#141416;font:16px/1.6 system-ui,sans-serif}
  main{max-width:36rem;margin:12vh auto;padding:2rem;background:#fff;border:1px solid #ececef;border-radius:14px}
  h1{font-size:1.5rem;line-height:1.2;margin:0 0 .75rem}p{color:#6b6b70;margin:.5rem 0 1rem}
  button,a{font:inherit}button{padding:.7rem 1rem;border:1px solid #ececef;border-radius:999px;background:#fff;color:#141416;cursor:pointer}
  button:hover,button:focus-visible,a:focus-visible{outline:2px solid #7c5cfc;outline-offset:3px}
  a{color:#141416}
</style></head><body><main><p class="kicker">xukobong · Journal</p><h1>${title}</h1><p>${message}</p>${extra}</main></body></html>`;
}

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

module.exports = {
  getNewsletterConfig,
  htmlEscape,
  htmlPage,
  resendRequest,
  setCors,
  signToken,
  verifyToken
};
