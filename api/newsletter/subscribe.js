const { getNewsletterConfig, resendRequest, setCors, signToken } = require("../../lib/newsletter");

module.exports = async function subscribe(req, res) {
  let config;
  try {
    config = getNewsletterConfig();
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Newsletter signup is not configured yet." });
  }

  const originAllowed = setCors(req, res, config.allowedOrigins);
  if (req.method === "OPTIONS") return res.status(originAllowed ? 204 : 403).end();
  if (!originAllowed) return res.status(403).json({ ok: false, message: "This origin is not allowed." });
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed." });

  const body = typeof req.body === "string" ? (() => {
    try { return JSON.parse(req.body); } catch (error) { return {}; }
  })() : (req.body || {});

  // Silently ignore the honeypot while returning the same response as a real signup.
  if (typeof body.website === "string" && body.website.trim()) {
    return res.status(202).json({ ok: true, message: "Check your inbox for a confirmation email." });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: "Enter a valid email address." });
  }

  const token = signToken(email, config.signingSecret);
  const confirmationUrl = `${config.apiUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const emailResult = await resendRequest("/emails", config, "POST", {
    from: config.fromEmail,
    to: [email],
    subject: "Confirm your email updates",
    text: `Please confirm that you would like occasional updates from Saviour Ukobong by visiting this link: ${confirmationUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#141416;max-width:560px;margin:auto;padding:24px"><p style="color:#7c5cfc;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase">xukobong · Journal</p><h1 style="font-size:24px;line-height:1.25">Confirm your email</h1><p>Confirm that you would like occasional updates about new writing and projects.</p><p><a href="${confirmationUrl}" style="display:inline-block;padding:11px 18px;border:1px solid #ececef;border-radius:999px;color:#141416;text-decoration:none">Confirm subscription</a></p><p style="color:#6b6b70;font-size:13px">If you did not request this, ignore this email. This link expires in 24 hours.</p></div>`
  });

  if (!emailResult.response.ok) {
    return res.status(502).json({ ok: false, message: "We couldn’t send a confirmation email. Please try again later." });
  }

  return res.status(202).json({ ok: true, message: "Check your inbox for a confirmation email." });
};
