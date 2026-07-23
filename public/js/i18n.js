/* ===========================================================
   Localization for the wedding invitation (RU / HY).

   The page markup is a Russian Tilda export. This script keeps a
   table of Armenian translations keyed by the same Tilda field ids
   (plus a few index/text based hooks for elements without an id) and
   swaps the visible text in place.

   Language is chosen as:
     1. the visitor's explicit choice  (localStorage, survives reloads)
     2. otherwise the country guessed from their IP  (GET /api/geo)
     3. otherwise the default below
   A small toggle in the corner lets the visitor switch by hand.
   =========================================================== */
(function i18n() {
  "use strict";

  var DEFAULT_LANG = "hy"; // shown when the country is unknown
  var STORE_KEY = "wi_lang";

  // --- Translations -------------------------------------------------
  // Each entry holds the exact innerHTML for both languages so that
  // switching back and forth is lossless. Numbers / phone digits stay
  // the same; only the words around them change.
  var T = {
    __title: {
      ru: 'Приглашение на свадьбу "Шаг в будущее"',
      hy: "Հարսանիքի հրավեր «Քայլ դեպի ապագա»",
    },
    // Field-id keyed text blocks (Tilda `field='...'`)
    tn_text_1717163836818: {
      ru: "Нажмите на конверт, чтобы открыть",
      hy: "Սեղմեք ծրարին՝ բացելու համար",
    },
    tn_text_1765478034777: {
      ru: "В один прекрасный день что-то случится. Сразу и на всю жизнь...",
      hy: "Մի գեղեցիկ օր ինչ-որ բան տեղի կունենա։ Միանգամից և ընդմիշտ...",
    },
    tn_text_1765478263076000001: {
      // Names + date in the hero block.
      ru: "Арутюн И Марине<br />26.08.26",
      hy: "Հարություն ԵՎ Մարինե<br />26.08.26",
    },
    tn_text_1684928557161: {
      ru: "<div style='text-align:center;'>В нашей жизни произойдет очень важное событие – наша свадьба!<br>Мы верим и надеемся, что этот день станет красивым началом<br>долгой и счастливой жизни.</div>",
      hy: "<div style='text-align:center;'>Մեր կյանքում տեղի կունենա շատ կարևոր իրադարձություն՝ մեր հարսանիքը։<br>Հավատում ենք և հույս ունենք, որ այս օրը կդառնա<br>երկար ու երջանիկ կյանքի գեղեցիկ սկիզբ։</div>",
    },
    tn_text_1768045567228000002: {
      ru: "До мероприятия осталось",
      hy: "Միջոցառմանը մնաց",
    },
    tn_text_1769686788763000001: {
      ru: "<strong></strong><strong>Если Вас отвлекает музыка, ее можно выключить</strong><strong></strong><strong></strong>",
      hy: "<strong></strong><strong>Եթե երաժշտությունը ձեզ շեղում է, կարող եք անջատել այն</strong><strong></strong><strong></strong>",
    },
    tn_text_1737672843141: {
      ru: "<strong>15:00</strong>",
      hy: "<strong>15:00</strong>",
    },
    tn_text_1737671968327: {
      ru: "<strong>Приготовьте платочки для трогательного момента</strong>",
      hy: "<strong>Պատրաստեք թաշկինակները հուզիչ պահի համար</strong>",
    },
    tn_text_1737672758687: {
      ru: "<strong>Регистрация</strong>",
      hy: "<strong>Պսակադրություն</strong>",
    },
    tn_text_1737672913664: {
      ru: "<strong>Банкет</strong>",
      hy: "<strong>Հանդիսություն</strong>",
    },
    tn_text_1737672913661: {
      ru: "<strong>Мы вместе отпразднуем первый день существования нашей новообразованной семьи.</strong>",
      hy: "<strong>Միասին կտոնենք մեր նորաստեղծ ընտանիքի առաջին օրը։</strong>",
    },
    tn_text_1737672913657: {
      ru: "<strong>17:30</strong>",
      hy: "<strong>17:30</strong>",
    },
    tn_text_1737672954011: {
      ru: "<strong>Завершение</strong>",
      hy: "<strong>Ավարտ</strong>",
    },
    tn_text_1737672954009: {
      ru: "<strong>Выражаем глубочайшую благодарность за то, что вы были с нами и превратили этот день в настоящий праздник.</strong>",
      hy: "<strong>Մեր խորին շնորհակալությունը՝ մեր կողքին լինելու և այս օրը իսկական տոնի վերածելու համար։</strong>",
    },
    tn_text_1737672954005: {
      ru: "<strong>00:00</strong>",
      hy: "<strong>00:00</strong>",
    },
    tn_text_wi_church_kind: {
      ru: "Венчание",
      hy: "Պսակադրություն",
    },
    tn_text_wi_church_name: {
      ru: "Сагмосаванк",
      hy: "Սաղմոսավանք",
    },
    tn_text_wi_church_address: {
      ru: "с. Сагмосаван",
      hy: "գ. Սաղմոսավան",
    },
    tn_text_wi_hall_kind: {
      ru: "Свадебный банкет",
      hy: "Հարսանյաց հանդիսություն",
    },
    tn_text_wi_hall_name: {
      ru: "Lazio Hall Restaurant",
      hy: "Lazio Hall Restaurant",
    },
    tn_text_wi_hall_address: {
      ru: "Котайкская область, Джрвеж 19/18",
      hy: "մ․ Կոտայք, Ջրվեժ 19/18",
    },
    tn_text_1698762045724: {
      ru: "<strong>Будем признательны, если вы поддержите цветовую гамму нашей свадьбы </strong>",
      hy: "<strong>Շնորհակալ կլինենք, եթե հետևեք մեր հարսանիքի գունային գամմային </strong>",
    },
    tn_text_1770900060235000001: {
      ru: "<strong>Милые дамы, будем благодарны, если в этот день белый цвет останется привилегией невесты.</strong>",
      hy: "<strong>Հարգելի տիկնայք, շնորհակալ կլինենք, եթե այս օրը սպիտակ գույնը մնա միայն հարսնացուի արտոնությունը։</strong>",
    },
    tn_text_1725127746074: {
      ru: "<strong>Невеста: +374 95 33 93 63</strong>",
      hy: "<strong>Հարսնացու՝ +374 95 33 93 63</strong>",
    },
    tn_text_1725127746069: {
      ru: "<strong>Жених: +374 77 76 83 13</strong>",
      hy: "<strong>Փեսա՝ +374 77 76 83 13</strong>",
    },
    // Tip bubbles — no field id, matched by order (3 of them).
    __tip_0: {
      ru: "<strong>Дорогие гости, приносите с собой веселье и радость в душе, а подарки - в конверте 😉</strong>.",
      hy: "<strong>Որպեսզի երկար չմտածեք նվերի ընտրության հարցում, մենք սիրով կընդունենք այն ծրարի տեսքով 😉</strong>",
    },
    __tip_1: {
      ru: "<strong>Мы будем очень признательны, если вы проследите за тем, чтобы дети вели себя тихо во время важных моментов свадебной церемонии 🤍</strong>",
      hy: "<strong>Շնորհակալ կլինենք հարսանիքի կարևոր պահերին երեխաների լռությունն ապահովելու համար 🤍</strong>",
    },
    __tip_2: {
      ru: "<strong>Подготовьте самые теплые пожелания для нашего важного дня 🤍</strong>",
      hy: "<strong>Պատրաստեք ձեր ամենաջերմ խոսքերն ու մաղթանքները մեր գլխավոր օրվա համար 🤍</strong>",
    },
    // "КАРТА" button — matched by its current text.
    __btn_map: {
      ru: "КАРТА",
      hy: "ՔԱՐՏԵԶ",
    },
    __site_credit: {
      ru: "Сайт подготовили мы 😉",
      hy: "Կայքը պատրաստեցինք մենք 😉",
    },
    __rsvp_deadline: {
      ru: "Просим ответить до 5 августа",
      hy: "Խնդրում ենք պատասխանել մինչև օգոստոսի 5-ը",
    },
    __partner_label: {
      ru: "Имя и фамилия вашей пары",
      hy: "Զույգի անուն-ազգանունը",
    },
    __partner_placeholder: {
      ru: "Имя и фамилия вашей пары",
      hy: "Զույգի անուն-ազգանունը",
    },
  };

  // --- RSVP form ----------------------------------------------------
  // The form is a Tilda "zero-form": its fields/options/button are
  // rendered from a JSON config at runtime, so they are not `tn_text`
  // blocks. We translate the rendered nodes by matching their current
  // text against this RU<->HY table (works in both directions).
  var FORM = [
    ["Напишите, пожалуйста, Ваши ФИО", "Խնդրում ենք նշել Ձեր անուն-ազգանունը"],
    ["Ваши ФИО", "Ձեր անուն-ազգանունը"],
    ["Сможете ли присутствовать на нашем торжестве?", "Կկարողանա՞ք ներկա գտնվել մեր տոնակատարությանը"],
    ["Я с удовольствием приду", "Հաճույքով կգամ"],
    ["Я приду со своей парой", "Կգամ զույգով"],
    ["К сожалению, не смогу присутствовать", "Ցավոք, չեմ կարողանա ներկա գտնվել"],
    ["Отправить", "Ուղարկել"],
  ];
  // text (either language) -> { ru, hy }
  var FORM_LOOKUP = {};
  FORM.forEach(function (pair) {
    var entry = { ru: pair[0], hy: pair[1] };
    FORM_LOOKUP[pair[0]] = entry;
    FORM_LOOKUP[pair[1]] = entry;
  });

  function formRoot() {
    return document.querySelector("[data-elem-type='form']");
  }

  function translateForm(lang) {
    var root = formRoot();
    if (!root) return;

    // Input placeholders
    var inputs = root.querySelectorAll("input[placeholder], textarea[placeholder]");
    for (var i = 0; i < inputs.length; i++) {
      var ph = (inputs[i].getAttribute("placeholder") || "").trim();
      if (FORM_LOOKUP[ph]) inputs[i].setAttribute("placeholder", FORM_LOOKUP[ph][lang]);
    }

    // Submit buttons rendered as <input type=submit value=...>
    var subs = root.querySelectorAll("input[type='submit']");
    for (var s = 0; s < subs.length; s++) {
      var v = (subs[s].value || "").trim();
      if (FORM_LOOKUP[v]) subs[s].value = FORM_LOOKUP[v][lang];
    }

    // Titles, radio/checkbox option labels and <button> text — replace the
    // matching text node only, so nested markup (indicators) is preserved.
    // The hidden JSON config is one big text node and never matches, so it
    // stays intact.
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node, hits = [];
    while ((node = walker.nextNode())) {
      var t = (node.nodeValue || "").trim();
      if (t && FORM_LOOKUP[t]) hits.push(node);
    }
    hits.forEach(function (n) {
      var t = n.nodeValue.trim();
      n.nodeValue = n.nodeValue.replace(t, FORM_LOOKUP[t][lang]);
    });
  }

  // Re-translate whenever Tilda (re)renders the form.
  function watchForm() {
    var root = formRoot();
    if (!root || !("MutationObserver" in window)) return;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) {
          translateForm(current);
          return;
        }
      }
    });
    mo.observe(root, { childList: true, subtree: true });
  }

  // --- Section-header images ---------------------------------------
  // The decorative section titles ("КОНТАКТЫ", "ДЕТАЛИ", ...) are SVG
  // images with the Russian word drawn as vector paths. We ship Armenian
  // versions (public/img/headers/) and swap the <img> by language.
  // Keyed by the original tildacdn folder id so the lookup is unique
  // (several share an `imgfield`, so that can't be used). Once swapped,
  // each <img> is tagged with data-wi-hdr to survive further toggles
  // and Tilda's lazy-load (which copies data-original -> src).
  var TCDN = "https://static.tildacdn.com/";
  var IMG = [
    ["tild3335-3437-4237-b033-363634396461", "/img/headers/tild3335.svg", TCDN + "tild3335-3437-4237-b033-363634396461/_.svg"],
    ["tild3930-3263-4261-b966-613130313235", "/img/headers/tild3930.svg", TCDN + "tild3930-3263-4261-b966-613130313235/_1.svg"],
    ["tild6666-3039-4432-b761-636638323532", "/img/headers/tild6666.svg", TCDN + "tild6666-3039-4432-b761-636638323532/-.svg"],
    ["tild3862-3536-4230-b930-316639376561", "/img/headers/tild3862.svg", "/img/headers/tild3862-ru.svg"],
    ["tild6230-3938-4633-b538-393238316234", "/img/headers/tild6230.svg", TCDN + "tild6230-3938-4633-b538-393238316234/_1.svg"],
    ["tild3536-6438-4131-b064-353033656562", "/img/headers/tild3536.svg", TCDN + "tild3536-6438-4131-b064-353033656562/_1.svg"],
    ["tild3933-3739-4734-a436-633664386264", "/img/headers/tild3933.svg", TCDN + "tild3933-3739-4734-a436-633664386264/-.svg"],
    ["tild3934-3731-4439-a237-306461346431", "/img/headers/tild3934.svg", TCDN + "tild3934-3731-4439-a237-306461346431/photo.svg"],
    ["tild6135-6534-4366-a462-323430316335", "/img/headers/tild6135.svg", TCDN + "tild6135-6534-4366-a462-323430316335/photo.svg"],
    ["tild3630-6163-4535-a537-653535636537", "/img/headers/tild3630.svg", "/img/headers/tild3630-ru.svg"],
    ["tild6665-3663-4163-a362-383961323137", "/img/headers/tild6665.svg", TCDN + "tild6665-3663-4163-a362-383961323137/_3.svg"],
    ["tild6534-6634-4565-a431-346264343935", "/img/headers/tild6534.svg", TCDN + "tild6534-6634-4565-a431-346264343935/_1.svg"],
    ["tild3531-6436-4363-b462-373030393463", "/img/headers/tild3531.svg", TCDN + "tild3531-6436-4363-b462-373030393463/_1.svg"],
  ];
  var IMG_BY = {};
  IMG.forEach(function (r) {
    IMG_BY[r[0]] = { hy: r[1], ru: r[2] };
  });

  function headerBasename(url) {
    if (!url) return "";
    var q = url.indexOf("?");
    if (q >= 0) url = url.slice(0, q);
    var slash = url.lastIndexOf("/");
    return slash >= 0 ? url.slice(slash + 1) : url;
  }

  function tagHeaderImages() {
    var imgs = document.querySelectorAll("img:not([data-wi-hdr])");
    for (var i = 0; i < imgs.length; i++) {
      var s = imgs[i].getAttribute("src") || "";
      var d = imgs[i].getAttribute("data-original") || "";
      var srcBase = headerBasename(s);
      var dataBase = headerBasename(d);
      // Pass 1: match by unique tildacdn folder id. Basename matching
      // must NOT run before all folder ids are checked: the remote ru
      // files share generic names ("_1.svg"), so a basename hit on the
      // wrong row would mis-tag the image.
      var folder = null;
      for (var k = 0; k < IMG.length; k++) {
        if (s.indexOf(IMG[k][0]) >= 0 || d.indexOf(IMG[k][0]) >= 0) {
          folder = IMG[k][0];
          break;
        }
      }
      // Pass 2: match by local filename (hy files and local ru files
      // have unique basenames; remote ru names are ambiguous — skip).
      if (!folder) {
        for (k = 0; k < IMG.length; k++) {
          var hyFile = headerBasename(IMG[k][1]);
          var ruFile =
            IMG[k][2].indexOf(TCDN) === 0 ? "" : headerBasename(IMG[k][2]);
          if (
            (hyFile && (srcBase === hyFile || dataBase === hyFile)) ||
            (ruFile && (srcBase === ruFile || dataBase === ruFile))
          ) {
            folder = IMG[k][0];
            break;
          }
        }
      }
      if (folder) imgs[i].setAttribute("data-wi-hdr", folder);
    }
  }

  function translateImages(lang) {
    tagHeaderImages();
    var tagged = document.querySelectorAll("[data-wi-hdr]");
    for (var i = 0; i < tagged.length; i++) {
      var row = IMG_BY[tagged[i].getAttribute("data-wi-hdr")];
      if (!row) continue;
      var url = lang === "ru" ? row.ru : row.hy;
      tagged[i].setAttribute("src", url);
      tagged[i].setAttribute("data-original", url);
    }
  }

  // --- Wedding-day heart on the calendar ---------------------------
  // The original design marks the wedding day with a separate heart image
  // overlaid on the calendar. We move that original heart onto day 26
  // (it used to sit on the old date). Position is derived from the live
  // calendar element so it stays correct at every screen size, in both
  // languages. Day-26 centre within the square calendar = (0.384, 0.786).
  //
  // Heart is re-parented inside the calendar elem so Tilda's intoview SBS
  // animation can't snap it back to the old artboard coords (which now sit
  // on top of the photo carousel above the pushed-down calendar).
  var CAL_IMGFIELD = "tn_img_1725107850060";
  var HEART_IMGFIELD = "tn_img_1725271378250";
  var DAY26_FX = 0.384;
  var DAY26_FY = 0.786;
  var HEART_PINNED = false;

  function elemOf(img) {
    return (img && (img.closest(".t396__elem") || img.parentElement)) || null;
  }

  function pinHeartToCalendar(cal, heart) {
    if (HEART_PINNED && heart.parentElement === cal) return;
    // Kill Tilda step-by-step anim so scroll-into-view can't rewrite top/left.
    [
      "data-animate-sbs-event",
      "data-animate-sbs-trg",
      "data-animate-sbs-trgofst",
      "data-animate-sbs-loop",
      "data-animate-sbs-opts",
      "data-animate-mobile"
    ].forEach(function (attr) {
      heart.removeAttribute(attr);
    });
    heart.classList.remove("t396__elem--anim-hidden");
    if (heart.parentElement !== cal) cal.appendChild(heart);
    HEART_PINNED = true;
  }

  function placeHeart() {
    var calImg = document.querySelector("img[imgfield='" + CAL_IMGFIELD + "']");
    var heartImg = document.querySelector("img[imgfield='" + HEART_IMGFIELD + "']");
    var cal = elemOf(calImg);
    var heart = elemOf(heartImg);
    // Wait until the calendar has real size — otherwise day-26 Y lands near
    // the top of the block (over the carousel) and then jumps down later.
    if (!cal || !heart || !cal.offsetWidth || cal.offsetHeight < 80) return;

    pinHeartToCalendar(cal, heart);

    var size = cal.offsetWidth * 0.135; // original heart ≈ 81 / 611
    var left = DAY26_FX * cal.offsetWidth - size / 2;
    var top = DAY26_FY * cal.offsetHeight - size / 2;
    heart.style.setProperty("position", "absolute", "important");
    heart.style.setProperty("left", left + "px", "important");
    heart.style.setProperty("top", top + "px", "important");
    heart.style.setProperty("width", size + "px", "important");
    heart.style.setProperty("height", size + "px", "important");
    heart.style.setProperty("z-index", "60", "important");
    heart.style.setProperty("transform", "none", "important");
    heart.style.setProperty("opacity", "1", "important");

    // Use the full-resolution heart instead of Tilda's 20px lazyload stub.
    var orig = heartImg.getAttribute("data-original");
    if (orig && heartImg.src !== orig) heartImg.src = orig;

    // Reveal it: the markup hides this element (display:none !important) so it
    // never flashes at its old position; we un-hide it once it's on day 26.
    heart.style.setProperty("display", "block", "important");
  }

  // --- Apply --------------------------------------------------------
  function setHTML(el, html) {
    if (el && typeof html === "string") el.innerHTML = html;
  }

  function apply(lang) {
    if (lang !== "ru" && lang !== "hy") lang = DEFAULT_LANG;

    // <title> + social meta
    document.title = T.__title[lang];
    var og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute("content", T.__title[lang]);

    // Field-id keyed blocks
    Object.keys(T).forEach(function (key) {
      if (key.indexOf("tn_") !== 0) return;
      setHTML(document.querySelector("[field='" + key + "']"), T[key][lang]);
    });

    // Tip bubbles, by order
    var tips = document.querySelectorAll(".tn-atom__tip-text");
    for (var i = 0; i < tips.length; i++) {
      if (T["__tip_" + i]) setHTML(tips[i], T["__tip_" + i][lang]);
    }

    // "КАРТА" button — find the one whose text is either language's value
    var btns = document.querySelectorAll(".tn-atom__button-text");
    for (var j = 0; j < btns.length; j++) {
      var txt = (btns[j].textContent || "").trim();
      if (txt === T.__btn_map.ru || txt === T.__btn_map.hy) {
        btns[j].textContent = T.__btn_map[lang];
      }
    }

    // Footer credit line ("Сайт подготовили мы / Կայքը պատրաստեցինք մենք")
    setHTML(document.getElementById("wi-site-credit"), T.__site_credit[lang]);

    // RSVP deadline under «ՀԱՐՑԱԹԵՐԹ»
    var deadline = document.querySelector(".wi-rsvp-deadline");
    if (deadline) deadline.textContent = T.__rsvp_deadline[lang];

    var partnerLabel = document.querySelector(".wi-partner-name-label");
    if (partnerLabel) partnerLabel.textContent = T.__partner_label[lang];
    var partnerInput = document.querySelector(".wi-partner-name-input");
    if (partnerInput) partnerInput.placeholder = T.__partner_placeholder[lang];

    translateForm(lang);
    translateImages(lang);

    document.documentElement.setAttribute("lang", lang === "hy" ? "hy" : "ru");
    updateToggle(lang);

    // Let other modules (e.g. js/countdown.js) re-render on language change.
    document.dispatchEvent(new CustomEvent("wi:lang", { detail: lang }));
    document.body.classList.add("i18n-ready");
  }

  // --- Language toggle UI ------------------------------------------
  var current = DEFAULT_LANG;

  function updateToggle(lang) {
    current = lang;
    var hy = document.getElementById("wi-lang-hy");
    var ru = document.getElementById("wi-lang-ru");
    if (hy) hy.classList.toggle("is-active", lang === "hy");
    if (ru) ru.classList.toggle("is-active", lang === "ru");
  }

  function choose(lang) {
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch (e) { }
    apply(lang);
  }

  function buildToggle() {
    var style = document.createElement("style");
    style.textContent =
      "#wi-lang{position:fixed;top:14px;left:14px;z-index:2147483000;" +
      "display:none;gap:2px;padding:3px;border-radius:999px;" +
      "background:rgba(0,0,0,.45);backdrop-filter:blur(6px);" +
      "font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25)}" +
      "#wi-lang button{cursor:pointer;border:0;border-radius:999px;" +
      "padding:5px 11px;font-size:12px;font-weight:700;letter-spacing:.04em;" +
      "color:#fff;background:transparent;line-height:1}" +
      "#wi-lang button.is-active{background:#fff;color:#111}";
    document.head.appendChild(style);

    var box = document.createElement("div");
    box.id = "wi-lang";
    box.innerHTML =
      '<button id="wi-lang-hy" type="button" aria-label="Հայերեն">ՀԱՅ</button>' +
      '<button id="wi-lang-ru" type="button" aria-label="Русский">РУС</button>';
    box.querySelector("#wi-lang-hy").addEventListener("click", function () {
      choose("hy");
    });
    box.querySelector("#wi-lang-ru").addEventListener("click", function () {
      choose("ru");
    });
    document.body.appendChild(box);
  }

  // --- Boot ---------------------------------------------------------
  function stored() {
    try {
      var v = localStorage.getItem(STORE_KEY);
      return v === "ru" || v === "hy" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function start() {
    buildToggle();
    watchForm();

    // Re-assert header images a couple of times in case Tilda's lazy-load
    // swaps src after our first pass.
    setTimeout(function () { translateImages(current); }, 800);
    setTimeout(function () { translateImages(current); }, 2500);

    // Move the wedding-day heart onto day 26 (and keep it there on resize).
    [300, 900, 2000].forEach(function (t) { setTimeout(placeHeart, t); });
    window.addEventListener("resize", placeHeart);
    window.addEventListener("load", placeHeart);

    // Tilda's t396 can MOVE the calendar block after load (late images shift
    // the artboard) without changing its size, so neither the ResizeObserver
    // nor the load hooks fire and the heart is left on the wrong day. A slow
    // watchdog keeps it pinned to day 26.
    setInterval(placeHeart, 800);

    // The calendar image settles its height after it loads; re-place the heart
    // then (and on any later size change) so it stays centred on day 26 instead
    // of being positioned against a stale, smaller height.
    var calImg = document.querySelector("img[imgfield='" + CAL_IMGFIELD + "']");
    if (calImg) {
      calImg.addEventListener("load", placeHeart);
      var calEl = elemOf(calImg);
      if (calEl && "ResizeObserver" in window) {
        new ResizeObserver(function () { placeHeart(); }).observe(calEl);
      }
    }

    var saved = stored();
    if (saved) {
      apply(saved); // explicit choice wins, no geo lookup needed
      return;
    }

    // Show the default immediately, then refine from the visitor's country.
    apply(DEFAULT_LANG);
    fetch("/api/geo")
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (data && data.lang && !stored()) apply(data.lang);
      })
      .catch(function () { });
  }

  // Execute immediately since the script is placed at the bottom of the body.
  // This prevents waiting for deferred Tilda scripts to download before showing the page.
  start();
})();
