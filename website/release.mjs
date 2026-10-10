/**
 * Release metadata for the website.
 *
 * Order of preference:
 *   1. live GitHub Releases API (public data, no token)
 *   2. a cached snapshot committed to the repository, refreshed only when the
 *      API is reachable
 *   3. nothing — the page falls back to linking the releases page
 *
 * Nothing here invents data: a version, filename or size is only ever shown
 * when it came from GitHub.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_FILE = "release-snapshot.json";
const TIMEOUT_MS = 6000;

/** Human-readable size, matching how the page displays it. */
function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const mb = bytes / 1048576;
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.round(bytes / 1024)} kB`;
}

/** Only treat an asset as the Windows download if it really looks like one. */
function pickWindowsAsset(assets) {  const candidates = assets.filter(
    (asset) =>
      /\.exe$/i.test(asset.name) &&
      !/symbols|debug|sha256|checksum/i.test(asset.name),
  );
  if (candidates.length === 0) return null;
  // Prefer a setup/installer asset, then the largest single match.
  const installers = candidates.filter((a) => /setup|install/i.test(a.name));
  const pool = installers.length ? installers : candidates;
  return pool.sort((a, b) => b.size - a.size)[0];
}

function normalise(payload) {
  const asset = pickWindowsAsset(payload.assets || []);
  return {
    state: asset ? "ready" : "no-windows-asset",
    tag: payload.tag_name,
    version: String(payload.tag_name || "").replace(/^v/, ""),
    name: payload.name,
    url: payload.html_url,
    publishedAt: payload.published_at,
    asset: asset
      ? {
          name: asset.name,
          size: asset.size,
          sizeText: formatBytes(asset.size),
          url: asset.browser_download_url,
        }
      : null,
    fetchedAt: new Date().toISOString(),
  };
}

export async function loadRelease({ config, here }) {
  const cachePath = path.join(here, CACHE_FILE);
  let cached = null;
  try {
    cached = JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    /* no snapshot yet */
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(config.RELEASE_API, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "local-server-exposer-site" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`GitHub API responded ${response.status}`);
    const fresh = normalise(await response.json());
    await writeFile(cachePath, `${JSON.stringify(fresh, null, 2)}\n`, "utf8");
    return fresh;
  } catch (error) {
    if (cached && cached.asset) return { ...cached, state: "cached" };
    if (cached) return { ...cached, state: "cached-no-asset" };
    return { state: "unavailable", asset: null, error: String(error.message || error) };
  } finally {
    clearTimeout(timer);
  }
}