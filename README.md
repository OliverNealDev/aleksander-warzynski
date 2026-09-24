# Aleksander Warzyński portfolio

Static portfolio site for Aleksander Warzyński (FLOART), 3D prop & environment artist.
Live at **https://olivernealdev.github.io/aleksander-warzynski/**

No build step: plain HTML, CSS and a little vanilla JS. GitHub Pages serves the `main` branch root.

```
index.html              Home: hero, selected work, testimonial, about, experience, contact
work/*.html             One page per project
cv.html / cv.pdf        CV (the PDF is printed from cv.html, see below)
css/style.css           All styles (colour tokens at the top of the file)
js/main.js              Nav, lightbox, texture-map switcher, rig preview clip
fonts/archivo.woff2     Archivo for the CV, subset to Latin + Polish (OFL, see fonts/OFL.txt)
img/<project>/          Images: name.webp (full size) + name-sm.webp (800px)
img/og/                 1200×630 JPGs used for link previews (LinkedIn doesn't like WebP)
video/                  Animation showcase + short hover loop
```

## Editing

- **Add a project:** copy a page in `work/`, swap the images and text, add a tile to the
  `#work` section of `index.html`, a link in the pager of the pages either side, and the URL
  to `sitemap.xml`.
- **Images:** export WebP, keep a full-size version and an 800px `-sm` version, and always set
  `width`, `height`, `srcset` and meaningful `alt` text.
- **Link previews:** each page has an `og:image` in `img/og/`. Keep them JPG at 1200×630.
- **CV:** edit `cv.html`, then print it to PDF in Chrome or Edge (A4, margins none,
  headers and footers off) and save over `cv.pdf`. Or headless:
  `msedge --headless --no-pdf-header-footer --print-to-pdf=cv.pdf http://localhost:8000/cv.html`
- **Moving to a custom domain:** `404.html` uses absolute `/aleksander-warzynski/` paths, and
  the canonical/OG URLs and `sitemap.xml` use the github.io address. Update both.

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000.
