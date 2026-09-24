# Aleksander Warzyński — portfolio

Static portfolio site for Aleksander Warzyński (FLOART), 3D prop & environment artist.
Live at **https://olivernealdev.github.io/aleksander-warzynski/**

No build step: plain HTML, CSS and a little vanilla JS. GitHub Pages serves the `main` branch root.

```
index.html              Home: hero, selected work, testimonial, about, experience, contact
work/*.html             One case study per project
css/style.css           All styles (colour tokens at the top of the file)
js/main.js              Nav, scroll reveals, lightbox, texture-pass switcher, hover video
img/<project>/          Images: name.webp (full size) + name-sm.webp (800px thumbnail)
video/                  Animation showcase + short hover loop
```

## Editing

- **Add a project:** copy a page in `work/`, swap the images and copy, then add a card to the
  `#work` section of `index.html`.
- **Images:** export WebP, keep a full-size version and an 800px `-sm` version, and always set
  `width`, `height` and meaningful `alt` text.
- **Colours:** change the tokens in `:root` at the top of `css/style.css`.

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000.
