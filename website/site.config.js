/**
 * Site configuration — the single source of truth for the website.
 *
 * Every external URL, product fact and piece of copy that appears on more than
 * one page lives here. Templates read from this file; nothing hardcodes a
 * repository address, a version number or a download URL.
 *
 * Run `npm run build` (in website/) after changing anything here.
 */

export const SITE_NAME = "Local Server Exposer";
export const SITE_TAGLINE = "Your local servers, accessible anywhere.";
export const SITE_DESCRIPTION =
  "Discover local development servers, manage Cloudflare Quick Tunnels, and access your projects from external devices using a convenient Windows desktop application.";

/** Public release + documentation repository. The application source is private. */
export const GITHUB_OWNER = "palashsuryavanshi";
export const PUBLIC_REPOSITORY = `https://github.com/${GITHUB_OWNER}/localserverexposer_public`;
export const RELEASES_URL = `${PUBLIC_REPOSITORY}/releases`;
export const LATEST_RELEASE_URL = `${PUBLIC_REPOSITORY}/releases/latest`;
export const ISSUES_URL = `${PUBLIC_REPOSITORY}/issues`;
export const NEW_ISSUE_URL = `${PUBLIC_REPOSITORY}/issues/new`;
export const REPOSITORY_URL = PUBLIC_REPOSITORY;
export const MAINTAINER_URL = `https://github.com/${GITHUB_OWNER}`;
export const MAINTAINER_NAME = GITHUB_OWNER;

/**
 * Canonical site origin.
 *
 * This is the deployed GitHub Pages URL, not a hypothetical domain. If a custom
 * domain is added later, change it here and every canonical tag, sitemap entry
 * and Open Graph URL updates with it.
 */
export const SITE_ORIGIN = "https://palashsuryavanshi.github.io";
export const SITE_BASE_PATH = "/localserverexposer_public";
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`;

/** Release metadata source used at build time and, optionally, in the browser. */
export const RELEASE_API =
  `https://api.github.com/repos/${GITHUB_OWNER}/localserverexposer_public/releases/latest`;

/* ------------------------------------------------------------------ product */

/**
 * Verified platform facts. Only claims checked against the shipped 2.1.0
 * build belong here.
 */
export const PRODUCT = {
  version: "2.1.0",
  platforms: ["Windows 10 (x64)", "Windows 11 (x64)"],
  architectures: ["x64"],
  adminRequired: false,
  codeSigned: false,
  requiresAccount: false,
  tunnelMode: "Cloudflare Quick Tunnel (anonymous)",
  telemetry: false,
  openSource: false,
};

export const TRUST_POINTS = [
  { label: "Windows 10 / 11 · x64", note: "Desktop application" },
  { label: "Cloudflare Quick Tunnels", note: "Anonymous, no account needed" },
  { label: "Per-user install", note: "No administrator rights" },
  { label: "No telemetry", note: "Logs stay on your machine" },
];

/* ---------------------------------------------------------------- navigation */

export const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

/* ------------------------------------------------------------------ features */

export const FEATURES = [
  {
    id: "discovery",
    icon: "server",
    title: "Local server discovery",
    lede: "See the development servers running on your machine.",
    body:
      "The application enumerates IPv4 loopback listeners through the native Windows TCP table and attaches the owning process where the OS permits it. Detection is limited to loopback and wildcard-bound addresses; a port you cannot see is a port the app cannot offer to share.",
  },
  {
    id: "tunnels",
    icon: "network",
    title: "One-click tunnel management",
    lede: "Manage external access without juggling terminals.",
    body:
      "For services that answer HTTP or HTTPS, the app runs the supported Cloudflare Quick Tunnel workflow for you — spawn, watch for the published URL, keep the status current, stop it on request. Anonymous Quick Tunnels are the only mode supported in 2.1.0.",
  },
  {
    id: "urls",
    icon: "external-link",
    title: "Shareable development URLs",
    lede: "Test your project on another device.",
    body:
      "A running tunnel publishes a public https://…trycloudflare.com address for your local service, so a phone on mobile data or a teammate on another network can load the real thing instead of a screenshot.",
  },
  {
    id: "windows",
    icon: "monitor",
    title: "Built for Windows",
    lede: "A desktop workflow designed for developers.",
    body:
      "One native-feeling window replaces a sequence of CLI steps: no terminals to keep open, no flags to memorise, and status that is visible at a glance while you work.",
  },
  {
    id: "projects",
    icon: "layers",
    title: "Multiple local projects",
    lede: "Switch between the services you need.",
    body:
      "Several services can be exposed at the same time, each with its own independent tunnel and URL. Stopping one leaves the others running.",
  },
  {
    id: "control",
    icon: "shield",
    title: "Visibility and control",
    lede: "Know which service you are exposing.",
    body:
      "Exposure is always explicit: the port, the local URL and the owning process are shown in a confirmation dialog before anything is published, and a tunnel can be stopped from the card, the Tunnels page or the tray.",
  },
];

/* --------------------------------------------------------------- how it works */

export const STEPS = [
  {
    n: 1,
    title: "Find your server",
    body:
      "Start your local project and identify its listening port in Local Server Exposer.",
    visual: {
      kind: "server-row",
      port: "5173",
      url: "http://localhost:5173",
      process: "node.exe · PID 17384",
      status: "Ready",
    },
  },
  {
    n: 2,
    title: "Start a tunnel",
    body:
      "Select the intended service and use the supported Cloudflare Tunnel workflow.",
    visual: {
      kind: "tunnel",
      from: "localhost:5173",
      to: "*.trycloudflare.com",
    },
  },
  {
    n: 3,
    title: "Access your project",
    body:
      "Use the available public URL to test the project on a phone, tablet, or another computer.",
    visual: { kind: "device" },
  },
];

export const STEPS_NOTE =
  "Availability depends on tunnel configuration, connectivity, application behaviour, and applicable Cloudflare requirements.";

/* ------------------------------------------------------------- use cases */

export const USE_CASES = [
  {
    id: "phone",
    title: "Test on your phone",
    body:
      "Check responsive layouts on a real mobile device instead of relying entirely on browser emulation.",
    diagram: "phone",
  },
  {
    id: "client",
    title: "Demo to a client",
    body:
      "Share an accessible preview of a development project when the chosen tunnel configuration supports it.",
    diagram: "share",
  },
  {
    id: "team",
    title: "Collaborate with teammates",
    body:
      "Let a teammate inspect a local project through a temporary public endpoint, provided appropriate access controls are in place.",
    diagram: "team",
  },
  {
    id: "learn",
    title: "Learn and experiment",
    body:
      "Make local web development workflows easier to understand for students and independent developers.",
    diagram: "learn",
  },
];

/* ------------------------------------------------------------- architecture */

export const ARCHITECTURE_FLOW = [
  { label: "Windows PC", detail: "Local Server Exposer" },
  { label: "Local development server", detail: "127.0.0.1:<port>" },
  { label: "Cloudflare Tunnel", detail: "Quick Tunnel" },
  { label: "External browser or device", detail: "Public URL" },
];

export const ARCHITECTURE_NOTES = [
  "The local service must be running and reachable on the selected port.",
  "The port you select must correspond to the service you intend to expose.",
  "Tunnel operation depends on the supported Cloudflare configuration and your connectivity.",
  "A public URL is not the same as application-level authentication.",
  "Localhost addresses shown in this site's illustrations are examples, not live endpoints.",
];

/* ----------------------------------------------------------------- security */

export const SECURITY_PRINCIPLES = [
  "You choose which local services are exposed — discovery is not exposure.",
  "Only intended ports should become publicly reachable.",
  "Development servers often expose unfinished code, test data, debug endpoints or admin interfaces.",
  "A public tunnel does not make the underlying application safe.",
  "Stop tunnels when you no longer need them.",
  "Use authentication and application-level access controls where appropriate.",
  "Cloudflare account and authentication requirements depend on the tunnel mode and supported workflow.",
];

export const SECURITY_CHECKLIST = [
  "Confirm the port and application before exposing it.",
  "Remove sensitive or real test data from the service.",
  "Check authentication and access controls are in place.",
  "Never expose databases, debug consoles or administrative endpoints.",
  "Share the public URL only with intended recipients.",
  "Stop the tunnel when you are finished.",
];

/* --------------------------------------------------------------- demo data */

/**
 * Simulated services for the interactive preview. Fictional, and labelled as
 * such in the interface. The site never scans the visitor's machine.
 */
export const DEMO_SERVICES = [
  {
    id: "vite",
    port: "5173",
    url: "http://localhost:5173",
    process: "node.exe · PID 17384",
    framework: "Vite",
    state: "connected",
    publicUrl: "https://quiet-harbour-9c21.trycloudflare.com",
  },
  {
    id: "next",
    port: "3000",
    url: "http://localhost:3000",
    process: "node.exe · PID 14548",
    framework: "Next.js",
    state: "connected",
    publicUrl: "https://amber-lantern-4f08.trycloudflare.com",
  },
  {
    id: "api",
    port: "8000",
    url: "http://localhost:8000",
    process: "python.exe · PID 10232",
    framework: "FastAPI",
    state: "stopped",
    publicUrl: null,
  },
];

/* ---------------------------------------------------------------------- FAQ */

export const FAQ = [
  {
    q: "What is Local Server Exposer?",
    a: "A Windows desktop application that lists the development servers listening on your machine, shows which of them answer HTTP or HTTPS, and lets you publish a chosen one through a Cloudflare Quick Tunnel so it can be reached from another device.",
  },
  {
    q: "Is it free?",
    a: "The application is free to download and there is no paid tier. It depends on Cloudflare's Quick Tunnel service to create public URLs; that service, and any terms attached to it, are Cloudflare's, not ours.",
  },
  {
    q: "Do I need a Cloudflare account?",
    a: "Not for the workflow this application supports. It creates anonymous Quick Tunnels, which need no account. Named tunnels, custom hostnames and Cloudflare Access are not supported in 2.1.0; those modes have their own account and configuration requirements.",
  },
  {
    q: "Does it work with localhost:3000 and localhost:5173?",
    a: "Common development ports are nothing special — what matters is that your project is listening and that it answers HTTP or HTTPS. If the app cannot detect the port you expect, it will not offer to expose it.",
  },
  {
    q: "Can I access my project from my phone?",
    a: "Yes, while the tunnel is running. Your phone needs its own internet connection, not the same Wi-Fi network, and the tunnel must still be active on your PC.",
  },
  {
    q: "Does it expose all my local ports automatically?",
    a: "No. Finding a listening port is not the same as exposing it. Nothing becomes public until you choose a port, read the confirmation dialog and confirm.",
  },
  {
    q: "Is the public URL accessible to anyone?",
    a: "The hostname is hard to guess, but the URL itself is the credential: anyone who obtains it can reach your service until you stop the tunnel. Add application-level authentication if the service should not be reachable by anyone holding the link.",
  },
  {
    q: "Does it work when my computer is turned off?",
    a: "No. The tunnel runs on your machine, so if the machine is off, asleep or disconnected from the internet, the public URL stops serving. This tool is for local development, not hosting.",
  },
  {
    q: "Is my source code public?",
    a: "No. The application is distributed as a compiled Windows binary. This repository is public and contains the website, the documentation and the release downloads; the application source code is kept private.",
  },
  {
    q: "How do I report a bug?",
    a: `Open an issue on the public repository. Include the application version, your Windows version and what you expected to happen — and never paste a live tunnel URL, because a URL is access to your server.`,
  },
];

/* -------------------------------------------------------------- installation */

export const INSTALL_STEPS = [
  {
    title: "Open the latest release",
    body: "Go to the releases page and pick the newest published version.",
  },
  {
    title: "Download the Windows installer",
    body: "Download the published .exe installer for your architecture.",
  },
  {
    title: "Run it",
    body: "Launch the installer and follow the prompts. Installation details depend on how the build is packaged.",
  },
];

export const INSTALL_COMPATIBILITY = [
  { key: "Operating system", value: "Windows 10 or Windows 11, 64-bit" },
  { key: "Architecture", value: "x64", note: "No ARM64 or 32-bit build" },
  { key: "Administrator rights", value: "Not required", note: "The installer is per-user" },
  { key: "Runtime", value: "Microsoft Edge WebView2", note: "Normally already installed" },
  { key: "Internet", value: "Required to start a tunnel", note: "And once, to fetch the tunnel client" },
];

/* --------------------------------------------------------------- footer */

export const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
  { label: "Download", href: "#download" },
  { label: "All releases", href: RELEASES_URL, external: true },
  { label: "Report an issue", href: NEW_ISSUE_URL, external: true },
];

export const PAGES = [
  { slug: "index.html", title: SITE_NAME, description: SITE_DESCRIPTION, nav: null },
  {
    slug: "getting-started.html",
    title: "Getting started",
    description:
      "Find a local server, confirm the exposure, publish a Cloudflare Quick Tunnel and stop it again — a five minute walkthrough of Local Server Exposer.",
    nav: "#getting-started",
  },
  {
    slug: "installation.html",
    title: "Installation",
    description:
      "Install the Local Server Exposer Windows application: requirements, per-user installation, download verification, upgrade and uninstall.",
    nav: "#installation",
  },
  {
    slug: "troubleshooting.html",
    title: "Troubleshooting",
    description:
      "Fixes for common Local Server Exposer problems: ports that are not detected, tunnels that fail, SmartScreen warnings and missing dependencies.",
    nav: "#troubleshooting",
  },
  {
    slug: "security.html",
    title: "Security & privacy",
    description:
      "What happens when you expose a local development server, what the application enforces, and the checklist to run before sharing a URL.",
    nav: "#security",
  },
];