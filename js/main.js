(() => {
  document.documentElement.classList.remove("no-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Hover-to-play preview clips on project cards
  document.querySelectorAll("[data-hover-video]").forEach((card) => {
    const video = card.querySelector("video");
    if (!video || reduceMotion) return;
    const play = () => { video.play().catch(() => {}); };
    const stop = () => { video.pause(); };
    card.addEventListener("mouseenter", play);
    card.addEventListener("focus", play);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("blur", stop);
  });

  // Render / texture-pass switchers
  document.querySelectorAll("[data-passes]").forEach((viewer) => {
    const tabs = [...viewer.querySelectorAll("[role=tab]")];
    const imgs = [...viewer.querySelectorAll(".passes-stage img")];
    const select = (i) => {
      tabs.forEach((t, j) => {
        t.setAttribute("aria-selected", String(i === j));
        t.tabIndex = i === j ? 0 : -1;
      });
      imgs.forEach((img, j) => {
        img.classList.toggle("is-active", i === j);
        if (i === j && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i));
      tab.addEventListener("keydown", (e) => {
        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = (i + step + tabs.length) % tabs.length;
        select(next);
        tabs[next].focus();
      });
    });
    // Warm the cache for the other passes once the viewer is near the viewport
    if ("IntersectionObserver" in window) {
      const warm = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        imgs.forEach((img) => { if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } });
        warm.disconnect();
      }, { rootMargin: "400px" });
      warm.observe(viewer);
    }
  });

  // Lightbox
  const links = [...document.querySelectorAll("a[data-lightbox]")];
  if (links.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    box.innerHTML = `
      <span class="lb-count" aria-live="polite"></span>
      <img alt="">
      <p class="lightbox-caption"></p>
      <button class="lb-close" type="button" aria-label="Close">${icon("M18 6 6 18M6 6l12 12")}</button>
      <button class="lb-prev" type="button" aria-label="Previous image">${icon("m15 18-6-6 6-6")}</button>
      <button class="lb-next" type="button" aria-label="Next image">${icon("m9 18 6-6-6-6")}</button>`;
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const caption = box.querySelector(".lightbox-caption");
    const count = box.querySelector(".lb-count");
    const btnPrev = box.querySelector(".lb-prev");
    const btnNext = box.querySelector(".lb-next");
    let group = [];
    let index = 0;
    let opener = null;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const link = group[index];
      const thumb = link.querySelector("img");
      img.src = link.href;
      img.alt = thumb ? thumb.alt : "";
      caption.textContent = link.dataset.caption || (thumb ? thumb.alt : "");
      count.textContent = group.length > 1 ? `${index + 1} / ${group.length}` : "";
      btnPrev.hidden = btnNext.hidden = group.length < 2;
      [group[index - 1], group[index + 1]].forEach((l) => { if (l) new Image().src = l.href; });
    };
    const open = (link) => {
      opener = link;
      group = links.filter((l) => l.dataset.lightbox === link.dataset.lightbox);
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      show(group.indexOf(link));
      box.querySelector(".lb-close").focus();
    };
    const close = () => {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      img.removeAttribute("src");
      if (opener) opener.focus();
    };

    links.forEach((link) => link.addEventListener("click", (e) => { e.preventDefault(); open(link); }));
    box.querySelector(".lb-close").addEventListener("click", close);
    btnPrev.addEventListener("click", () => show(index - 1));
    btnNext.addEventListener("click", () => show(index + 1));
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "Tab") {
        const focusables = [...box.querySelectorAll("button:not([hidden])")];
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    let touchX = null;
    box.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
