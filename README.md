# Harsh Patil — Portfolio

Personal portfolio: data science, machine learning, generative AI and data
analytics work.

Static site, no build step and no framework. Plain HTML, CSS and one vanilla JS
file.

## Structure

| | |
| --- | --- |
| `index.html` | Markup for every section |
| `styles.css` | Design tokens, layout, motion |
| `app.js` | Three.js hero, scroll choreography, section rendering, lightbox |
| `uploads/` | Project and certificate images, portraits, resume PDF |

All editable content — projects, certificates, links, resume path — lives in the
`CONFIG` block at the top of `app.js`. Cards are rendered from it, so adding a
project means adding one array entry.

## Images

`uploads/harsh-portrait.jpg` is the portrait, used twice: in the hero orbit and
in the Contact orbit. It wants a square crop, framed fairly tight, since both
places mask it to a circle. Replacing that one file updates both.

`uploads/trail/` holds the seven logos for the About cursor trail, all
normalised to 240x240 WebP with the logo contained and padded so none of them
touch the rounded corners. To swap one, keep that shape and update the
`TRAIL_IMAGES` list in `app.js`.

## How the page works

The hero runs a Three.js point cloud behind the content. It is lazy-loaded from
a CDN and only starts when WebGL is available and the visitor has not asked for
reduced motion; otherwise a CSS gradient stands in. The loop pauses when the
hero scrolls out of view or the tab is hidden, so it costs nothing on the rest
of the page.

Scroll behaviour is GSAP ScrollTrigger: section reveals are batched, and a
single scrubbed trigger on the hero drives both the portrait parallax and the
dispersion of the point cloud. There are no scroll event listeners.

Particle counts scale by device — roughly 2400 on desktop, 1250 on tablet and
620 on mobile — and device pixel ratio is capped at 1.5 on phones.

## Running locally

Must be served over HTTP — `file://` will not work.

```bash
python -m http.server 8321
```

Then open <http://localhost:8321/>.

If a change does not appear, hard-reload (Ctrl+Shift+R). `python -m
http.server` serves `Last-Modified` only, so browsers hold on to old copies of
`app.js` and `styles.css` more aggressively than you expect.

## Deploying

Static — deploys as-is. On Vercel, import the repo and accept the defaults: no
framework preset, no build command, output directory is the repo root.
