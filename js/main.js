(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  // Preview clip on the rigging card: plays on hover, or while on screen for touch devices
  document.querySelectorAll("[data-preview]").forEach((card) => {
    const video = card.querySelector("video");
    if (!video || reduceMotion) return;
    const play = () => { video.play().catch(() => {}); };
    const stop = () => { video.pause(); };
    if (canHover) {
      card.addEventListener("mouseenter", play);
      card.addEventListener("mouseleave", stop);
      card.addEventListener("focus", play);
      card.addEventListener("blur", stop);
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? play() : stop()));
      }, { threshold: 0.6 }).observe(video);
    }
  });

  // Render / map switcher on the props page
  document.querySelectorAll("[data-passes]").forEach((viewer) => {
    const stage = viewer.querySelector(".passes-stage");
    const tabs = [...viewer.querySelectorAll("[role=tab]")];
    const imgs = [...stage.querySelectorAll("img")];
    const select = (i) => {
      tabs.forEach((tab, j) => {
        tab.setAttribute("aria-selected", String(i === j));
        tab.tabIndex = i === j ? 0 : -1;
      });
      imgs.forEach((img, j) => {
        img.classList.toggle("is-active", i === j);
        img.setAttribute("aria-hidden", String(i !== j));
      });
      stage.setAttribute("aria-labelledby", tabs[i].id);
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(next);
        tabs[next].focus();
      });
    });
  });

  // Copy email address
  document.querySelectorAll("[data-copy]").forEach((button) => {
    const label = button.textContent;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "Copied";
      } catch {
        window.location.href = "mailto:" + button.dataset.copy;
        return;
      }
      setTimeout(() => { button.textContent = label; }, 2000);
    });
  });

  // Lightbox for gallery images
  const links = [...document.querySelectorAll("a[data-lightbox]")];
  if (links.length) {
    const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    box.innerHTML = `
      <span class="lb-count" aria-live="polite"></span>
      <img alt="">
      <p class="lb-caption"></p>
      <button class="lb-close" type="button" aria-label="Close">${icon("M18 6 6 18M6 6l12 12")}</button>
      <button class="lb-prev" type="button" aria-label="Previous image">${icon("m15 18-6-6 6-6")}</button>
      <button class="lb-next" type="button" aria-label="Next image">${icon("m9 18 6-6-6-6")}</button>`;
    document.body.appendChild(box);

    const img = box.querySelector("img");
    const caption = box.querySelector(".lb-caption");
    const count = box.querySelector(".lb-count");
    const closeBtn = box.querySelector(".lb-close");
    const prevBtn = box.querySelector(".lb-prev");
    const nextBtn = box.querySelector(".lb-next");
    let group = [];
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const link = group[index];
      const thumb = link.querySelector("img");
      img.src = link.href;
      img.alt = thumb ? thumb.alt : "";
      caption.textContent = link.dataset.caption || "";
      count.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : "";
      prevBtn.hidden = nextBtn.hidden = group.length < 2;
      // Warm the neighbours so arrowing through is instant
      [index - 1, index + 1].forEach((n) => {
        const l = group[(n + group.length) % group.length];
        if (l) new Image().src = l.href;
      });
    };
    const open = (link) => {
      opener = link;
      group = links.filter((l) => l.dataset.lightbox === link.dataset.lightbox);
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      show(group.indexOf(link));
      closeBtn.focus();
    };
    const close = () => {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      img.removeAttribute("src");
      if (opener) opener.focus();
    };

    links.forEach((link) => link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(link);
    }));
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => show(index - 1));
    nextBtn.addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        const focusables = [...box.querySelectorAll("button:not([hidden])")];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    let touchX = null;
    box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50 && group.length > 1) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
