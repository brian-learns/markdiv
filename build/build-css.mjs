// Build dist/markdiv.min.css: Pico + highlight.js themes + local overrides.
//
// Code-block theming is inverted relative to the page theme:
//   no data-theme            -> light code (github theme, the historical default)
//   html[data-theme="light"] -> dark code (github-dark tokens)
//   html[data-theme="dark"]  -> light code (github tokens)
import { build } from "esbuild";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

// Prefix every selector in a flat CSS document with `scope` (e.g. 'html[data-theme="dark"] ').
// Handles nested at-rules (like @media) by recursing; hljs themes contain none.
function scope(css, prefix) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) break;
    const header = css.slice(i, open).trim();
    let depth = 1;
    let j = open + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    if (header.startsWith("@")) {
      const inner = header.startsWith("@media") || header.startsWith("@supports")
        ? scope(body, prefix)
        : body;
      out += `${header}{${inner}}`;
    } else {
      const selectors = header
        .split(",")
        .map((s) => `${prefix}${s.trim()}`)
        .join(",");
      out += `${selectors}{${body}}`;
    }
    i = j;
  }
  return out;
}

const pico = read("../node_modules/@picocss/pico/css/pico.min.css");
const hljsLight = read("../node_modules/@highlightjs/cdn-assets/styles/github.min.css");
const hljsDark = read("../node_modules/@highlightjs/cdn-assets/styles/github-dark.min.css");
const local = read("../css/rev1.css");

const css = [
  pico,
  hljsLight, // default code theme (pages without data-theme)
  scope(hljsDark, 'html[data-theme="light"] '),
  scope(hljsLight, 'html[data-theme="dark"] '),
  local,
].join("\n");

const result = await build({
  stdin: { contents: css, resolveDir: ".", loader: "css" },
  bundle: true,
  minify: true,
  write: false,
});

fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/markdiv.min.css", result.outputFiles[0].text);
console.log(`dist/markdiv.min.css  ${Math.round(result.outputFiles[0].text.length / 1024)}kb`);
