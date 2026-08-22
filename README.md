# Harsh Patil — Portfolio

Personal portfolio: data science, machine learning, generative AI and data
analytics work.

Static site, no build step and no framework. Plain HTML, CSS and one vanilla JS
file.

## Structure

| | |
| --- | --- |
| `index.html` | Markup for every section |
| `styles.css` | Design system, scroll choreography, section styles |
| `app.js` | Canvas engine, scroll narrative, section rendering, lightbox |
| `frames/` | 120-frame scroll animation, per breakpoint, AVIF + WebP |
| `uploads/` | Project and certificate images, resume PDF |

All editable content — projects, certificates, links, resume path — lives in the
`CONFIG` block at the top of `app.js`. Cards are rendered from it, so adding a
project means adding one array entry.

## How the page works

The first ~5.5 viewport-heights are a **scroll track**: a fixed canvas plays a
120-frame sequence scrubbed by scroll position, while the Home and About stages
fade in and out over it on a choreographed timeline. Once the document sections
reach the top of the screen the fixed layers hand off (`body.story-done`) and
Projects / Certifications / Contact scroll normally.

Frames are AVIF, with WebP as a fallback. The format is chosen at runtime by
probing a real frame — if the AVIF decodes, AVIF is used; otherwise WebP.

The page reveals once the first 24 frames are in rather than waiting for all
120, with an 8-second safety timeout so a visitor is never stuck behind the
preloader.

## Running locally

Must be served over HTTP — `file://` will not work.

```bash
python -m http.server 8321
```

Then open <http://localhost:8321/>.

## Deploying

Static — deploys as-is. On Vercel, import the repo and accept the defaults: no
framework preset, no build command, output directory is the repo root.
