# Harsh Patil — Portfolio

Personal portfolio site: data science, machine learning, generative AI and data
analytics work.

Static site, no build step. `index.html` holds the markup and the component
logic; `support.js` is the runtime that mounts it and pulls React, ReactDOM and
Babel from unpkg at load. Certificate and project images live in `uploads/`,
alongside the resume PDF.

## Running locally

It must be served over HTTP — opening the file directly with `file://` will not
work, and the first paint needs network access for the CDN scripts.

```bash
python -m http.server 8321
```

Then open <http://localhost:8321/>.

## Deploying

Static — deploys as-is. On Vercel, import the repo and accept the defaults: no
framework preset, no build command, output directory is the repo root.
