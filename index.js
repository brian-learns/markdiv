import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

/**
 * Render the markdown found in every `[data-format="markdown"]` element
 * under `root`, replacing each element's content with the generated HTML.
 *
 * @param {ParentNode} [root=document] Scope in which to search.
 * @param {object} [options]
 * @param {boolean} [options.demoteHeadings=true] Shift heading levels down
 *   one (markdown `#` becomes `<h2>`), so blocks don't collide with the
 *   page's own `<h1>`.
 * @param {boolean} [options.highlight=true] Syntax-highlight fenced code
 *   blocks (via marked-highlight + highlight.js). Code fences without a
 *   recognized language are left plain.
 * @param {object} [options.markedOptions] Extra options passed to marked.
 * @returns {HTMLDivElement[]} The elements that were rendered.
 */
export function renderMarkdiv(root = document, options = {}) {
  const { demoteHeadings = true, highlight = true, markedOptions = {} } = options;
  const parser = new Marked(markedOptions);

  if (demoteHeadings) {
    parser.use({
      renderer: {
        heading({ tokens, depth }) {
          const level = Math.min(depth + 1, 6);
          const text = this.parser.parseInline(tokens);
          return `<h${level}>${text}</h${level}>\n`;
        },
      },
    });
  }

  if (highlight) {
    parser.use(
      markedHighlight({
        langPrefix: "hljs language-",
        highlight(code, lang) {
          if (!lang || !hljs.getLanguage(lang)) return "";
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch {
            return "";
          }
        },
      })
    );
  }

  const elements = [...root.querySelectorAll("[data-format='markdown']")];
  for (const element of elements) {
    if (element.hasAttribute("data-markdiv-rendered")) continue;
    element.innerHTML = parser.parse(element.textContent);
    element.setAttribute("data-markdiv-rendered", "");
  }
  return elements;
}

// Browser bootstrap: apply the theme before first paint, then render the
// markdown and wire up the theme switch (index.html) once the DOM is ready.
if (typeof document !== "undefined") {
  const THEME_KEY = "markdiv-theme";
  const applyTheme = (theme) => document.documentElement.setAttribute("data-theme", theme);

  // Saved theme wins; otherwise follow the system preference.
  applyTheme(
    localStorage.getItem(THEME_KEY) ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  const init = () => {
    renderMarkdiv(document);

    const themeSwitch = document.getElementById("themeSwitch");
    if (!themeSwitch) return;

    // Sync the switch with the theme that was applied above.
    themeSwitch.checked = document.documentElement.dataset.theme === "light";

    themeSwitch.addEventListener("change", (event) => {
      const theme = event.target.checked ? "light" : "dark";
      applyTheme(theme);
      localStorage.setItem(THEME_KEY, theme);
    });

    // Follow the system until the visitor makes an explicit choice.
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      if (localStorage.getItem(THEME_KEY)) return;
      applyTheme(event.matches ? "dark" : "light");
      themeSwitch.checked = !event.matches;
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
