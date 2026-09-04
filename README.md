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
- `dist/markdiv.min.css` — Pico CSS, highlight.js code themes, and
  `css/rev1.css`, bundled and minified (see `build/build-css.mjs` to change
  the themes or add files)

Then reference them directly:

```html
<link rel="stylesheet" href="./dist/markdiv.min.css">
<script src="./dist/markdiv.min.js"></script>
```

The script auto-renders every `[data-format="markdown"]` element on load.

## Post table of contents

The bundle ships a retro terminal-style post list (`.md-toc`, styled in
`css/rev1.css`) for hand-written blog pages. It's plain HTML — no JS — so
copy it into your home page, one `<li>` per post, newest first:

```html
<nav class="md-toc" aria-label="Posts">
  <ul>
    <li><a href="./nooa-demo-by-hax.html"><time datetime="2026-09-04">2026-09-04</time> ./nooa-demo-by-hax.html</a></li>
    <li><a href="./foo.html"><time datetime="2026-08-29">2026-08-29</time> ./foo.html</a></li>
  </ul>
</nav>
```

The `gopher://` prompt line, ASCII gopher, scanlines, and blinking cursor
are all CSS; the terminal stays dark in both page themes on purpose.
Retune via the `--toc-*` custom properties, e.g.
`style="--toc-title: 'gopher://example.com/1/journal'"`. `index.html`
shows it in the kitchen sink.

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
fences without a recognized language are left plain. Code elements get
`class="hljs language-<lang>"`, so custom themes can target them directly.

The bundled CSS ships two highlight.js themes, inverted against the page
theme (set via `data-theme` on `<html>`, as Pico does):

| Page theme      | Code theme |
| --------------- | ---------- |
| (no attribute)  | light (`github`) |
| `data-theme="light"` | dark (`github-dark`) |
| `data-theme="dark"`  | light (`github`) |

`index.html` is a working example of a theme switch that persists the
choice in `localStorage` and falls back to the system preference.

`renderMarkdiv` is idempotent — already-rendered elements are skipped.

## Demo

`index.html` is a blog template using the built `dist/` files (fully offline
after `npm run build`), with a light/dark theme switch in the footer.

## Deploy to GitHub Pages

```sh
git remote add origin git@github.com:<you>/<repo>.git
npm run deploy
```

`npm run deploy` builds and publishes a `site/` directory (`index.html`
plus the two bundles under `dist/`, mirroring the local layout) to the
`gh-pages` branch. Enable Pages in the repo settings with source
**Deploy from a branch** → `gh-pages / (root)`.

## Tests

```sh
npm test
```
