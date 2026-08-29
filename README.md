# markdiv

Render markdown in place: any element with `data-format="markdown"` has its
text converted to HTML by [marked](https://github.com/markedjs/marked).

Marked headings are demoted one level by default (markdown `#` → `<h2>`), so
blocks don't collide with the page's own `<h1>`.

## Browser (no CDN)

```sh
npm install
npm run build
```

`npm run build` compiles two files into `dist/`:

- `dist/markdiv.min.js` — `index.js` plus marked, marked-highlight, and
  highlight.js, bundled and minified (IIFE)
- `dist/markdiv.min.css` — Pico CSS, the highlight.js `github` theme, and
  `css/rev1.css`, bundled and minified (see `build/css.css` to change the
  theme or add files)

Then reference them directly:

```html
<link rel="stylesheet" href="./dist/markdiv.min.css">
<script src="./dist/markdiv.min.js"></script>
```

The script auto-renders every `[data-format="markdown"]` element on load.

## Browser (CDN, quick start)

If you don't want to build, an import map works too:

```html
<script type="importmap">
  {
    "imports": {
      "marked": "https://cdn.jsdelivr.net/npm/marked@15/lib/marked.esm.js",
      "marked-highlight": "https://cdn.jsdelivr.net/npm/marked-highlight@2/+esm",
      "highlight.js": "https://cdn.jsdelivr.net/npm/highlight.js@11/+esm"
    }
  }
</script>
<script type="module" src="./index.js"></script>
```

`styles.css` is an alternative stylesheet for the rendered content; it
exposes CSS variables (`--md-font-size`, `--md-code-bg`, `--md-link`, ...)
for theming.

```html
<section data-format="markdown">
# Becomes an <h2>
some *mark* _down_
</section>
```

## Node / bundlers

```js
import { renderMarkdiv } from "markdiv";

renderMarkdiv(document, {
  demoteHeadings: true,    // default; shift headings down one level
  highlight: true,         // default; syntax-highlight fenced code (marked-highlight + highlight.js)
  markedOptions: { gfm: true }, // passed through to marked
});
```

Fenced code blocks are highlighted with [highlight.js](https://highlightjs.org/)
via [marked-highlight](https://github.com/IsaacW/marked-highlight) by default;
fences without a recognized language are left plain. Link a highlight.js
theme for token colors, e.g.:

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11/styles/github.min.css">
```

Code elements get `class="hljs language-<lang>"`, so custom themes can target
them directly.

`renderMarkdiv` is idempotent — already-rendered elements are skipped.

## Demos

- `demo3.html` — blog template using the built `dist/` files (fully offline
  after `npm run build`)
- `demo.html` — minimal page using the CDN import map (needs network)

## Deploy to GitHub Pages

```sh
git remote add origin git@github.com:<you>/<repo>.git
npm run deploy
```

`npm run deploy` builds and publishes `dist/` (demo3.html as `index.html`
plus the two bundles) to the `gh-pages` branch. Enable Pages in the repo
settings with source **Deploy from a branch** → `gh-pages / (root)`.

## Tests

```sh
npm test
```
