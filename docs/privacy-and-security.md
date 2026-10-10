# Privacy and security

This page explains what Local Server Exposer does with your data, what risks
sharing a local server carries, and what the application does to reduce them.

- [The short version](#the-short-version)
- [What happens when you expose a server](#what-happens-when-you-expose-a-server)
- [What the application refuses to do](#what-the-application-refuses-to-do)
- [Local data and logs](#local-data-and-logs)
- [Downloads](#downloads)
- [Integrity of the binaries](#integrity-of-the-binaries)
- [Threat model summary](#threat-model-summary)
- [Known limitations](#known-limitations)
- [Reporting a security issue](#reporting-a-security-issue)

## The short version

- Exposing a server makes it reachable by anyone who has the link. **The link is
  the credential.**
- Only expose development servers you trust, on a machine you control.
- The app has no telemetry, no analytics and no account system.
- Tunnel URLs are redacted before anything is written to disk.
- A tunnel cannot outlive the application.
- The binaries are **not code-signed**; verify the published SHA-256 checksum.

## What happens when you expose a server

Local Server Exposer starts a [Cloudflare Quick Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/):
your local port is bridged to an ephemeral public HTTPS URL on
`*.trycloudflare.com`, served through Cloudflare's network.

Consequences worth understanding:

- **The URL is bearer access.** The hostname is random and hard to guess, but
  anyone who obtains the URL can send requests to your server for as long as the
  tunnel runs. Do not post it publicly, and do not put it in a bug report.
- **Your server sees the real traffic.** Requests arrive at your local process
  with their original path, headers and body. If your dev server has an
  unauthenticated admin endpoint, it is now on the public internet.
- **You stay responsible for what you share.** The app does not inspect or
  filter the content passing through the tunnel; that is between you and the
  service you expose.
- **Quick Tunnels are for development.** They are anonymous, unencrypted at the
  identification level (no account, no custom hostname), and not intended as a
  production front end.
- **Cloudflare sees the traffic**, as any reverse proxy or tunnel provider must.
  Their privacy terms apply to traffic passing through their edge.

Stop the tunnel when you are done. The URL stops resolving to your machine as
soon as the tunnel process exits.

## What the application refuses to do

These are enforced in the application, not merely documented:

| Guarantee | How it works |
|---|---|
| **Confirmation before every exposure** | Every start â€” including retries â€” shows a dialog naming the port and process. There is no permanent "don't ask again". |
| **Only HTTP/HTTPS can be exposed** | The application re-probes the target itself immediately before starting a tunnel and refuses anything that does not answer as a web server, regardless of what the interface claims. |
| **Only loopback targets** | Discovery and probing are limited to `127.0.0.0/8` and the `0.0.0.0` wildcard. Remote hosts are never probed or exposed. |
| **Tunnels never outlive the app** | Each tunnel process belongs to a Windows Job Object configured to terminate its members when the app's process ends â€” including on crash, forced kill, sign-out or shutdown. |
| **No shell execution** | Process arguments are fixed and built in the backend. The user interface has no shell, filesystem or arbitrary-process capability. |
| **The tunnel client is verified** | `cloudflared` is checked for plausible size, PE executable format, and a parseable `--version` result â€” before first use and again before **every** tunnel. |

## Local data and logs

Everything the app stores lives in `%APPDATA%\com.localexp.local-server-exposer\`:

| Item | Contents | Notes |
|---|---|---|
| `config.json` | UI preferences, favorite ports, scan interval, autostart flag | No credentials. No tunnel URLs. |
| `logs\` | Daily rotating log files, 7-day retention, plus `panic.log` if the app ever crashes | Tunnel URLs are redacted (`https://[tunnel].trycloudflare.com`) before anything is written. Response bodies, headers and cookies are never logged. |
| `cloudflared.exe` | The Cloudflare tunnel client | Present only if you chose to install it. Verified before use. |

There is **no telemetry and no analytics**: the application does not report
usage, crash or performance data to anyone.

Two honest caveats:

- Redaction of tunnel URLs in logs is a filter applied to text the tunnel client
  prints; it is not a guarantee about every future version of that output.
- Windows toast notifications for tunnel events are kept in the Windows
  notification history until dismissed, and a notification body includes the
  public URL. If that matters on a shared machine, clear notification history
  or disable notifications.

## Downloads

The application downloads `cloudflared` only when you explicitly approve it,
from the official Cloudflare release URL over HTTPS. It is never bundled with
the installer, and a valid copy is never silently replaced.

`cloudflared` is Â© Cloudflare, Inc. and licensed under the Apache License 2.0.

## Integrity of the binaries

Every release publishes a `SHA256SUMS.txt` file with the SHA-256 hash of each
downloadable artifact.

```powershell
Get-FileHash ".\LocalServerExposer_1.0.0_x64-setup.exe" -Algorithm SHA256
```

The binaries are **not Authenticode-signed**, which has two consequences:

1. Windows SmartScreen shows an "unrecognized app" warning and the app has no
   publisher reputation. This is expected, not a sign of tampering.
2. Authenticity rests on the checksum published in the release, not on a
   signature chain.

Only download from this repository's
[Releases page](https://github.com/palashsuryavanshi/localserverexposer_public/releases).

## Threat model summary

| Concern | Position |
|---|---|
| Accidental exposure | Mitigated: confirmation per exposure, honest status labels, destructive actions separated. |
| Exposing a non-web service | Not possible: re-validated in the backend before each start. |
| Malicious response from a probed server | Mitigated: probing is bounded (size caps, timeouts, header and title limits) and nothing is rendered as markup. |
| Command injection via a port, path or URL | Not possible: typed arguments, integer ports, strict URL validation, no shell. |
| Compromise via the tunnel client | Mitigated: HTTPS download, size + PE magic + `--version` verification, re-verified on every use. |
| Orphaned tunnel after a crash | Not possible: kill-on-close Job Object, verified by automated tests. |
| Public URL leakage through logs | Mitigated: URL redaction before writing; residual risk from notification history. |

## Known limitations

- **Tunnel URLs are bearer credentials.** Anyone with the link can reach the
  server until the tunnel is stopped. This is inherent to the product.
- **No checksum pinning for `cloudflared`.** Cloudflare does not publish a
  checksum file at the download URL the app uses, so identity rests on HTTPS,
  the executable format and the `--version` output.
- **Self-signed HTTPS origins** are reached with TLS verification relaxed, and
  only for loopback targets.
- **Unsigned binaries** mean no publisher reputation and a SmartScreen warning.
- **Notification history** retains tunnel URLs until cleared.
- The application has had an internal threat-model review. It has **not** been
  penetration tested or certified by any third party.

## Reporting a security issue

Please report security issues privately through
[GitHub Security Advisories](https://github.com/palashsuryavanshi/localserverexposer_public/security/advisories/new)
for this repository rather than in a public issue, and give the maintainer a
reasonable time to release a fix before disclosing details.

**Never include a live tunnel URL in a report** â€” treat it as a password.