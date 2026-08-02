export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/submit" && request.method === "POST") {
      return handleSubmit(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

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

  const email = (data.email || "").trim();
  if (!email) return json({ ok: false, error: "missing_email" }, 400);

  const type = data["form-type"] || "submission";
  const name = data.artist || data["contact-name"] || "there";

  try {
    await sendEmail(env, {
      to: env.OWNER_EMAIL,
      subject: `New ${labelFor(type)} submission — ${name}`,
      html: internalNotificationHtml(type, data),
    });

    await sendEmail(env, {
      to: email,
      subject: thankYouSubject(type),
      html: thankYouHtml(type, name),
      text: thankYouText(type, name),
      replyTo: env.OWNER_EMAIL,
    });

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
  return { "mix-episode": "Mix Episode", "demo-track": "Demo Track", "event-venue": "Event / Venue" }[type] || type;
}

function thankYouSubject(type) {
  return {
    "mix-episode": "We got your mix, thank you!",
    "demo-track": "We got your track, thank you!",
    "event-venue": "Thanks for the event idea, we'll get back to you soon!",
  }[type] || "Thanks for your submission!";
}

function thankYouBody(type, name) {
  return {
    "mix-episode": `Thank you for trusting us with your mix and your story, ${name}. That's not a small thing to send out into the world, and we don't take it lightly. We'll spend real time with it, and if it feels like a fit, you'll be hearing from us personally soon.\n\nWhatever happens next, you're already part of what we're building here.`,
    "demo-track": `Thank you for sharing your track with us, ${name}. Sending out music you've worked on takes guts, and we respect that. We'll give it a proper listen, and if it clicks with what we're building, we'll reach out to talk next steps.\n\nEither way, glad to have you in this community.`,
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