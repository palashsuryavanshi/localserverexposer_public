/* Local Server Exposer — website behaviour.
 *
 * Small, dependency-free, and defensive: every feature degrades to a working
 * static page if this file fails to run.
 */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ mobile nav */

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    // Close after navigating to an in-page target.
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
  }

  /* ------------------------------------------------------------- accordion */

  function initAccordion() {
    document.querySelectorAll("[data-accordion]").forEach((root) => {
      root.querySelectorAll(".accordion__trigger").forEach((trigger) => {
        const item = trigger.closest(".accordion__item");
        const panel = document.getElementById(trigger.getAttribute("aria-controls"));
        if (!item || !panel) return;

        trigger.addEventListener("click", () => {
          const open = trigger.getAttribute("aria-expanded") === "true";
          trigger.setAttribute("aria-expanded", String(!open));
          item.classList.toggle("is-open", !open);
          panel.hidden = open;
        });

        // Arrow-key navigation between headers, as expected for a disclosure list.
        root.addEventListener("keydown", (event) => {
          if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
          const triggers = [...root.querySelectorAll(".accordion__trigger")];
          const index = triggers.indexOf(trigger);
          if (index === -1) return;
          let next = index;
          if (event.key === "ArrowDown") next = (index + 1) % triggers.length;
          if (event.key === "ArrowUp") next = (index - 1 + triggers.length) % triggers.length;
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = triggers.length - 1;
          event.preventDefault();
          triggers[next].focus();
        });
      });
    });
  }

  /* ---------------------------------------------------------- reveal on scroll */

  function initReveal() {
    const targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          setTimeout(() => entry.target.classList.add("is-visible"), Math.min(index * 45, 220));
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* -------------------------------------------------------- release metadata */

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "";
    const mb = bytes / 1048576;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${Math.round(bytes / 1024)} kB`;
  }

  function formatDate(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function initRelease() {
    const status = document.querySelector("[data-release-status]");
    const meta = document.querySelector("[data-release-meta]");
    const cta = document.querySelector("[data-release-primary]");
    const ctaLabel = document.querySelector("[data-release-primary-label]");
    // Every download call to action in the page, including the header button.
    const ctas = [...document.querySelectorAll("[data-download-cta], [data-release-primary]")];
    if (!status && !ctas.length) return;

    const releasesUrl = (cta && cta.getAttribute("href")) || "#";

    const showUnavailable = (message) => {
      if (status) {
        status.textContent = message;
      }
      ctas.forEach((link) => {
        link.setAttribute("href", releasesUrl);
        link.removeAttribute("aria-disabled");
      });
      if (ctaLabel) ctaLabel.textContent = "View the releases page";
    };

    const applyRelease = (release, { live }) => {
      if (!release || !release.asset) {
        if (release && release.state === "no-windows-asset") {
          showUnavailable("No Windows installer is published in the latest release.");
        } else {
          showUnavailable("Release information is unavailable right now.");
        }
        return;
      }

      const { asset } = release;

      if (status) {
        status.textContent = "";
        const badge = document.createElement("span");
        badge.className = "badge badge--ok";
        badge.textContent = release.version ? `v${release.version}` : "latest";
        status.append(badge, document.createTextNode(" · published "));

        const time = document.createElement("time");
        if (release.publishedAt) time.setAttribute("datetime", release.publishedAt);
        time.textContent = formatDate(release.publishedAt) || "recently";
        status.append(time);

        if (!live) {
          const cached = document.createElement("span");
          cached.className = "muted";
          cached.textContent = " · cached";
          status.append(cached);
        }
      }

      if (meta) {
        meta.hidden = false;
        meta.textContent = "";
        const name = document.createElement("span");
        name.className = "mono";
        name.textContent = asset.name;
        const size = document.createElement("span");
        size.textContent = formatBytes(asset.size);
        const notes = document.createElement("a");
        notes.href = release.url || releasesUrl;
        notes.target = "_blank";
        notes.rel = "noopener";
        notes.textContent = "Release notes";
        meta.append(name, size, notes);
      }

      ctas.forEach((link) => link.setAttribute("href", asset.url));
      if (ctaLabel) ctaLabel.textContent = `Download v${release.version}`;
    };

    // Build-time snapshot first: the button is useful before any network call.
    const snapshot = window.__LSE_RELEASE__;
    applyRelease(snapshot, { live: false });

    // Re-check the live API so a newly published release shows up without a
    // site rebuild. Failure is invisible: the snapshot answer stays.
    const api = window.__LSE_RELEASE_API__;
    if (!api) return;

    fetch(api, { headers: { Accept: "application/vnd.github+json" } })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data) => {
        const assets = Array.isArray(data.assets) ? data.assets : [];
        const asset = assets
          .filter((a) => /\.exe$/i.test(a.name) && !/symbols|debug|sha256/i.test(a.name))
          .sort((a, b) => b.size - a.size)[0];
        if (!asset) return;
        applyRelease(
          {
            state: "ready",
            version: String(data.tag_name || "").replace(/^v/, ""),
            publishedAt: data.published_at,
            url: data.html_url,
            asset: { name: asset.name, size: asset.size, url: asset.browser_download_url },
          },
          { live: true },
        );
      })
      .catch(() => {
        /* keep whatever the snapshot already rendered */
      });
  }

  /* ------------------------------------------------------- simulated preview */

  function initDemo() {
    const list = document.querySelector("[data-demo-services]");
    if (!list) return;

    const services = [...list.querySelectorAll(".svc")];
    const localOut = document.querySelector("[data-demo-local]");
    const statusOut = document.querySelector("[data-demo-status]");
    const urlOut = document.querySelector("[data-demo-url]");
    const copyBtn = document.querySelector("[data-demo-copy]");
    const toggleBtn = document.querySelector("[data-demo-toggle]");
    const countOut = document.querySelector("[data-demo-count]");

    let selected = null;
    let running = false;

    const runningCount = () => services.filter((s) => s.dataset.state === "connected").length;
    const refreshCount = () => {
      if (countOut) countOut.textContent = String(runningCount());
    };

    const render = () => {
      services.forEach((service) => {
        const active = service === selected;
        service.setAttribute("aria-pressed", String(active));
        const badge = service.querySelector("[data-demo-badge]");
        if (badge) {
          const connected = service.dataset.state === "connected";
          badge.className = `svc__status badge ${connected ? "badge--live" : "badge--muted"}`;
          badge.innerHTML = "";
          if (connected) {
            const dot = document.createElement("span");
            dot.className = "dot dot--pulse";
            badge.append(dot);
          }
          badge.append(document.createTextNode(connected ? "Connected" : "Stopped"));
        }
      });

      if (!selected) return;
      const url = selected.dataset.public || "";
      if (localOut) localOut.textContent = `${selected.dataset.url} (${selected.dataset.port})`;
      if (statusOut) statusOut.textContent = running ? "Connected" : "Stopped";
      if (urlOut) urlOut.textContent = running && url ? url : "—";
      if (toggleBtn) toggleBtn.textContent = running ? "Stop tunnel" : "Start tunnel";
      if (copyBtn) copyBtn.disabled = !(running && url);
    };

    services.forEach((service) => {
      service.addEventListener("click", () => {
        selected = service;
        running = service.dataset.state === "connected";
        render();
      });
    });

    toggleBtn &&
      toggleBtn.addEventListener("click", () => {
        if (!selected) {
          services[0]?.click();
          return;
        }
        running = !running;
        selected.dataset.state = running ? "connected" : "stopped";
        refreshCount();
        render();
      });

    copyBtn &&
      copyBtn.addEventListener("click", async () => {
        const url = selected?.dataset.public;
        if (!url || !running) return;
        const original = copyBtn.textContent;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(url);
          } else {
            // Fallback for browsers without clipboard permission.
            const field = document.createElement("textarea");
            field.value = url;
            field.setAttribute("readonly", "");
            field.style.position = "fixed";
            field.style.opacity = "0";
            document.body.append(field);
            field.select();
            document.execCommand("copy");
            field.remove();
          }
          copyBtn.textContent = "Copied";
        } catch {
          copyBtn.textContent = "Copy failed";
        }
        setTimeout(() => {
          copyBtn.textContent = original;
        }, 1600);
      });

    refreshCount();
  }

  /* ------------------------------------------------------------------- boot */

  function boot() {
    initNav();
    initAccordion();
    initReveal();
    initRelease();
    initDemo();
    document.documentElement.dataset.js = "on";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();