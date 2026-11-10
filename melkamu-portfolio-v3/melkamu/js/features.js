(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia("(pointer: fine)").matches, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const say = m => { const t = $(".toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200); };

  // 1. Name intro: letters rise in one by one
  let i = 0;
  const wrap = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) { const f = document.createDocumentFragment();
      [...c.textContent].forEach(ch => { const s = document.createElement("span"); s.className = "ch"; s.style.setProperty("--i", i++); s.textContent = ch === " " ? "\u00a0" : ch; f.append(s); });
      c.replaceWith(f); } else if (c.nodeType === 1 && c.tagName !== "BR") wrap(c);
  });
  if (!reduce) wrap($("h1"));

  // 2. 3D tilt + light glare on the profile badge
  const card = $(".profile-frame");
  if (fine && !reduce) {
    card.addEventListener("pointermove", e => { const b = card.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      card.style.setProperty("--ry", (x - .5) * 16 + "deg"); card.style.setProperty("--rx", (.5 - y) * 16 + "deg");
      card.style.setProperty("--gx", x * 100 + "%"); card.style.setProperty("--gy", y * 100 + "%"); });
    card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
    // 3. Magnetic buttons
    $$(".button-primary,.nav-contact").forEach(b => {
      b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
      b.addEventListener("pointerleave", () => b.style.transform = "");
    });
    // 4. Cursor spotlight
    const g = document.createElement("div"); g.id = "glow"; document.body.prepend(g);
    addEventListener("pointermove", e => g.style.transform = `translate(${e.clientX}px,${e.clientY}px)`, { passive: true });
  }

  // 5. Count-up stats
  const so = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; so.unobserve(e.target);
    const n = +e.target.dataset.count, t0 = performance.now();
    (function f(t) { const p = Math.min((t - t0) / 1200, 1); e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }));
  $$("[data-count]").forEach(el => so.observe(el));

  // 6. Skill category filter
  const groups = { HTML5: "Web", CSS3: "Web", JavaScript: "Web", Java: "Programming", "C++": "Programming", "SQL & Databases": "Data", "Microsoft Office": "Tools" };
  $$(".skill-card").forEach(c => c.dataset.group = groups[$("h3", c).textContent.trim()] || "Tools");
  const chips = document.createElement("div"); chips.className = "chips"; chips.setAttribute("role", "group"); chips.setAttribute("aria-label", "Filter skills");
  chips.innerHTML = ["All", "Web", "Programming", "Data", "Tools"].map((g, k) => `<button class="chip${k ? "" : " active"}" data-g="${g}">${g}</button>`).join("");
  $(".skills-grid").before(chips);
  chips.addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return;
    $$(".chip", chips).forEach(c => c.classList.toggle("active", c === b));
    $$(".skill-card").forEach(c => c.hidden = b.dataset.g !== "All" && c.dataset.group !== b.dataset.g); });

  // 7. Accent colour themes (saved)
  const accents = { Blue: ["#5a8dee", "#78a6ff"], Green: ["#22a979", "#64d6a1"], Violet: ["#8b6cf0", "#b39dff"], Orange: ["#e8833a", "#ffb074"] };
  const setAccent = n => { const [a, b] = accents[n]; document.documentElement.style.setProperty("--blue", a); document.documentElement.style.setProperty("--blue-bright", b); store.set("md-accent", n); };
  if (accents[store.get("md-accent")]) setAccent(store.get("md-accent"));

  // 8. Save contact (.vcf generated in the browser)
  const vcf = "BEGIN:VCARD\nVERSION:3.0\nFN:Melkamu Dejen\nN:Dejen;Melkamu;;;\nORG:Wollo University\nTITLE:Information System Student\nEMAIL:melkamudejen78@gmail.com\nTEL:+251984032126\nEND:VCARD";
  const saveContact = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard" })); a.download = "Melkamu-Dejen.vcf"; a.click(); URL.revokeObjectURL(a.href); say("Contact card downloaded"); };
  $(".contact-copy").insertAdjacentHTML("beforeend", '<button type="button" class="button button-primary save-contact">Save to contacts</button>');
  $(".save-contact").addEventListener("click", saveContact);

  // 9. Command palette (Ctrl/Cmd + K, or "/")
  const dlg = $("#palette"), input = $("input", dlg), list = $("ul", dlg);
  const go = id => () => { dlg.close(); $(id).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
  const cmds = [["Go to Home", "#home"], ["Go to About", "#about"], ["Go to Skills", "#skills"], ["Go to Projects", "#projects"], ["Go to Education", "#education"], ["Go to Achievements", "#achievements"], ["Go to Contact", "#contact"]].map(([t, id]) => ({ t, h: "Navigate", run: go(id) }))
    .concat([{ t: "Toggle dark / light theme", h: "Theme", run: () => { dlg.close(); $("#themeToggle").click(); } },
      { t: "Copy email address", h: "Action", run: () => { dlg.close(); navigator.clipboard.writeText("melkamudejen78@gmail.com").then(() => say("Email copied"), () => say("Copy failed")); } },
      { t: "Save contact card", h: "Action", run: () => { dlg.close(); saveContact(); } }],
      Object.keys(accents).map(n => ({ t: "Accent colour: " + n, h: "Theme", run: () => { setAccent(n); dlg.close(); } })));
  let shown = [], sel = 0;
  const render = () => { const q = input.value.toLowerCase(); shown = cmds.filter(c => c.t.toLowerCase().includes(q)); sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.innerHTML = shown.map((c, k) => `<li role="option" class="${k === sel ? "sel" : ""}" data-k="${k}">${c.t}<small>${c.h}</small></li>`).join("") || "<li><small>No matching command</small></li>"; };
  const open = () => { input.value = ""; sel = 0; render(); dlg.showModal(); input.focus(); };
  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", e => { if (e.key === "ArrowDown") { sel = (sel + 1) % shown.length; render(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = (sel - 1 + shown.length) % shown.length; render(); e.preventDefault(); }
    else if (e.key === "Enter" && shown[sel]) shown[sel].run(); });
  list.addEventListener("click", e => { const li = e.target.closest("li[data-k]"); if (li) shown[+li.dataset.k].run(); });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $(".cmd-btn").addEventListener("click", open);
  addEventListener("keydown", e => { const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) { e.preventDefault(); open(); } });
})();
