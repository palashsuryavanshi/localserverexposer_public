/**
 * Static site generator for the Local Server Exposer website.
 *
 * Reads `site.config.js`, renders `src/` and writes plain HTML into `docs/`,
 * which GitHub Pages serves as-is. No runtime dependencies, no bundler.
 *
 *   node website/build.mjs          production build
 *   node website/build.mjs --dev    keep whitespace (readable output)
 */

import { readFile, writeFile, mkdir, rm, cp, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as config from "./site.config.js";
import { loadTemplates } from "./loader.mjs";
import { parse } from "./parser.mjs";
import { evaluate } from "./render.mjs";
import { loadRelease } from "./release.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "src");
const STATIC = path.join(HERE, "static");
const OUT = path.join(HERE, "..", "docs");
const IS_DEV = process.argv.includes("--dev");

async function bundleStyles() {
  const layers = ["tokens.css", "base.css", "components.css", "sections.css"];
  const parts = [];
  for (const layer of layers) {
    parts.push(`/* ${layer} */`);
    parts.push(await readFile(path.join(SRC, "styles", layer), "utf8"));
  }
  const css = parts.join("\n\n");
  return IS_DEV ? css : css.replace(/\/\*[\s\S]*?\*\/\s*/g, "");
}

/** Section anchors only exist on the home page; subpages link back to it. */
function resolveLinks(items) {
  return items.map((item) => ({
    ...item,
    href: item.href.startsWith("#") ? `index.html${item.href}` : item.href,
    isExternal: /^https?:/.test(item.href),
  }));
}

function pageContext(page, release) {
  return {
    ...config,
    page: {
      ...page,
      seoTitle:
        page.slug === "index.html"
          ? `${config.SITE_NAME} — ${config.SITE_TAGLINE}`
          : `${page.title} — ${config.SITE_NAME}`,
    },
    site: {
      name: config.SITE_NAME,
      tagline: config.SITE_TAGLINE,
      description: config.SITE_DESCRIPTION,
      owner: config.GITHUB_OWNER,
      maintainerName: config.MAINTAINER_NAME,
      product: config.PRODUCT,
    },
    urls: {
      site: config.SITE_URL,
      repo: config.PUBLIC_REPOSITORY,
      releases: config.RELEASES_URL,
      latest: config.LATEST_RELEASE_URL,
      issues: config.ISSUES_URL,
      newIssue: config.NEW_ISSUE_URL,
      maintainer: config.MAINTAINER_URL,
    },
    navLinks: resolveLinks(config.NAV),
    footerLinks: resolveLinks(config.FOOTER_LINKS),
    release,
  };
}

async function build() {
  const templates = await loadTemplates(SRC);
  const release = await loadRelease({ config, here: HERE });
  const built = [];

  for (const page of config.PAGES) {
    const name = `pages/${page.slug}`;
    if (!templates[name]) throw new Error(`missing template for page: ${name}`);

    const context = pageContext(page, release);
    const body = evaluate(parse(templates[name]), context, templates);
    const shell = { ...context, content: body, styleHref: "assets/site.css" };

    let html = evaluate(parse(templates.layout), shell, templates);
    // Release data is inlined so the page works without JavaScript, and the
    // live endpoint comes from the same config the templates read.
    const releaseScript =
      `window.__LSE_RELEASE__=${JSON.stringify(release)};` +
      `window.__LSE_RELEASE_API__=${JSON.stringify(config.RELEASE_API)};`;
    html = html.replace("<head>", `<head>\n<script>${releaseScript}</script>`);
    if (!IS_DEV) html = html.replace(/\n\s*\n/g, "\n").replace(/>\s+</g, "><");
    built.push({ file: page.slug, html });
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "assets"), { recursive: true });
  for (const page of built) await writeFile(path.join(OUT, page.file), page.html, "utf8");

  await writeFile(path.join(OUT, "assets", "site.css"), await bundleStyles(), "utf8");
  await cp(path.join(SRC, "scripts"), path.join(OUT, "assets"), { recursive: true });
  if (existsSync(STATIC)) await cp(STATIC, path.join(OUT, "assets"), { recursive: true });
  await writeFile(path.join(OUT, ".nojekyll"), "", "utf8");

  const today = new Date().toISOString().slice(0, 10);
  await writeFile(
    path.join(OUT, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${config.SITE_URL}/sitemap.xml\n`,
    "utf8",
  );
  await writeFile(
    path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${config.PAGES.map(
      (page) =>
        `  <url>\n    <loc>${config.SITE_URL}/${page.slug === "index.html" ? "" : page.slug}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
    ).join("\n")}\n</urlset>\n`,
    "utf8",
  );

  console.log(`built ${built.length} pages -> ${path.relative(process.cwd(), OUT)}`);
  for (const page of built) {
    const size = (await stat(path.join(OUT, page.file))).size;
    console.log(`  ${page.file.padEnd(22)} ${(size / 1024).toFixed(1)} kB`);
  }
  console.log(
    release.asset
      ? `  release ${release.tag} · ${release.asset.name} (${(release.asset.size / 1048576).toFixed(2)} MB)`
      : `  release unavailable (${release.state}) — links fall back to the releases page`,
  );
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});