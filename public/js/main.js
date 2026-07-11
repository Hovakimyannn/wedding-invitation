/* ===========================================================
   Wedding invitation — front-end logic ("Քայլ դեպի ապագա")
   Customize CONFIG below.
   =========================================================== */

const CONFIG = {
  // Հարսանիքի ամսաթիվ ու ժամ (տեղական). Ֆորմատ: YYYY-MM-DDTHH:MM
  weddingDate: "2026-08-20T15:20",
  // Քանի լուսանկար կա public/img/gallery/ պանակում (1.jpg, 2.jpg, ...)
  galleryCount: 6,
};

/* ---------- Preloader + music start ---------- */
(function preloader() {
  const pre = document.getElementById("preloader");
  const btn = document.getElementById("openBtn");
  const music = document.getElementById("bgMusic");
  const musicCtl = document.getElementById("musicCtl");
  if (!pre || !btn) return;

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;

    // Փորձում ենք միացնել երաժշտությունը (եթե ֆայլ կա)
    if (music) {
      music.volume = 0.4;
      const p = music.play();
      if (p && p.then) p.then(showMusic).catch(() => { });
    }

    pre.classList.add("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(() => pre.remove(), 1500);
  }
  function showMusic() {
    if (musicCtl) {
      musicCtl.classList.add("is-visible");
      musicCtl.setAttribute("aria-hidden", "false");
    }
  }
  btn.addEventListener("click", open);
})();

/* ---------- Music toggle (pause / play) ---------- */
(function musicToggle() {
  const music = document.getElementById("bgMusic");
  const ctl = document.getElementById("musicCtl");
  const btn = document.getElementById("musicBtn");
  if (!music || !btn) return;

  btn.addEventListener("click", () => {
    if (music.paused) {
      music.play().catch(() => { });
      btn.textContent = "❚❚";
      ctl.classList.remove("is-paused");
    } else {
      music.pause();
      btn.textContent = "►";
      ctl.classList.add("is-paused");
    }
  });
})();

/* ---------- Wedding date label + countdown ---------- */
(function countdown() {
  const target = new Date(CONFIG.weddingDate);
  if (Number.isNaN(target.getTime())) return;

  const dateEl = document.querySelector("[data-date]");
  if (dateEl) {
    try {
      dateEl.textContent = new Intl.DateTimeFormat("hy-AM", {
        day: "numeric", month: "long", year: "numeric",
      }).format(target);
    } catch {
      dateEl.textContent = target.toLocaleDateString();
    }
  }

  const fields = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]'),
  };
  if (!fields.days) return;
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = Math.max(target.getTime() - Date.now(), 0);
    fields.days.textContent = Math.floor(diff / 86400000);
    fields.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    fields.minutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
    fields.seconds.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Map toggle ---------- */
(function mapToggle() {
  const btn = document.getElementById("mapBtn");
  const map = document.getElementById("map");
  if (!btn || !map) return;
  btn.addEventListener("click", () => map.classList.toggle("is-open"));
})();

/* ---------- Gallery (auto-fill from public/img/gallery/) ---------- */
(function gallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const count = Math.max(0, CONFIG.galleryCount | 0);
  if (count === 0) { grid.closest(".section").style.display = "none"; return; }

  for (let i = 1; i <= count; i++) {
    const fig = document.createElement("figure");
    const img = new Image();
    img.loading = "lazy";
    img.alt = "Հարսանիքի լուսանկար " + i;
    img.src = `/img/gallery/${i}.jpg`;
    img.onerror = () => { fig.innerHTML = '<div class="gallery__placeholder">❀</div>'; };
    fig.appendChild(img);
    grid.appendChild(fig);
  }
})();

/* ---------- Scroll reveal ---------- */
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
})();

/* ---------- RSVP form ---------- */
(function rsvp() {
  const form = document.getElementById("rsvpForm");
  const statusEl = document.getElementById("rsvpStatus");
  const drinksField = document.getElementById("drinksField");
  if (!form) return;

  // Թաքցնում ենք խմիչքների դաշտը, եթե հյուրը չի գալիս
  form.addEventListener("change", (e) => {
    if (e.target.name !== "attending") return;
    const notGoing = form.attending.value === "no";
    drinksField.classList.toggle("is-hidden", notGoing);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.className = "rsvp__status";
    statusEl.textContent = "Ուղարկվում է…";

    const fd = new FormData(form);
    const payload = {
      name: fd.get("name"),
      attending: fd.get("attending"),
      drinks: fd.getAll("drinks"),
      message: fd.get("message"),
    };

    if (!payload.attending) {
      statusEl.textContent = "Նշիր՝ կգաս թե ոչ";
      statusEl.classList.add("err");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Սխալ");

      statusEl.textContent = payload.attending === "no"
        ? "Շնորհակալություն պատասխանի համար 🙏"
        : "Շնորհակալություն, սպասում ենք քեզ! ❤️";
      statusEl.classList.add("ok");
      form.reset();
      drinksField.classList.remove("is-hidden");
    } catch (err) {
      statusEl.textContent = err.message || "Չհաջողվեց ուղարկել, փորձիր նորից";
      statusEl.classList.add("err");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
