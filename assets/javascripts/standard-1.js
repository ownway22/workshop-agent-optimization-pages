(() => {
  "use strict";

  function keyboardButton(label, afterActivate) {
    label.setAttribute("role", "button");
    label.tabIndex = 0;
    label.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        label.click();
        afterActivate();
      }
    });
    label.addEventListener("keyup", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      // Material also observes keyboard events; one handled key must activate once.
      event.preventDefault();
      event.stopPropagation();
    });
  }

  function initialize() {
    const logo = document.querySelector('.md-header [data-md-component="logo"]');
    const title = document.querySelector('[data-md-component="header-title"]');
    if (!(logo instanceof HTMLAnchorElement) || !title) {
      console.error("standard-1: 找不到頁首圖示或標題，無法建立首頁連結。");
    } else {
      const homeLink = document.createElement("a");
      homeLink.className = "travel-home-link";
      homeLink.href = logo.href;
      homeLink.title = "回到首頁";
      homeLink.setAttribute("aria-label", "回到首頁");
      homeLink.append(...title.childNodes);
      title.append(homeLink);
    }

    const palette = document.querySelector('[data-md-component="palette"]');
    const search = document.querySelector(".md-header__inner > .md-search");
    if (!palette || !search) {
      console.error("standard-1: 找不到頁首的搜尋或色彩控制項。");
    } else {
      search.after(palette);
    }

    const searchInput = document.querySelector(".md-search__input");
    if (!(searchInput instanceof HTMLInputElement)) {
      console.error("standard-1: 找不到教材搜尋輸入欄位。");
    } else {
      searchInput.title = "搜尋教材";
    }

    if (document.querySelector(".glightbox")) {
      if (typeof lightbox === "undefined") {
        console.error("standard-1: 找不到圖片檢視器，無法設定中文控制項。");
      } else {
        lightbox.on("open", () => {
          for (const [selector, name] of [
            [".gclose", "關閉"],
            [".gprev", "上一張"],
            [".gnext", "下一張"],
          ]) {
            const button = document.querySelector(`.glightbox-container ${selector}`);
            if (!(button instanceof HTMLButtonElement)) {
              console.error(`standard-1: 找不到圖片檢視器控制項 ${selector}。`);
              continue;
            }
            button.title = name;
            button.setAttribute("aria-label", name);
          }
        });
      }
    }

    const controls = [];
    for (const [id, selector, targetSelector, panelId, openName, closeName] of [
      ["__drawer", 'label.md-icon[for="__drawer"]', ".md-nav--primary",
        "workshop-navigation", "開啟導覽選單", "關閉導覽選單"],
      ["__search", 'label.md-icon[for="__search"]', ".md-search",
        "workshop-search-panel", "搜尋教材", "關閉搜尋"],
    ]) {
      const input = document.getElementById(id);
      const panel = document.querySelector(targetSelector);
      const labels = document.querySelectorAll(selector);
      if (!(input instanceof HTMLInputElement) || !panel || !labels.length) {
        console.error(`standard-1: 找不到 ${id} 導覽控制項。`);
        continue;
      }
      panel.id = panel.id || panelId;
      for (const label of labels) {
        const sync = () => {
          const name = input.checked ? closeName : openName;
          label.setAttribute("aria-expanded", String(input.checked));
          label.setAttribute("aria-label", name);
          label.title = name;
        };
        label.setAttribute("aria-controls", panel.id);
        keyboardButton(label, () => queueMicrotask(sync));
        controls.push(sync);
      }
    }

    for (const label of document.querySelectorAll(
      '[data-md-component="palette"] label[for]'
    )) {
      const input = document.getElementById(label.htmlFor);
      const name = label.title || input?.getAttribute("aria-label");
      if (!(input instanceof HTMLInputElement) || !name) {
        console.error("standard-1: 色彩控制項缺少對應選項或可讀名稱。");
        continue;
      }
      label.setAttribute("aria-label", name);
      keyboardButton(label, () => {
        queueMicrotask(() => {
          const next = Array.from(document.querySelectorAll(
            '[data-md-component="palette"] label[role="button"]'
          )).find((candidate) => candidate.getClientRects().length > 0);
          if (next) next.focus({ preventScroll: true });
        });
      });
    }

    const syncControls = () => controls.forEach((sync) => sync());
    document.addEventListener("change", syncControls);
    document.addEventListener("focusin", () => queueMicrotask(syncControls));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") queueMicrotask(syncControls);
    });
    document.addEventListener("keyup", (event) => {
      if (event.key === "Escape") queueMicrotask(syncControls);
    });
    syncControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
