# Installation

Local Server Exposer is a **per-user Windows application**. Installation needs
no administrator rights and does not modify system-wide state.

- [Requirements](#requirements)
- [Installing the latest release](#installing-the-latest-release)
- [Verifying the download](#verifying-the-download)
- [First launch](#first-launch)
- [Uninstalling](#uninstalling)
- [Installing a previous version](#installing-a-previous-version)

## Requirements

| | |
|---|---|
| OS | Windows 10 or Windows 11, 64-bit (x64) |
| Disk | ~3 MB for the installer |
| Other | Microsoft Edge WebView2 Runtime â€” normally already installed on Windows 10/11; the installer offers to fetch it if missing |
| Internet | Needed the first time you start a tunnel, and once to download the `cloudflared` client (~55 MB) |

ARM64 and non-Windows platforms are **not supported**.

## Installing the latest release

1. Open the [Releases page](https://github.com/palashsuryavanshi/localserverexposer_public/releases).
2. Download **`Local Server Exposer_<version>_x64-setup.exe`**.
3. Run the installer.

What the installer does:

- installs the application under `%LOCALAPPDATA%\Local Server Exposer`
  (per-user, no admin prompt);
- adds a **Start Menu** shortcut;
- registers an uninstall entry under *Settings â†’ Apps â†’ Installed apps*;
- installs the Microsoft Visual C++ runtime it needs alongside the app;
- offers to install the WebView2 runtime if it is missing.

Your settings, downloaded tunnel client and logs live in a **separate** folder,
`%APPDATA%\com.localexp.local-server-exposer\`, so uninstalling the application
does not delete them.

## Verifying the download

Each release publishes a `SHA256SUMS.txt` file. To check the installer:

1. Download both the installer and `SHA256SUMS.txt` from the same release.
2. In PowerShell:

   ```powershell
   Get-FileHash ".\LocalServerExposer_1.0.0_x64-setup.exe" -Algorithm SHA256
   ```

3. Compare the hash with the line for that file in `SHA256SUMS.txt`.

```text
<64-hex-character hash>  LocalServerExposer_1.0.0_x64-setup.exe
```

> The binaries are **not code-signed**, so Windows SmartScreen shows an
> "unrecognized app" warning on first run. Verify the checksum before choosing
> *More info â†’ Run anyway*.

## First launch

- Launch **Local Server Exposer** from the Start Menu.
- The window opens in under a second and immediately begins scanning for local
  servers (the scan interval is configurable in *Settings*).
- The system tray icon appears; closing the window keeps the app running in the
  background. Use the tray menu to reopen the window, stop all tunnels, or quit.
- When you expose a server for the first time, the app asks you to install
  `cloudflared`. This download is explicit and happens only after you approve
  it â€” never at install time.

## Uninstalling

- **Settings â†’ Apps â†’ Installed apps â†’ Local Server Exposer â†’ Uninstall**, or
  the *Uninstall* shortcut in the Start Menu folder.
- The application, its shortcut and its uninstall entry are removed.
- Your data in `%APPDATA%\com.localexp.local-server-exposer\` (settings,
  favorites, logs, the downloaded `cloudflared`) is **kept**. Delete that folder
  manually for a complete removal.
- Any running tunnels are stopped when the application exits.

## Installing a previous version

Install the older installer over the current one. Existing settings are kept.
Note that the installer blocks downgrading to an older version than the one
currently installed, unless the downgrade is explicitly allowed â€” uninstall
first if you need to go back further.