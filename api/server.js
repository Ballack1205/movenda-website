// Tiny, dependency-free contact-form backend for the Movenda preview site.
// The static site (web/) cannot run server code, so this is a small
// separate Render web service that only does one thing: take a validated
// contact-form POST and relay it as an email via Resend.
//
// Deliberately zero npm dependencies (built-in http + fetch, both native
// in Node 22) — nothing to audit, nothing to break on a Render rebuild.
import { createServer } from "node:http";

const PORT = process.env.PORT || 10000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info@movenda.be";
// Resend's own shared sender. Swap for a movenda.be address once that
// domain is verified in Resend (needs a DNS record on movenda.be — not
// done yet, see AGENTS.md: don't touch that DNS unless asked).
const CONTACT_FROM = process.env.CONTACT_FROM || "Movenda website <onboarding@resend.dev>";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://movenda-preview.onrender.com")
  .split(",")
  .map((o) => o.trim());

// Very small in-memory rate limit: fine for a single free-tier instance
// fielding a low-traffic contact form. Resets on every cold start/deploy,
// which is an acceptable trade-off for this scale.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function sendContactEmail({ naam, email, telefoon, locatie, bericht }) {
  const html = `
    <h2>Nieuw contactformulier — movenda.be preview</h2>
    <p><strong>Naam:</strong> ${escapeHtml(naam)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
    ${telefoon ? `<p><strong>Telefoon:</strong> ${escapeHtml(telefoon)}</p>` : ""}
    ${locatie ? `<p><strong>Locatie:</strong> ${escapeHtml(locatie)}</p>` : ""}
    <p><strong>Bericht:</strong></p>
    <p>${escapeHtml(bericht).replace(/\n/g, "<br/>")}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `Nieuw contactformulier van ${naam}`,
      html,
      text: `Naam: ${naam}\nE-mail: ${email}\n${telefoon ? `Telefoon: ${telefoon}\n` : ""}${locatie ? `Locatie: ${locatie}\n` : ""}\nBericht:\n${bericht}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders(origin));
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "movenda-contact-api" }));
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/contact") {
    res.writeHead(404, corsHeaders(origin));
    res.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    res.writeHead(429, { ...corsHeaders(origin), "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "rate_limited" }));
    return;
  }

  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1e5) req.destroy(); // 100kb body guard
  });

  req.on("end", async () => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      res.writeHead(400, { ...corsHeaders(origin), "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_json" }));
      return;
    }

    const { naam, email, telefoon, locatie, bericht, website } = data;

    // Honeypot: real users never fill this hidden field. Pretend success
    // so bots don't learn it's a trap.
    if (website) {
      res.writeHead(200, { ...corsHeaders(origin), "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (!naam || !isValidEmail(email) || !bericht || String(bericht).trim().length < 5) {
      res.writeHead(400, { ...corsHeaders(origin), "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_input" }));
      return;
    }

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY env var — cannot send contact emails.");
      res.writeHead(500, { ...corsHeaders(origin), "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "server_not_configured" }));
      return;
    }

    try {
      await sendContactEmail({ naam, email, telefoon, locatie, bericht });
      res.writeHead(200, { ...corsHeaders(origin), "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error("Failed to send contact email:", err);
      res.writeHead(502, { ...corsHeaders(origin), "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "send_failed" }));
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`movenda-contact-api listening on 0.0.0.0:${PORT}`);
});
