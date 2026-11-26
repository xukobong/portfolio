const {
  getNewsletterConfig,
  htmlEscape,
  htmlPage,
  resendRequest,
  setCors,
  verifyToken
} = require("../../lib/newsletter");

function sendPage(res, status, title, message, extra = "") {
  res.status(status);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.send(htmlPage(title, message, extra));
}

module.exports = async function confirm(req, res) {
  let config;
  try {
    config = getNewsletterConfig();
  } catch (error) {
    return sendPage(res, 500, "Signup unavailable", "The newsletter service is not configured yet.");
  }

  const originAllowed = setCors(req, res, config.allowedOrigins);
  const queryToken = typeof req.query?.token === "string" ? req.query.token : "";
  if (req.method === "GET") {
    const claims = verifyToken(queryToken, config.signingSecret);
    if (!claims) return sendPage(res, 400, "Link expired", "This confirmation link is invalid or has expired. Please sign up again.");

    const extra = `<form method="post" action="/api/newsletter/confirm"><input type="hidden" name="token" value="${htmlEscape(queryToken)}"><button type="submit">Confirm subscription</button></form>`;
    return sendPage(res, 200, "One last step", "Confirm your subscription to receive occasional notes from Saviour.", extra);
  }

  if (!originAllowed) return sendPage(res, 403, "Link unavailable", "This request is not allowed.");
  if (req.method !== "POST") return sendPage(res, 405, "Method not allowed", "Use the confirmation form in your email.");

  const body = typeof req.body === "string" ? (() => {
    try { return Object.fromEntries(new URLSearchParams(req.body)); } catch (error) { return {}; }
  })() : (req.body || {});
  const token = typeof body.token === "string" ? body.token : "";
  const claims = verifyToken(token, config.signingSecret);
  if (!claims) return sendPage(res, 400, "Link expired", "This confirmation link is invalid or has expired. Please sign up again.");

  const encodedEmail = encodeURIComponent(claims.email);
  const existing = await resendRequest(`/contacts/${encodedEmail}`, config);

  if (existing.response.ok) {
    if (existing.data.unsubscribed) {
      const updated = await resendRequest(`/contacts/${encodedEmail}`, config, "PATCH", { unsubscribed: false });
      if (!updated.response.ok) return sendPage(res, 502, "Couldn’t confirm", "Please try again in a little while.");
    }
    const addedToSegment = await resendRequest(
      `/contacts/${encodedEmail}/segments/${encodeURIComponent(config.segmentId)}`,
      config,
      "POST"
    );
    if (!addedToSegment.response.ok && addedToSegment.response.status !== 409) {
      return sendPage(res, 502, "Couldn’t confirm", "Please try again in a little while.");
    }
  } else if (existing.response.status === 404) {
    const created = await resendRequest("/contacts", config, "POST", {
      email: claims.email,
      unsubscribed: false,
      segments: [{ id: config.segmentId }]
    });
    if (!created.response.ok) return sendPage(res, 502, "Couldn’t confirm", "Please try again in a little while.");
  } else {
    return sendPage(res, 502, "Couldn’t confirm", "Please try again in a little while.");
  }

  const safeEmail = htmlEscape(claims.email);
  const extra = `<p><a href="https://xukobong.vercel.app/">Return to the portfolio</a></p>`;
  return sendPage(res, 200, "You’re subscribed", `${safeEmail} is confirmed for occasional updates.`, extra);
};
