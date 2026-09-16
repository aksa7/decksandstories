const ALLOWED_ORIGINS = new Set([
  "https://decksandstories.com",
  "https://www.decksandstories.com",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/newsletter-subscribe") {
      if (request.method === "OPTIONS") {
        return corsPreflight(request);
      }
      if (request.method === "POST") {
        return handleNewsletterSubscribe(request, env);
      }
      return json({ ok: false, error: "method_not_allowed" }, 405);
    }

    if (url.pathname === "/api/submit" && request.method === "POST") {
      return handleSubmit(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

function looksLikeSpam(data) {
  // Honeypot: real users never fill this, bots often do
  if ((data.website || "").trim() !== "") return true;

  // Fields that should be plain names/places should never contain a URL
  const suspectFields = ["artist", "contact-name", "location", "born-in", "instagram", "genre"];
  for (const field of suspectFields) {
    const v = (data[field] || "");
    if (/https?:\/\//i.test(v)) return true;
  }

  return false;
}

async function notifyTelegram(env, type, data) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const text = `New ${labelFor(type)} submission\n\n` +
    Object.entries(data).map(([k, v]) => `${k}: ${String(v).slice(0, 300)}`).join("\n");
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text.slice(0, 4000) }),
    });
  } catch (e) {
    console.error("Telegram notify failed:", e.message);
  }
}

async function handleNewsletterSubscribe(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return corsJson({ ok: false, error: "origin_not_allowed" }, 403, origin);
  }

  if (!env.RESEND_API_KEY || !env.RESEND_SEGMENT_ID) {
    return corsJson({ ok: false, error: "missing_env_vars" }, 500, origin);
  }

  let email = "";
  try {
    const ct = request.headers.get("Content-Type") || "";
    if (ct.includes("application/json")) {
      const body = await request.json();
      email = String(body?.email || "").trim();
    } else {
      const fd = await request.formData();
      email = String(fd.get("email") || "").trim();
    }
  } catch {
    return corsJson({ ok: false, error: "bad_request" }, 400, origin);
  }

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return corsJson({ ok: false, error: "invalid_email" }, 400, origin);
  }

  try {
    const createRes = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });

    // ok or "already exists" both allow continuing — other errors fail for the user
    if (!createRes.ok) {
      const errBody = await createRes.text().catch(() => "");
      const alreadyExists = /already exists|contact_already_exists|duplicate/i.test(errBody);
      if (!alreadyExists) {
        console.error("Resend create contact failed:", createRes.status, errBody);
        return corsJson({ ok: false, error: "resend_failed" }, 502, origin);
      }
    }

    // Segment assignment is a separate API call (POST /contacts does not accept segments)
    const segRes = await fetch(
      `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${env.RESEND_SEGMENT_ID}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
      },
    );
    if (!segRes.ok) {
      const segErr = await segRes.text().catch(() => "");
      console.error("Resend add-to-segment failed:", segRes.status, segErr);
      return corsJson({ ok: false, error: "resend_failed" }, 502, origin);
    }

    return corsJson({ ok: true }, 200, origin);
  } catch (err) {
    console.error("Newsletter subscribe failed:", err.message || err);
    return corsJson({ ok: false, error: "resend_failed" }, 502, origin);
  }
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://decksandstories.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function corsPreflight(request) {
  const origin = request.headers.get("Origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function corsJson(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin || "") },
  });
}

async function handleSubmit(request, env) {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.OWNER_EMAIL) {
    return json({ ok: false, error: "missing_env_vars" }, 500);
  }

  let data;
  try {
    const fd = await request.formData();
    data = Object.fromEntries(fd.entries());
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  if (looksLikeSpam(data)) {
    return json({ ok: true });
  }

  const email = (data.email || "").trim();
  if (!email) return json({ ok: false, error: "missing_email" }, 400);

  const type = data["form-type"] || "submission";
  const name = data.artist || data["contact-name"] || "there";

  try {
    try {
      await notifyTelegram(env, type, data);
    } catch {}

    try {
      await sendEmail(env, {
        to: env.OWNER_EMAIL,
        subject: `New ${labelFor(type)} submission — ${name}`,
        html: internalNotificationHtml(type, data),
      });
    } catch (err) {
      console.error("Owner email failed:", err.message);
    }

    try {
      await sendEmail(env, {
        to: email,
        subject: thankYouSubject(type),
        html: thankYouHtml(type, name),
        text: thankYouText(type, name),
        replyTo: env.OWNER_EMAIL,
      });
    } catch (err) {
      console.error("Thank-you email failed:", err.message);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) }, 502);
  }
}

async function sendEmail(env, { to, subject, html, text, replyTo }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${errBody}`);
  }
}

function labelFor(type) {
  return { "mix-episode": "Mix Episode", "event-venue": "Event / Venue" }[type] || type;
}

function thankYouSubject(type) {
  return {
    "mix-episode": "We got your mix, thank you!",
    "event-venue": "Thanks for the event idea, we'll get back to you soon!",
  }[type] || "Thanks for your submission!";
}

function thankYouBody(type, name) {
  return {
    "mix-episode": `Thank you for trusting us with your mix and your story, ${name}. That's not a small thing to send out into the world, and we don't take it lightly. We'll spend real time with it, and if it feels like a fit, you'll be hearing from us personally soon.\n\nWhatever happens next, you're already part of what we're building here.`,
    "event-venue": `Thank you for thinking of us with this idea, ${name}. We'll go through it properly, and if it feels like the right fit, we'll get back to you to talk it through.\n\nAppreciate you wanting to build something with us.`,
  }[type] || `Thank you for reaching out, ${name}. We'll be in touch soon.`;
}

function thankYouHtml(type, name) {
  const body = thankYouBody(type, name);
  const paragraphs = body.split("\n\n").map(p => `<p>${escapeHtml(p)}</p>`).join("\n");
  return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#000000;">
${paragraphs}
<p>Talk soon,<br>Decks &amp; Stories</p>
</div>`;
}

function thankYouText(type, name) {
  const body = thankYouBody(type, name);
  return `${body}\n\nTalk soon,\nDecks & Stories`;
}

function internalNotificationHtml(type, data) {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#888;">${escapeHtml(k)}</td><td style="padding:4px 8px;">${escapeHtml(String(v)).slice(0, 2000)}</td></tr>`)
    .join("");
  return `<h2>New ${escapeHtml(labelFor(type))} submission</h2><table>${rows}</table>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}