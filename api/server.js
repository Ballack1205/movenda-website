// Tiny, dependency-free contact + newsletter backend for the Movenda preview
// site. The static site (web/) cannot run server code, so this is a small
// separate Render web service that relays forms via Resend.
import { createServer } from "node:http";

const PORT = process.env.PORT || 10000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "julie@movenda.be";
const JULIE_EMAIL = "julie@movenda.be";
const CONTACT_FROM = process.env.CONTACT_FROM || "Movenda website <onboarding@resend.dev>";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://movenda-preview.onrender.com")
  .split(",")
  .map((o) => o.trim());

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

function optionalLine(label, value) {
  return value ? `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>` : "";
}

async function sendContactEmail(data) {
  const {
    naam,
    email,
    telefoon,
    locatie,
    bericht,
    waarvoor,
    voorschrift,
    hoeGevonden,
    hoeGevondenDetail,
    clubNaam,
    eventNaam,
  } = data;

  const hoe = [hoeGevonden, hoeGevondenDetail, clubNaam, eventNaam].filter(Boolean).join(" — ");
  const text = [
    "Sent via form submission from Movenda",
    "",
    `: ${naam}`,
    "",
    `Email: ${email || ""}`,
    "",
    `Telefoon: ${telefoon || ""}`,
    "",
    locatie ? `Vestiging: ${locatie}` : "",
    "",
    `Waarvoor wil je langskomen?: ${waarvoor || ""}`,
    "",
    `Heb je een voorschrift van je arts?: ${voorschrift || ""}`,
    "",
    `Hoe ben je bij ons terecht gekomen? : ${hoe}`,
    "",
    "Jouw vraag of bericht:",
    bericht || "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const html = text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: Array.from(new Set([CONTACT_TO_EMAIL, JULIE_EMAIL])),
      reply_to: email,
      subject: "Form Submission - Contactpagina website",
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

async function addToAudience(email) {
  if (!RESEND_AUDIENCE_ID) return false;
  const res = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend audience error ${res.status}: ${body}`);
  }
  return true;
}

async function notifyNewsletter(email) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_TO_EMAIL],
      subject: `Nieuwsbrief-inschrijving: ${email}`,
      html: `<p>Nieuwe inschrijving: ${escapeHtml(email)}</p>`,
      text: `Nieuwe inschrijving: ${email}`,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

async function sendPopupSignupEmail(data) {
  const { naam, email, telefoon, popupTitel, extra } = data;
  const extraEntries =
    extra && typeof extra === "object"
      ? Object.entries(extra).filter(([, value]) => value != null && String(value).trim() !== "")
      : [];
  const extraHtml = extraEntries
    .map(([label, value]) => optionalLine(String(label).slice(0, 120), String(value).slice(0, 500)))
    .join("");
  const extraText = extraEntries
    .map(([label, value]) => `${String(label).slice(0, 120)}: ${String(value).slice(0, 500)}`)
    .join("\n");
  const eventName = popupTitel ? String(popupTitel).slice(0, 160) : "Pop-up";

  const html = `
    <h2>Nieuwe inschrijving via pop-up — ${escapeHtml(eventName)}</h2>
    <p><strong>Naam:</strong> ${escapeHtml(naam)}</p>
    <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
    ${optionalLine("Telefoon", telefoon)}
    ${extraHtml}
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
      subject: `Inschrijving: ${eventName} — ${naam}`,
      html,
      text: `Event: ${eventName}\nNaam: ${naam}\nE-mail: ${email}\nTelefoon: ${telefoon || ""}\n${extraText}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e5) req.destroy();
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function json(res, origin, status, payload) {
  res.writeHead(status, { ...corsHeaders(origin), "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
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

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  if (req.method === "POST" && isRateLimited(ip)) {
    json(res, origin, 429, { error: "rate_limited" });
    return;
  }

  if (req.method === "POST" && req.url === "/api/newsletter") {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      json(res, origin, 400, { error: "invalid_json" });
      return;
    }
    if (data.website) {
      json(res, origin, 200, { ok: true });
      return;
    }
    if (!isValidEmail(data.email)) {
      json(res, origin, 400, { error: "invalid_input" });
      return;
    }
    if (!RESEND_API_KEY) {
      json(res, origin, 500, { error: "server_not_configured" });
      return;
    }
    try {
      const added = await addToAudience(data.email);
      if (!added) await notifyNewsletter(data.email);
      json(res, origin, 200, { ok: true });
    } catch (err) {
      console.error("Newsletter signup failed:", err);
      json(res, origin, 502, { error: "send_failed" });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/popup-signup") {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      json(res, origin, 400, { error: "invalid_json" });
      return;
    }
    if (data.website) {
      json(res, origin, 200, { ok: true });
      return;
    }
    if (!data.naam || !isValidEmail(data.email) || !data.telefoon) {
      json(res, origin, 400, { error: "invalid_input" });
      return;
    }
    if (!RESEND_API_KEY) {
      json(res, origin, 500, { error: "server_not_configured" });
      return;
    }
    try {
      await sendPopupSignupEmail(data);
      json(res, origin, 200, { ok: true });
    } catch (err) {
      console.error("Popup signup failed:", err);
      json(res, origin, 502, { error: "send_failed" });
    }
    return;
  }

  if (req.method === "POST" && req.url === "/api/groepslessen") {
    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch {
      json(res, origin, 400, { error: "invalid_json" });
      return;
    }
    if (data.website) {
      json(res, origin, 200, { ok: true });
      return;
    }
    if (!data.naam || !isValidEmail(data.email) || !data.les) {
      json(res, origin, 400, { error: "invalid_input" });
      return;
    }
    if (!RESEND_API_KEY) {
      json(res, origin, 500, { error: "server_not_configured" });
      return;
    }
    const text = [
      "Sent via form submission from Movenda",
      "",
      `: ${data.naam}`,
      "",
      `Email: ${data.email}`,
      "",
      `Telefoon: ${data.telefoon || ""}`,
      "",
      `Les: ${data.les}`,
      "",
      "Bericht:",
      data.bericht || "",
    ].join("\n");
    try {
      const mail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: CONTACT_FROM,
          to: Array.from(new Set([data.coachEmail, JULIE_EMAIL].filter(isValidEmail))),
          reply_to: data.email,
          subject: "Form Submission - Groepslessen",
          text,
          html: text.split("\n").map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`).join(""),
        }),
      });
      if (!mail.ok) throw new Error(await mail.text());
      json(res, origin, 200, { ok: true });
    } catch (err) {
      console.error("Group signup failed:", err);
      json(res, origin, 502, { error: "send_failed" });
    }
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/contact") {
    json(res, origin, 404, { error: "not_found" });
    return;
  }

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    json(res, origin, 400, { error: "invalid_json" });
    return;
  }

  if (data.website) {
    json(res, origin, 200, { ok: true });
    return;
  }

  if (!data.naam || !isValidEmail(data.email) || !data.bericht || String(data.bericht).trim().length < 5) {
    json(res, origin, 400, { error: "invalid_input" });
    return;
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY env var — cannot send contact emails.");
    json(res, origin, 500, { error: "server_not_configured" });
    return;
  }

  try {
    await sendContactEmail(data);
    json(res, origin, 200, { ok: true });
  } catch (err) {
    console.error("Failed to send contact email:", err);
    json(res, origin, 502, { error: "send_failed" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`movenda-contact-api listening on 0.0.0.0:${PORT}`);
});
