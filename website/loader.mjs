/**
 * Template loading: reads `website/src` into a name → source map.
 *
 * `pages/*` keep their folder prefix (`pages/index.html`), `partials/*` are
 * addressable by bare name (`header`), and everything else at the root uses its
 * file name without the extension (`layout`).
 */

import { readFile, readdir } from "node:fs/promises";

export async function loadTemplates(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = {};
  for (const entry of entries) {
    const full = `${dir}/${entry.name}`;
    if (!entry.isDirectory()) {
      if (!entry.name.endsWith(".html")) continue;
      const key = prefix ? `${prefix}${entry.name}` : entry.name.replace(/\.html$/, "");
      out[key] = await readFile(full, "utf8");
      continue;
    }
    if (entry.name === "pages") Object.assign(out, await loadTemplates(full, "pages/"));
    else if (entry.name === "partials") Object.assign(out, await loadTemplates(full, ""));
    else if (entry.name !== "styles" && entry.name !== "scripts") {
      Object.assign(out, await loadTemplates(full, prefix));
    }
  }
  return out;
}