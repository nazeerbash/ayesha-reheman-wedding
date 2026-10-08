# Ayesha & Reheman — The Moonlit Courtyard

A production-ready, mobile-first static wedding invitation for 20 December 2026 in Bengaluru. It uses semantic HTML, plain CSS and JavaScript with native, reduced-motion-aware animation. All event data and asset paths live in `config.js`.

## Local setup

No build step is required. From the project directory run:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. Opening `index.html` directly also works for most features, but a local server gives browser behavior closest to production.

## Configuration

Edit `config.js` to change names, family attribution, dress guidance, guest contact, event date/time and timezone, venue text, schedule, gallery paths and captions, audio path, and deployment URL. Empty personalization fields remain hidden, so no family names or guest guidance are invented. Before deployment, replace `https://example.com` with the final absolute HTTPS URL so Open Graph metadata resolves correctly. The static metadata in `index.html` should also be updated for crawlers that do not execute JavaScript.

`assets/audio/wedding-theme.mp3` is a short original synthesized ambient chord bed included as a functional placeholder. Replace it with the couple's properly licensed final track. The UI detects a missing or unplayable file and hides its control without interrupting the invitation.

The gallery artwork is atmospheric editorial imagery and deliberately does not depict the real couple. Replace `gallery-01.webp` and `gallery-02.webp` with approved photographs later if desired, retaining meaningful alt text in `config.js`.

## RSVP integration

The form currently uses the deliberately local `rsvpAdapter` in `app.js`. It validates and displays an explicit demo-only confirmation; no response leaves the browser. Replace only `rsvpAdapter.submit()` with a call from the Supabase browser client using the project URL and anon key. Apply Row Level Security and an insert-only policy. Never include a service-role key in frontend code.

## Translation note

Qur’an 30:21 is quoted from Marmaduke Pickthall's *The Meaning of the Glorious Koran* (1930). This edition is public domain (published in 1930; Pickthall died in 1936), so reuse does not require a license grant. The page includes clear attribution beside the verse. Sacred text is presented as readable foreground content, never as decoration.

## Assets

All nine requested image files are present and were generated as original concept artwork for this invitation. See `AI-ASSET-PROMPTS.md` for exact regeneration prompts and replacement specifications. The jasmine generator outputs included a dark matte despite requesting alpha, so those WebP files are treated as composited decorative artwork with CSS screen blending; regenerate or manually mask them for true transparent foliage cutouts.

## Deployment

This is a static site suitable for GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any basic web host. No deployment has been performed.
