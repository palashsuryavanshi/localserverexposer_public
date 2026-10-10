# Website source

The Local Server Exposer website. Everything here is rendered into `../docs/`,
which GitHub Pages serves directly.

```
website/
├─ site.config.js      all URLs, product facts and page content
├─ build.mjs           renders src/ -> docs/
├─ parser.mjs          template parser
├─ render.mjs          template evaluation
├─ loader.mjs          template discovery
├─ release.mjs         release metadata (GitHub API + offline snapshot)
├─ check.mjs           post-build link/asset/markup checks
├─ serve.mjs           local static server
├─ make-assets.py      favicons, OG image, optimised screenshots
├─ assets-source/      original screenshots the site is built from
├─ src/
│  ├─ layout.html      page shell: head, SEO, header, footer
│  ├─ pages/           one template per page
│  ├─ partials/        reusable sections shared across pages
│  ├─ styles/          tokens, base, components, sections (bundled in order)
│  └─ scripts/site.js  navigation, accordion, release states, demo preview
└─ tests/              template engine unit tests
```

## Commands

```bash
npm run build     # production build into ../docs
npm run build:dev # same, but keeps whitespace for readable diffs
npm run check     # validate links, assets, alt text, landmarks, titles
npm test          # template engine unit tests
npm run dev       # build (dev mode) and serve http://localhost:4321
npm run assets    # regenerate favicons, OG image and screenshots (needs Python + Pillow)
```

No runtime dependencies. `npm install` is not required to build; it only
installs nothing and enables the scripts.

## Configuration

`site.config.js` is the single source of truth. It holds:

| Export | Purpose |
| --- | --- |
| `GITHUB_OWNER`, `PUBLIC_REPOSITORY`, `RELEASES_URL`, `LATEST_RELEASE_URL`, `ISSUES_URL`, `NEW_ISSUE_URL` | every external link |
| `SITE_ORIGIN`, `SITE_BASE_PATH`, `SITE_URL` | canonical URLs, sitemap, Open Graph |
| `RELEASE_API` | public Releases endpoint used at build time |
| `PRODUCT` | verified platform facts (Windows versions, signing, tunnel mode) |
| `NAV`, `FOOTER_LINKS`, `FEATURES`, `STEPS`, `USE_CASES`, `FAQ`, `SECURITY_*` | page content |

Adding a custom domain means changing `SITE_ORIGIN`/`SITE_BASE_PATH` and adding
`../docs/CNAME`; canonical tags, the sitemap and Open Graph URLs follow
automatically.

## Templates

A deliberately small syntax, implemented in `parser.mjs` and `render.mjs`:

```
{{ value }}                     escaped text
{{{ value }}}                   raw HTML
{{> partial }}                  include
{{#if value }} … {{/if}}        conditional (nestable)
{{#if value == 'x' }} … {{else}} … {{/if}}   equality against a literal
{{#each list }} … {{/each}}     loop; `this` is the item, `@index` its position
```

Unbalanced or stray tags raise a build error rather than rendering something
wrong — a silent empty section is worse than a failed build.

Styles live in four files that are concatenated in order (`tokens`, `base`,
`components`, `sections`) and minified lightly into one `site.css`. Design
tokens — colours, spacing, radii, motion — are CSS custom properties at the top
of `tokens.css`.

## Release metadata

`release.mjs` fetches the latest release from the public GitHub Releases API:

1. live API on success, and the result is cached in `release-snapshot.json`;
2. the cached snapshot when the API is unreachable (for example, offline);
3. nothing at all, in which case every download button falls back to the
   releases page.

Only data GitHub actually returned is rendered — version, publication date,
asset name, asset size. There is no hardcoded version anywhere. The page also
re-checks the API in the browser so a new release appears without a rebuild;
if that call fails the build-time answer stays on screen.

## Adding a page

1. add the template to `src/pages/<name>.html`;
2. add an entry to `PAGES` in `site.config.js` (`slug`, `title`, `description`);
3. `npm run build && npm run check`.

The sitemap, navigation context and page shell are generated from that entry.

## Deploying

`docs/` is committed and served by GitHub Pages (branch `main`, folder `/docs`).
Rebuild and commit `docs/`; no CI is required for the site to publish. The
`.nojekyll` file stops Jekyll from rewriting the output.
