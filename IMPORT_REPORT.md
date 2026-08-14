# Portfolio — import & change log

Source: Claude Design project `7a25a149-dbb6-49c2-afaa-ef4f24c19318`
Imported 2026-08-14 via the `claude_design` MCP (`DesignSync`).

## Current state: complete

Every asset the page references exists on disk and loads. Verified in-browser:
11 images, 0 broken; all six certificate modals open; the resume PDF renders.

| | |
| --- | --- |
| Referenced assets | 12 (1 PDF + 11 PNG) — all present |
| Orphan on disk | `uploads/Screenshot 2026-08-14 165404.png` (duplicate of the `-96c987ee` copy) |
| Certificate PDFs | deleted — see below |

## Import notes

The initial import could not pull 9 files intact: `DesignSync.get_file` caps a
read at 256 KiB of base64 (196,608 decoded bytes) and has no range parameter, so
anything larger came back flagged `truncated`. Those files have since been
resolved:

- **5 screenshots** (certificates 1–3, projects 2 & 4) were replaced with the
  full originals. All now pass a PNG chunk + CRC check at their real sizes
  (up to 1.8 MB).
- **4 certificate PDFs** were never recoverable through the API, and are now
  deleted along with the rest of the certificate PDFs.

Three files were never written because they returned inline rather than
streaming to disk, and hand-transcribing binary isn't reliable:
`git logo.png`, `Screenshot 2026-08-14 161605.png`, `Screenshot 2026-08-14 163715.png`.
None is referenced by the page.

One local filename had drifted from the project's (`151253` vs `151213`) and was
renamed to match the `CONFIG` reference, which is what project 2 points at.

## Change: certificates preview as images, not PDFs

All certificate PDFs were deleted from `uploads/`. Each certificate now previews
from its own thumbnail image, and **Verify credential** still links to the
issuer's hosted record (Oracle / Coursera / Forage / HackerRank), which remains
the authoritative proof.

`uploads/Harsh_Patil_Resume.pdf` is the only PDF still shipped.

## Change: PDF preview no longer uses an iframe

The resume modal originally used `<iframe src="…pdf">`, which only renders in
browsers that ship their own PDF viewer. Embedded panes and most mobile browsers
don't, so it painted blank.

It now renders pages itself with PDF.js (`pdfjs-dist@3.11.174` from unpkg, the
same way `support.js` loads React), drawing each page to a canvas.

- Loading/error states are painted directly into the preview node, **not** held
  in component state — `setState` there re-enters `componentDidUpdate` and loops
  the renderer.
- Renders are token-guarded so a stale page can't paint over a newer one.
- An unreadable PDF shows a reason plus a working download button.
- A `ResizeObserver` re-rasterises on width change. Without it the first pass
  measured the host mid-animation and the pages stayed pinned at that width —
  a 240px-wide render sitting in a 966px panel. The parsed document is cached
  per source, so re-rasterising doesn't refetch.

The modal supports both modes: `file:` on a config entry renders as PDF,
`thumb:` alone renders as an image.

## Running it

`index.html` is a Design Component file; `support.js` is the
dc-runtime and fetches React 18.3.1, ReactDOM and Babel from unpkg at load. So
it must be served over HTTP (not `file://`) and needs network on first paint.

```bash
python -m http.server 8321 --directory Portfolio
```

Then open `http://localhost:8321/`.

The entry file was renamed from `Harsh Patil Portfolio.dc.html` to `index.html`
so static hosts serve it at the site root. The dc-runtime locates its component
by parsing the document for `<x-dc>`, so the filename is irrelevant at runtime —
only the Design app's own copy still carries the `.dc.html` name.

**Caching gotcha:** replacement images kept their original capture timestamps,
which were *older* than the broken files they replaced — so browsers held onto
the stale copies on revalidation. Their mtimes were bumped to force refresh. If
an image ever looks half-drawn, hard-reload (Ctrl+Shift+R) before assuming the
file is bad.
