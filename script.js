
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const sidebar = $("#sidebar");
  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3400);
  }

  // Page navigation
  const pageTitles = {
    overview: "OVERVIEW",
    servers: "MY SERVERS",
    commands: "COMMAND CENTRE",
    premium: "SUBSCRIPTIONS",
    redeem: "REDEEM CODE",
    customize: "BOT CUSTOMISATION"
  };

  function showPage(pageName) {
    const page = $("#page-" + pageName);
    if (!page) return;

    $$(".page").forEach(item => item.classList.remove("active"));
    page.classList.add("active");

    $$(".nav-item[data-page]").forEach(button => {
      const isActive = button.dataset.page === pageName;
      button.classList.toggle("active", isActive);

      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    const breadcrumb = $("#breadcrumb-current");
    if (breadcrumb) breadcrumb.textContent = pageTitles[pageName] || "OVERVIEW";

    if (sidebar) sidebar.classList.remove("open");

    window.location.hash = pageName;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $$(".nav-item[data-page]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  $$("[data-go]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.go));
  });

  function loadHashPage() {
    const pageName = window.location.hash.replace("#", "");
    if (pageTitles[pageName]) {
      showPage(pageName);
    } else {
      showPage("overview");
    }
  }

  window.addEventListener("hashchange", loadHashPage);
  loadHashPage();

  // Mobile navigation
  const mobileMenu = $("#mobile-menu");

  if (mobileMenu && sidebar) {
    mobileMenu.setAttribute("aria-expanded", "false");

    mobileMenu.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("open");
      mobileMenu.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", event => {
      if (
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !mobileMenu.contains(event.target)
      ) {
        sidebar.classList.remove("open");
        mobileMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Floating Halloween decorations
  const decor = $("#halloween-decor");

  if (decor && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const decorations = ["🦇", "🎃", "✦", "👻", "🦇", "✧"];
    const fragment = document.createDocumentFragment();

    decorations.forEach((symbol, index) => {
      const item = document.createElement("span");
      item.className = "floating-decoration";
      item.textContent = symbol;
      item.style.left = `${8 + index * 15}%`;
      item.style.animationDuration = `${17 + index * 4}s`;
      item.style.animationDelay = `${-index * 3.7}s`;
      item.style.fontSize = `${13 + (index % 3) * 5}px`;
      fragment.appendChild(item);
    });

    decor.appendChild(fragment);
  }

  // Command search and category filter
  const commandSearch = $("#command-search");
  const commandCategory = $("#command-category");
  const commandRows = $$(".command-row");
  const noCommands = $("#no-commands");

  function filterCommands() {
    const query = (commandSearch?.value || "").trim().toLowerCase();
    const category = commandCategory?.value || "all";
    let visibleCount = 0;

    commandRows.forEach(row => {
      const matchesName =
        row.dataset.name.toLowerCase().includes(query) ||
        row.textContent.toLowerCase().includes(query);

      const matchesCategory =
        category === "all" || row.dataset.category === category;

      const visible = matchesName && matchesCategory;
      row.classList.toggle("hidden", !visible);

      if (visible) visibleCount++;
    });

    if (noCommands) {
      noCommands.classList.toggle("hidden", visibleCount > 0);
    }
  }

  commandSearch?.addEventListener("input", filterCommands);
  commandCategory?.addEventListener("change", filterCommands);

  // Demo-only command toggle persistence in this browser
  const enabledCount = $("#overview-enabled");
  const storageKey = "rex-dashboard-demo-commands-v1";

  function updateCommandCount() {
    if (enabledCount) {
      enabledCount.textContent = String(
        $$("[data-command]").filter(input => input.checked).length
      );
    }
  }

  function loadDemoCommands() {
    let saved = {};

    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      saved = {};
    }

    $$("[data-command]").forEach(input => {
      if (Object.prototype.hasOwnProperty.call(saved, input.dataset.command)) {
        input.checked = Boolean(saved[input.dataset.command]);
      }

      input.addEventListener("change", () => {
        const current = {};

        $$("[data-command]").forEach(command => {
          current[command.dataset.command] = command.checked;
        });

        try {
          localStorage.setItem(storageKey, JSON.stringify(current));
        } catch {
          // The controls still work for the current page session.
        }

        updateCommandCount();
        showToast(
          `${input.dataset.command} demo setting ${input.checked ? "enabled" : "disabled"}. Live bot unchanged.`
        );
      });
    });

    updateCommandCount();
  }

  loadDemoCommands();

  // Discord sign-in placeholder: backend OAuth is not connected yet.
  function requestDiscordLogin() {
    showToast(
      "Discord login is not connected yet. We will add the secure OAuth backend next."
    );
  }

  $("#login-button")?.addEventListener("click", requestDiscordLogin);
  $$("[data-login]").forEach(button => {
    button.addEventListener("click", requestDiscordLogin);
  });

  // Demo code form: deliberately does not activate subscriptions.
  const redeemForm = $("#redeem-form");
  const redeemMessage = $("#redeem-message");

  redeemForm?.addEventListener("submit", event => {
    event.preventDefault();

    const codeInput = $("#redeem-code");
    const code = codeInput?.value.trim() || "";

    if (!code) {
      if (redeemMessage) {
        redeemMessage.textContent = "Enter a redemption code first.";
      }
      return;
    }

    if (redeemMessage) {
      redeemMessage.textContent =
        "Demo only: this code has not been validated. Secure backend validation is required.";
    }

    showToast("Code validation will be available when the backend is connected.");
  });

  // Bot profile preview: changes stay on this page.
  $("#preview-profile")?.addEventListener("click", () => {
    const nameInput = $("#bot-display-name");
    const statusInput = $("#bot-status");
    const name = nameInput?.value.trim() || "Rex";
    const status = statusInput?.value.trim() || "Made By Goose";

    const preview = $(".profile-preview");
    if (!preview) return;

    const nameElement = $("strong", preview);
    const statusElement = $("small", preview);

    if (nameElement) nameElement.textContent = name;
    if (statusElement) statusElement.textContent = status;

    const message = $("#customize-message");
    if (message) {
      message.textContent =
        "Preview updated in this browser. The live Discord bot has not changed.";
    }

    showToast("Bot profile preview updated.");
  });

  // Tier buttons without a data-go destination
  $$("[data-tier]").forEach(button => {
    button.addEventListener("click", () => {
      showToast("Subscription details will be loaded from the backend later.");
    });
  });
});
