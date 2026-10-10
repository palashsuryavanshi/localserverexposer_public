/**
 * Post-build checks: internal links, referenced assets, headings, alt text,
 * unescaped template leftovers and basic accessibility markers.
 *
 *   node website/check.mjs
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "docs");

const problems = [];
const note = (file, message) => problems.push(`${file}: ${message}`);

const htmlFiles = (await readdir(OUT)).filter((f) => f.endsWith(".html"));

for (const file of htmlFiles) {
  const html = await readFile(path.join(OUT, file), "utf8");

  if (html.includes("{{")) note(file, "unrendered template token");

  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|data:|#)/.test(ref)) continue;
    const clean = ref.split("#")[0].split("?")[0];
    if (!clean) continue;
    try {
      await readFile(path.join(OUT, clean));
    } catch {
      note(file, `broken local reference: ${ref}`);
    }
  }

  // in-page anchors must exist on this page or the shared nav target
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  for (const ref of refs) {
    if (!ref.startsWith("#") || ref.length < 2) continue;
    if (!ids.has(ref.slice(1))) note(file, `anchor has no target: ${ref}`);
  }
  for (const ref of refs) {
    if (!ref.startsWith("index.html#")) continue;
    const target = ref.slice("index.html#".length);
    const home = await readFile(path.join(OUT, "index.html"), "utf8");
    if (!home.includes(`id="${target}"`)) note(file, `cross-page anchor missing: ${ref}`);
  }

  const images = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  for (const img of images) {
    if (!/alt="/.test(img)) note(file, `image without alt: ${img.slice(0, 70)}`);
    if (!/(width|height)=/.test(img) && !/app-servers|og-image|apple-touch|icon-32/.test(img)) {
      note(file, "image without dimensions (layout shift risk)");
    }
  }

  if (!/<h1[\s>]/.test(html)) note(file, "missing <h1>");
  if (!/<main[\s>]/.test(html)) note(file, "missing <main> landmark");
  if (!/lang="/.test(html)) note(file, "missing lang attribute");
  if (/target="_blank"/.test(html) && !/rel="noopener"/.test(html)) {
    note(file, "target=_blank without rel=noopener");
  }
  if (!/<title>[^<]+<\/title>/.test(html)) note(file, "empty or missing title");
}

const css = await readFile(path.join(OUT, "assets", "site.css"), "utf8");
const js = await readFile(path.join(OUT, "assets", "site.js"), "utf8");
if (/\/\/\s*console\.(log|debug)/.test(js)) problems.push("site.js: leftover console logging");

console.log(`checked ${htmlFiles.length} pages`);
console.log(`  css ${(css.length / 1024).toFixed(1)} kB · js ${(js.length / 1024).toFixed(1)} kB`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log("  no problems found");
