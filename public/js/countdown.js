/* ===========================================================
   Self-hosted wedding countdown.

   Replaces the external megatimer.ru timer that shipped with the
   Tilda template (that timer belonged to the template owner's
   account and counted to the wrong date, and could not be
   reconfigured from here).

   Counts down to the ceremony. Labels follow the page language
   (RU / HY) chosen by js/i18n.js — they share the 'wi_lang' key
   and react to its 'wi:lang' event.
   =========================================================== */
(function countdown() {
  "use strict";

  // 26.08.2026, 15:20 Moscow time (UTC+3) == 12:20 UTC.
  // Stored as a fixed instant so it is correct in any viewer timezone.
  var TARGET = Date.UTC(2026, 7, 26, 12, 20, 0);
  var STORE_KEY = "wi_lang";

  // Armenian labels are count-invariant; Russian needs plural forms.
  var HY = ["օր", "ժամ", "րոպե", "վայրկյան"];
  var RU = {
    d: ["день", "дня", "дней"],
    h: ["час", "часа", "часов"],
    m: ["минута", "минуты", "минут"],
    s: ["секунда", "секунды", "секунд"],
  };
  var HY_IDX = { d: 0, h: 1, m: 2, s: 3 };

  function ruPlural(n, forms) {
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }

  function lang() {
    try {
      return localStorage.getItem(STORE_KEY) === "ru" ? "ru" : "hy";
    } catch (e) {
      return "hy";
    }
  }

  function labelFor(unit, n, lng) {
    return lng === "ru" ? ruPlural(n, RU[unit]) : HY[HY_IDX[unit]];
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  var nums = {};
  var labs = {};

  function sep() {
    var s = document.createElement("span");
    s.className = "wi-cd__s";
    s.textContent = ":";
    return s;
  }

  function build() {
    var root = document.getElementById("wi-countdown");
    if (!root) return false;

    // Match the original template timer's typeface (Exo 2, latin+cyrillic).
    // Armenian labels fall back to the system Armenian font.
    var font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css?family=Exo+2&subset=latin,cyrillic";
    document.head.appendChild(font);

    var style = document.createElement("style");
    style.textContent =
      "#wi-countdown{display:flex;justify-content:center;align-items:flex-start;" +
        "gap:6px;font-family:'Exo 2',Arial,Helvetica,sans-serif;color:#000;line-height:1}" +
      "#wi-countdown .wi-cd__g{display:flex;flex-direction:column;align-items:center;min-width:54px}" +
      "#wi-countdown .wi-cd__n{font-size:35px;font-weight:400}" +
      "#wi-countdown .wi-cd__l{font-size:12px;margin-top:5px}" +
      "#wi-countdown .wi-cd__s{font-size:35px;line-height:1}";
    document.head.appendChild(style);

    ["d", "h", "m", "s"].forEach(function (u, i) {
      if (i) root.appendChild(sep());
      var g = document.createElement("div");
      g.className = "wi-cd__g";
      var n = document.createElement("span");
      n.className = "wi-cd__n";
      n.textContent = "00";
      var l = document.createElement("span");
      l.className = "wi-cd__l";
      g.appendChild(n);
      g.appendChild(l);
      root.appendChild(g);
      nums[u] = n;
      labs[u] = l;
    });
    return true;
  }

  function tick() {
    var diff = Math.max(TARGET - Date.now(), 0);
    var vals = {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
    var lng = lang();
    ["d", "h", "m", "s"].forEach(function (u) {
      nums[u].textContent = u === "d" ? String(vals[u]) : pad(vals[u]);
      labs[u].textContent = labelFor(u, vals[u], lng);
    });
  }

  function start() {
    if (!build()) return;
    tick();
    setInterval(tick, 1000);
    document.addEventListener("wi:lang", tick); // re-label instantly on toggle
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
