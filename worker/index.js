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
      });
  
      return json({ ok: true });
    } catch (err) {
      return json({ ok: false, error: "send_failed" }, 502);
    }
  }
  
  async function sendEmail(env, { to, subject, html }) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) throw new Error(`Resend error: ${res.status}`);
  }
  
  function labelFor(type) {
    return { "mix-episode": "Mix Episode", "demo-track": "Demo Track", "event-venue": "Event / Venue" }[type] || type;
  }
  
  function thankYouSubject(type) {
    return {
      "mix-episode": "We received your mix — thank you 🎧",
      "demo-track": "We received your demo — thank you 🎵",
      "event-venue": "We received your event idea — thank you",
    }[type] || "Thank you for your submission";
  }
  
  function thankYouHtml(type, name) {
    const body = {
      "mix-episode": "Thank you for sharing your 60-minute mix and your story with us. We listen to and read every single submission — your sound and your words matter to us. If your story fits the movement, we'll reach out personally.",
      "demo-track": "Thank you for sending us your track. We go through every demo carefully. If it clicks with our curation, we'll get in touch to discuss next steps.",
      "event-venue": "Thank you for sharing your event idea with us. We'll review it and reach out if it feels like a good fit.",
    }[type] || "Thank you for your submission. We'll be in touch soon.";
  
    return `
    <div style="background:#060404;padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#0c0607;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:36px 32px;">
        <p style="color:#B3121B;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 18px;">Decks &amp; Stories</p>
        <h1 style="color:#ece8e8;font-size:22px;margin:0 0 16px;">Hey ${escapeHtml(name)},</h1>
        <p style="color:rgba(236,232,232,.75);font-size:15px;line-height:1.6;margin:0 0 16px;">${body}</p>
        <p style="color:rgba(236,232,232,.55);font-size:13px;line-height:1.6;margin:24px 0 0;">— The Decks &amp; Stories team</p>
      </div>
    </div>`;
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