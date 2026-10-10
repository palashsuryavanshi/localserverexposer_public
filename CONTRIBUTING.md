# Contributing

This repository is the public documentation and download portal for **Local
Server Exposer**. The application is distributed as a compiled Windows binary;
its source code is not hosted here.

## What belongs in this repository

- The landing page (`README.md`)
- The website source (`website/`) and its built output (`docs/`), served with
  GitHub Pages from `docs/`:
  [palashsuryavanshi.github.io/localserverexposer_public](https://palashsuryavanshi.github.io/localserverexposer_public/)
- Product screenshots and icons (`website/assets-source/` and the generated
  files in `docs/assets/`)
- Release notes and downloadable binaries, attached to
  [GitHub Releases](https://github.com/palashsuryavanshi/localserverexposer_public/releases)

`docs/` is generated output — do not edit it by hand. Change `website/src/`,
`website/site.config.js` or `website/static/`, then run `npm run build` and
`npm run check` inside `website/` and commit the regenerated `docs/`.

**Never commit here:** application source code, build configuration, `.git`
directories of other repositories, credentials, signing keys, private
configuration, or compiled binaries (those belong in release assets, not in Git
history).

## Reporting problems

- **Bug report** — open an issue with the [bug label](https://github.com/palashsuryavanshi/localserverexposer_public/issues/new?labels=bug).
  Include the app version, your Windows version, what you expected, and what
  happened. **Never paste a live tunnel URL** — a URL is access to your server.
- **Feature request** — open an issue with the
  [enhancement label](https://github.com/palashsuryavanshi/localserverexposer_public/issues/new?labels=enhancement).
- **Security issue** — use a
  [private security advisory](https://github.com/palashsuryavanshi/localserverexposer_public/security/advisories/new),
  not a public issue.

## Suggesting documentation changes

Documentation pull requests are welcome. Please:

- keep the tone factual — no claims about security, privacy, performance or
  compatibility that have not been verified;
- use real screenshots of the current version, captured locally, never mock-ups
  presented as real;
- keep every download link pointing at this repository's Releases page;
- put repository URLs and product facts in `website/site.config.js` rather than
  hardcoding them in a template;
- run `npm test` and `npm run check` in `website/` before submitting;
- update the version references if they appear.

## Code contributions

Code changes are handled in the private development repository and published
here as release artifacts. If you would like to contribute code, open an issue
first and describe the change — access to the development repository is granted
case by case.

## Code of conduct

Be respectful and constructive. Assume good faith, keep discussion focused on
the technical question, and do not post secrets, personal data, or tunnel URLs
in any channel.