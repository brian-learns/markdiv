import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { renderMarkdiv } from "../index.js";

function makeDocument() {
  return new JSDOM(`<!doctype html><body>
    <h1>Page title</h1>
    <section data-format="markdown">
# Heading
some *mark* _down_

[a link](http://example.com)
* item
* item
    </section>
  </body>`, { url: "http://localhost/" }
  ).window.document;
}

test("renders markdown in [data-format=markdown] elements", () => {
  const document = makeDocument();
  const elements = renderMarkdiv(document);

  assert.equal(elements.length, 1);
  const section = elements[0];
  assert.equal(section.querySelectorAll("h1").length, 0);
  assert.equal(section.querySelector("h2")?.textContent, "Heading");
  assert.equal(section.querySelector("a")?.href, "http://example.com/");
  assert.equal(section.querySelectorAll("li").length, 2);
  assert.ok(section.querySelector("em"));
});

test("demoteHeadings: false keeps original heading levels", () => {
  const document = makeDocument();
  renderMarkdiv(document, { demoteHeadings: false });

  assert.equal(document.querySelector("section h1")?.textContent, "Heading");
  assert.equal(document.querySelector("section h2"), null);
});

test("is idempotent", () => {
  const document = makeDocument();
  renderMarkdiv(document);
  const before = document.querySelector("section").innerHTML;

  renderMarkdiv(document);

  assert.equal(document.querySelector("section").innerHTML, before);
});

test("highlights fenced code by default", () => {
  const document = new JSDOM(
    `<body><section data-format="markdown">\`\`\`python\ndef f():\n    return 1\n\`\`\`\n</section></body>`,
    { url: "http://localhost/" }
  ).window.document;
  renderMarkdiv(document);

  const code = document.querySelector("pre code");
  assert.ok(code.className.includes("hljs"));
  assert.ok(code.className.includes("language-python"));
  assert.ok(code.querySelector(".hljs-keyword"));
});

test("highlight: false leaves code plain", () => {
  const document = new JSDOM(
    `<body><section data-format="markdown">\`\`\`python\ndef f():\n    return 1\n\`\`\`\n</section></body>`,
    { url: "http://localhost/" }
  ).window.document;
  renderMarkdiv(document, { highlight: false });

  const code = document.querySelector("pre code");
  assert.equal(code.querySelector("span"), null);
  assert.ok(!code.className.includes("hljs"));
});

test("ignores elements with other data-format values", () => {
  const document = new JSDOM(
    `<body><div data-format="text">not *markdown*</div></body>`
  ).window.document;
  const elements = renderMarkdiv(document);

  assert.equal(elements.length, 0);
  assert.equal(document.querySelector("div").textContent, "not *markdown*");
});
