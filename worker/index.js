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
        replyTo: env.OWNER_EMAIL,
      });
  
      return json({ ok: true });
    } catch (err) {
      return json({ ok: false, error: String(err.message || err) }, 502);
    }
  }
  
  async function sendEmail(env, { to, subject, html, replyTo }) {
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
  
  function thankYouHtml(type, name) {
    const body = {
      "mix-episode": "Thanks so much for sending your mix and taking the time to write your story. We listen to every submission the whole way through, no skipping, and we read every word too. If it feels like the right fit for us, we'll reach out to you personally.",
      "demo-track": "Thanks for sending over your track. We listen to every demo that comes in from start to finish before deciding anything. If it clicks with what we're building here, we'll be in touch to talk next steps.",
      "event-venue": "Thanks for sharing your idea with us. We go through every proposal that comes in, and if it feels like the right fit, we'll reach out to talk it through.",
    }[type] || "Thanks for your submission. We'll be in touch soon.";
  
    return `
    <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#2a2a2a;max-width:520px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B3121B;font-weight:bold;">Decks &amp; Stories</p>
      <div style="border-top:2px solid #B3121B;width:32px;margin:0 0 22px;"></div>
  
      <p style="margin:0 0 16px;">Hey ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;">${body}</p>
      <p style="margin:0 0 22px;color:#6b6b6b;font-style:italic;">Your story means the most to us.</p>
  
      <p style="margin:0;">Talk soon,<br>Decks &amp; Stories</p>
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