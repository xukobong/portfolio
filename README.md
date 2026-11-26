# xukobong Portfolio

Simple static HTML/CSS/JS portfolio for @xukobong (Saviour Ukobong).

## Brand
Matches the pixel-builder aesthetic: orange, purple, grid background, and the provided avatar/banner assets.

## Files
- `index.html` — main page
- `style.css` — styles
- `script.js` — project data + rendering
- `avatar.png`, `profile.png`, `banner.png` — brand images

## Run locally
Open `index.html` in a browser, or serve with any static server:

```bash
npx serve .
```

## Update projects
Edit the `projects` array in `script.js`.

## Newsletter signup

The Journal signup uses Resend for confirmation emails and subscriber management. The
portfolio and `api/newsletter/` Vercel Functions are deployed together from this
repository at `https://xukobong.vercel.app/`. Visitors are added to the Resend segment
only after they confirm the email link.

### Configure Resend

1. Verify a sending domain in Resend and create a segment for portfolio updates.
2. Create a Resend API key with permission to send emails and manage contacts/segments.
3. In the Vercel project connected to this repository, add these Production environment
   variables from `.env.example`:

   - `RESEND_API_KEY` — keep this secret in Vercel; never put it in browser code.
   - `RESEND_SEGMENT_ID` — the ID of the newsletter segment.
   - `RESEND_FROM_EMAIL` — a sender on the verified domain, such as
     `Saviour Ukobong <notes@example.com>`.
   - `NEWSLETTER_SIGNING_SECRET` — a random secret of at least 32 bytes.
   - `NEWSLETTER_API_URL` — optional; defaults to `https://xukobong.vercel.app`.
   - `NEWSLETTER_ALLOWED_ORIGINS` — optional; defaults to `https://xukobong.vercel.app`.
     Add any custom site origin as a comma-separated value if one is used.

4. Set the `newsletter-api-url` meta tag in `index.html` to the Vercel project URL. It is
   already set to `https://xukobong.vercel.app`; pushes to the connected production branch
   deploy the site and API together.

`.env.example` contains placeholders only. Add actual credentials in Vercel's Production
environment settings and keep local `.env` files out of Git.

The confirmation link expires after 24 hours. Resend Broadcasts can then be sent to the
segment from the Resend dashboard; include Resend's `{{{RESEND_UNSUBSCRIBE_URL}}}` in
each broadcast so recipients can unsubscribe.
