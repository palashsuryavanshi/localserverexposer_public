# Troubleshooting and FAQ

- [The app](#the-app)
- [Discovery](#discovery)
- [Tunnels](#tunnels)
- [Installation and SmartScreen](#installation-and-smartscreen)
- [Frequently asked questions](#frequently-asked-questions)

## The app

**The window does not open, or opens blank.**
Install or repair the
[Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/),
then restart the app. If it still fails, reinstall from the
[Releases page](https://github.com/palashsuryavanshi/localserverexposer_public/releases).

**Where did the window go?**
Closing the window hides it to the tray (when *Minimize to tray* is on, the
default). Use the tray icon to reopen it, or disable the setting in *Settings*.

**How do I find the logs?**
*Settings → Open logs folder* opens `%APPDATA%\com.localexp.local-server-exposer\logs\`.
Daily log files are kept for 7 days; `panic.log` is written if the app ever
crashes.

**Does it slow my machine down?**
No. Idle CPU use is effectively zero, and a scan costs a fraction of a percent
of one core, even with dozens of listening ports. You can also lengthen the scan
interval in *Settings*.

## Discovery

**No servers are listed.**
Check that your dev server is actually bound to `127.0.0.1` (some tools bind to
a LAN address instead), then press **Refresh**. If you expected LAN addresses to
appear, check *Settings → Scan localhost only*.

**A port is marked _Unsupported_.**
It is listening but does not answer as HTTP or HTTPS — a database, a debugger
protocol, a game server, and so on. This is deliberate: the app refuses to
expose anything it cannot identify as a web server.

**A port is marked _Unreachable_ / _Unknown_.**
The socket was listed but did not answer the probe. That happens with
firewalled ports, ports closing as you scan, or sockets owned by elevated
processes whose identity the OS does not disclose to a normal user.

**A server keeps disappearing and coming back.**
Short-lived processes (a dev server restarting, a test fixture) will do that.
Cards for servers that vanish while they are tunneled stay visible as
*unavailable* so you can still stop the tunnel.

## Tunnels

**Expose is unavailable / greyed out.**
Only cards marked **Ready** can be exposed. Anything else is either not an
HTTP(S) service or was not reachable when it was scanned.

**"cloudflared is not installed yet".**
The tunnel client is downloaded on demand, never bundled. Open the **Tunnels**
page and choose *Install cloudflared* (this needs internet), or point
*Settings → cloudflared executable* at an existing copy. The copy is checked
before every tunnel starts, so a wrong or corrupted file is refused.

**The tunnel stays on _Starting_.**
Cloudflare edge registration normally completes within a few seconds. If it has
not after about a minute, the app stops waiting and reports the failure. Usual
causes: no internet connection, a captive portal, a proxy or VPN that blocks the
connection, or Cloudflare being unreachable from your network.

**The tunnel says _Tunnel failed_.**
Read the message on the card — it names the reason — then press **Retry**.
Common ones: the network dropped mid-registration, `cloudflared` was deleted or
replaced while running, or the exit code indicated a Cloudflare-side rejection.

**My public URL stopped working.**
Check whether the tunnel still shows **Exposed**. If it stopped, start it again —
each new tunnel gets a **new** URL; the previous one is not reused.

**Can I expose several servers at once?**
Yes. Each port gets its own independent tunnel. Stopping one leaves the others
running, and **Stop all tunnels** in the tray menu ends everything at once.

**What happens to my tunnels if the app crashes or I sign out?**
They are stopped. Tunnels are attached to a Windows Job Object, so the operating
system terminates them when the app's process goes away. A public URL can never
keep serving without the app that you can use to stop it.

**Does the URL change?**
A Quick Tunnel URL stays fixed for as long as that tunnel keeps running. Restart
the tunnel and you get a new URL.

## Installation and SmartScreen

**"Windows protected your PC" / "unrecognized app".**
Expected — the binaries are not code-signed, so they have no publisher
reputation. Confirm you downloaded the file from this repository's
[Releases page](https://github.com/palashsuryavanshi/localserverexposer_public/releases),
verify it against the published `SHA256SUMS.txt`, then choose
*More info → Run anyway*. Never disable SmartScreen permanently.

**The installer asks for administrator rights.**
It should not: the installer is per-user. If you are being prompted, something
in your environment is rewriting the install — check with your administrator.

**Where is the app installed?**
`%LOCALAPPDATA%\Local Server Exposer`. Your settings, logs and downloaded
`cloudflared` live separately in `%APPDATA%\com.localexp.local-server-exposer\`.

**Uninstalling left my data behind.**
Intentional. Settings, favorites, logs and the downloaded tunnel client are kept
so a reinstall keeps your preferences. Delete that folder to remove everything.

## Frequently asked questions

**Does this need port forwarding or a router configuration?**
No. The app makes outbound connections only. Nothing on your router has to
change, and you do not need a static IP.

**Is there a usage limit or a tunnel duration limit?**
The app imposes none. Tunnels last as long as they are running, and Cloudflare
Quick Tunnels are intended for development use.

**Can I use my own domain, or my Cloudflare account?**
Not in this version. Only anonymous Quick Tunnels are supported.

**Can it share a database, SSH, or an admin panel?**
It will refuse. Exposure requires the target to answer as HTTP or HTTPS, which
is checked again by the app itself immediately before a tunnel starts.

**Does it collect telemetry or analytics?**
No. There is no telemetry, no crash reporting to third parties, and no network
activity except the tunnel itself and — once, if you approve it — downloading
the `cloudflared` client. See [Privacy and security](privacy-and-security.md).

**Why isn't the source code available?**
This project publishes compiled binaries and documentation. The application
source is kept private.

**How do I report a problem or request a feature?**
Open an issue on [GitHub](https://github.com/palashsuryavanshi/localserverexposer_public/issues).
Please include the app version, your Windows version, and what you saw — never
paste a tunnel URL into an issue, since a URL is access to your server.