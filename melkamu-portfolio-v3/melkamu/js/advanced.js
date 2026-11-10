(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Scroll progress + back-to-top
  const bar = $("#progress"), top = $(".to-top");
  addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    top.classList.toggle("show", h.scrollTop > 700);
  }, { passive: true });
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // Typed role text
  const roles = ["Information System Student", "Web Developer in Progress", "Problem Solver", "Lifelong Learner"];
  const out = $("#typed");
  if (reduce) out.textContent = roles[0];
  else {
    let r = 0, c = 0, del = false;
    (function tick() {
      const w = roles[r];
      out.textContent = w.slice(0, c += del ? -1 : 1);
      let t = del ? 40 : 85;
      if (!del && c === w.length) { del = true; t = 1500; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; t = 350; }
      setTimeout(tick, t);
    })();
  }

  // Hero particle network that reacts to the mouse
  const cv = $("#net"), ctx = cv.getContext("2d"), hero = $("#home");
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const size = () => {
    W = cv.width = hero.offsetWidth; H = cv.height = hero.offsetHeight;
    pts = Array.from({ length: Math.min(70, W / 18) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  };
  size(); addEventListener("resize", size);
  hero.addEventListener("pointermove", e => { const b = hero.getBoundingClientRect(); mouse = { x: e.clientX - b.left, y: e.clientY - b.top }; });
  hero.addEventListener("pointerleave", () => mouse = { x: -999, y: -999 });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = "rgba(120,166,255,.7)"; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 7); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) { ctx.strokeStyle = `rgba(120,166,255,${.22 * (1 - d / 120)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const m = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (m < 160) { ctx.strokeStyle = `rgba(100,214,161,${.5 * (1 - m / 160)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  })();

  // Active nav link, skill meters, reveal on scroll
  const links = $$(".nav-links a[href^='#']");
  const navObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => navObs.observe(s));

  $$(".skill-card").forEach((card, n) => {
    const lv = +card.dataset.level || 2;
    card.insertAdjacentHTML("beforeend", '<div class="level" aria-label="Level ' + lv + ' of 4">' +
      [1, 2, 3, 4].map(k => '<i class="' + (k <= lv ? "on" : "") + '" style="--d:' + k * .12 + 's"></i>').join("") + "</div>");
  });
  const seen = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("seen", "in"); seen.unobserve(e.target); }
  }), { threshold: .3 });
  $$(".skill-card").forEach(c => { c.classList.add("reveal"); seen.observe(c); });
  $$(".timeline-item,.achievement-copy,.contact-form").forEach(c => { c.classList.add("reveal"); seen.observe(c); });

  // Project details popup
  const dlg = $("#projectModal");
  $$(".project-card").forEach(card => {
    card.tabIndex = 0;
    card.querySelector(".project-info").insertAdjacentHTML("beforeend", '<span class="project-hint">View details</span>');
    const open = () => {
      $("#modalTitle").textContent = $("h3", card).textContent;
      $("#modalTags").textContent = $$(".project-tags span", card).map(t => t.textContent).join(", ");
      dlg.showModal();
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest(".modal-close")) dlg.close(); });

  // Copy email + toast
  const toast = $(".toast");
  const say = m => { toast.textContent = m; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2200); };
  const mail = $(".contact-detail[href^='mailto']");
  mail.insertAdjacentHTML("beforeend", '<button type="button" class="copy-btn">Copy</button>');
  $(".copy-btn", mail).addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(mail.getAttribute("href").slice(7)).then(() => say("Email copied"), () => say("Copy failed"));
  });
})();
