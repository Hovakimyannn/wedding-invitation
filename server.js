const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const RSVP_FILE = path.join(DATA_DIR, "rsvps.json");
const SEATING_FILE = path.join(DATA_DIR, "seating.json");

// Make sure the data store exists before we start serving requests.
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RSVP_FILE)) fs.writeFileSync(RSVP_FILE, "[]", "utf8");
if (!fs.existsSync(SEATING_FILE)) fs.writeFileSync(SEATING_FILE, "[]", "utf8");

app.set("trust proxy", true);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Guess the visitor's language from the country of their IP address.
// Russia -> Russian, Armenia -> Armenian, everything else -> default.
// The front-end (public/js/i18n.js) calls this once on first visit;
// an explicit manual choice is remembered client-side and skips it.
const DEFAULT_LANG = "hy";
const geoCache = new Map(); // ip -> { lang, at }
const GEO_TTL_MS = 24 * 60 * 60 * 1000;

function langForCountry(code) {
  if (code === "RU") return "ru";
  if (code === "AM") return "hy";
  return DEFAULT_LANG;
}

function clientIp(req) {
  const fwd = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = fwd || req.socket.remoteAddress || "";
  return ip.replace(/^::ffff:/, ""); // unwrap IPv4-mapped IPv6
}

function isPrivateIp(ip) {
  return (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

app.get("/api/geo", async (req, res) => {
  const ip = clientIp(req);
  if (isPrivateIp(ip)) return res.json({ lang: DEFAULT_LANG });

  const hit = geoCache.get(ip);
  if (hit && Date.now() - hit.at < GEO_TTL_MS) {
    return res.json({ lang: hit.lang });
  }

  try {
    const r = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`,
      { signal: AbortSignal.timeout(2500) }
    );
    const data = await r.json();
    const lang =
      data && data.status === "success"
        ? langForCountry(data.countryCode)
        : DEFAULT_LANG;
    geoCache.set(ip, { lang, at: Date.now() });
    res.json({ lang });
  } catch {
    res.json({ lang: DEFAULT_LANG }); // never block the page on geo lookup
  }
});

// Serialize writes so two RSVPs submitted at the same time can't clobber
// each other's data in the JSON file.
let writeQueue = Promise.resolve();

async function readRsvps() {
  const raw = await fsp.readFile(RSVP_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mutateRsvps(fn) {
  const run = writeQueue.then(async () => {
    const list = await readRsvps();
    const next = fn(list);
    await fsp.writeFile(RSVP_FILE, JSON.stringify(next, null, 2), "utf8");
    return next;
  });
  writeQueue = run.catch(() => { }); // keep the queue alive after a failure
  return run;
}

function appendRsvp(entry) {
  return mutateRsvps((list) => {
    list.push(entry);
    return list;
  });
}

// Save a guest's RSVP.
app.post("/api/rsvp", async (req, res) => {
  const { name, attending, guests, guestNames, message, drinks } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Անունը պարտադիր է" });
  }
  const ATTENDING = ["yes", "pair", "no", "later"];
  if (!ATTENDING.includes(attending)) {
    return res.status(400).json({ ok: false, error: "Խնդրում ենք նշել՝ կգա՞ք, թե՞ ոչ" });
  }

  const guestCountRaw = guests == null || guests === "" ? 0 : Number.parseInt(guests, 10);
  const guestCount = Number.isFinite(guestCountRaw) ? guestCountRaw : 0;
  if (guestCount < 0 || guestCount > 20) {
    return res.status(400).json({ ok: false, error: "Հյուրերի քանակը պետք է լինի 0-ից 20 միջակայքում" });
  }

  const normalizedGuestNames = Array.isArray(guestNames)
    ? guestNames
      .filter((n) => typeof n === "string")
      .map((n) => n.trim().slice(0, 120))
      .filter(Boolean)
    : [];
  if (normalizedGuestNames.length !== guestCount) {
    return res.status(400).json({ ok: false, error: "Լրացրեք բոլոր հյուրերի անուն-ազգանունները" });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim().slice(0, 120),
    attending,
    guests: guestCount,
    guestNames: normalizedGuestNames,
    message: typeof message === "string" ? message.trim().slice(0, 500) : "",
    drinks: Array.isArray(drinks)
      ? drinks.filter((d) => typeof d === "string").map((d) => d.slice(0, 40)).slice(0, 10)
      : [],
    createdAt: new Date().toISOString(),
  };

  try {
    await appendRsvp(entry);
    res.json({ ok: true, entry });
  } catch (err) {
    console.error("Failed to save RSVP:", err);
    res.status(500).json({ ok: false, error: "Չհաջողվեց պահպանել, խնդրում ենք փորձել կրկին" });
  }
});

// --- Admin panel (for the couple) ---------------------------------
// Everything under /admin is protected with HTTP Basic auth.
const ADMIN_USER = process.env.ADMIN_USER || "harut";
const ADMIN_PASS = process.env.ADMIN_PASS || "Kdyou4===";

function timingSafeEq(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function basicAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [user, ...rest] = Buffer.from(encoded, "base64").toString().split(":");
    const pass = rest.join(":"); // the password itself may contain ':'... or '='
    if (timingSafeEq(user, ADMIN_USER) && timingSafeEq(pass, ADMIN_PASS)) {
      return next();
    }
  }
  res.set("WWW-Authenticate", 'Basic realm="Wedding admin", charset="UTF-8"');
  res.status(401).send("Authentication required");
}

// The RSVP list is embedded straight into the page, so the panel needs no
// second authenticated request (which some browsers handle inconsistently
// with Basic auth). "Refresh" in the UI simply reloads the page.
// Edit a guest's answer from the panel.
app.put("/admin/api/rsvps/:id", basicAuth, async (req, res) => {
  const { name, attending } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Անունը պարտադիր է" });
  }
  if (!["yes", "pair", "no", "later"].includes(attending)) {
    return res.status(400).json({ ok: false, error: "Սխալ ներկայության արժեք" });
  }
  try {
    let found = false;
    await mutateRsvps((list) =>
      list.map((r) => {
        if (r.id !== req.params.id) return r;
        found = true;
        return { ...r, name: name.trim().slice(0, 120), attending };
      })
    );
    if (!found) return res.status(404).json({ ok: false, error: "Չի գտնվել" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to edit RSVP:", err);
    res.status(500).json({ ok: false, error: "Չհաջողվեց պահպանել" });
  }
});

// Delete a guest's answer from the panel.
app.delete("/admin/api/rsvps/:id", basicAuth, async (req, res) => {
  try {
    let found = false;
    await mutateRsvps((list) => {
      const next = list.filter((r) => r.id !== req.params.id);
      found = next.length !== list.length;
      return next;
    });
    if (!found) return res.status(404).json({ ok: false, error: "Չի գտնվել" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete RSVP:", err);
    res.status(500).json({ ok: false, error: "Չհաջողվեց ջնջել" });
  }
});

// --- Seating chart --------------------------------------------------

async function readSeating() {
  const raw = await fsp.readFile(SEATING_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let seatingWriteQueue = Promise.resolve();
function mutateSeating(fn) {
  const run = seatingWriteQueue.then(async () => {
    const list = await readSeating();
    const next = fn(list);
    await fsp.writeFile(SEATING_FILE, JSON.stringify(next, null, 2), "utf8");
    return next;
  });
  seatingWriteQueue = run.catch(() => { });
  return run;
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// GET /admin/api/seating — return tables + rsvp entries merged
app.get("/admin/api/seating", basicAuth, async (req, res) => {
  try {
    const [tables, rsvps] = await Promise.all([readSeating(), readRsvps()]);
    res.json({ ok: true, tables, rsvps });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /admin/api/tables — create a table
app.post("/admin/api/tables", basicAuth, async (req, res) => {
  const { name, capacity, shape } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Անունը պարտադիր է" });
  }
  const cap = Math.min(Math.max(Number.parseInt(capacity, 10) || 8, 1), 50);
  const table = {
    id: makeId(),
    name: name.trim().slice(0, 60),
    capacity: cap,
    shape: shape === "rect" ? "rect" : "round",
    seats: Array.from({ length: cap }, (_, i) => ({ pos: i + 1, guestId: null })),
  };
  try {
    await mutateSeating((list) => { list.push(table); return list; });
    res.json({ ok: true, table });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /admin/api/tables/:id — rename / resize a table
app.put("/admin/api/tables/:id", basicAuth, async (req, res) => {
  const { name, capacity, shape } = req.body || {};
  const cap = capacity != null ? Math.min(Math.max(Number.parseInt(capacity, 10) || 1, 1), 50) : null;
  try {
    let found = false;
    await mutateSeating((list) =>
      list.map((t) => {
        if (t.id !== req.params.id) return t;
        found = true;
        const newCap = cap ?? t.capacity;
        // trim or expand seats array
        let seats = t.seats.slice(0, newCap);
        while (seats.length < newCap) seats.push({ pos: seats.length + 1, guestId: null });
        // re-number positions
        seats = seats.map((s, i) => ({ ...s, pos: i + 1 }));
        const newShape = shape === "round" || shape === "rect" ? shape : t.shape || "round";
        return { ...t, name: name ? name.trim().slice(0, 60) : t.name, capacity: newCap, shape: newShape, seats };
      })
    );
    if (!found) return res.status(404).json({ ok: false, error: "Չի գտնվել" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /admin/api/tables/:id
app.delete("/admin/api/tables/:id", basicAuth, async (req, res) => {
  try {
    let found = false;
    await mutateSeating((list) => {
      const next = list.filter((t) => t.id !== req.params.id);
      found = next.length !== list.length;
      return next;
    });
    if (!found) return res.status(404).json({ ok: false, error: "Չի գտնվել" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /admin/api/seating/assign — {guestId, tableId, pos} or {guestId:null} to clear
app.put("/admin/api/seating/assign", basicAuth, async (req, res) => {
  const { guestId, tableId, pos } = req.body || {};
  try {
    await mutateSeating((list) => {
      // First clear this guest from any existing seat
      list.forEach((t) => {
        t.seats.forEach((s) => {
          if (s.guestId === guestId) s.guestId = null;
        });
      });
      // Then assign (if tableId given)
      if (tableId && pos != null) {
        const table = list.find((t) => t.id === tableId);
        if (table) {
          const seat = table.seats.find((s) => s.pos === pos);
          if (seat) seat.guestId = guestId || null;
        }
      }
      return list;
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Admin HTML page ------------------------------------------------

app.get("/admin", basicAuth, async (req, res) => {
  try {
    const [html, list] = await Promise.all([
      fsp.readFile(path.join(__dirname, "admin.html"), "utf8"),
      readRsvps(),
    ]);
    // <-escape so a "</script>" inside a guest's text can't break out.
    const json = JSON.stringify(list).replace(/</g, "\\u003c");
    res.type("html").send(html.replace("/*__RSVPS__*/[]", json));
  } catch (err) {
    console.error("Failed to render admin page:", err);
    res.status(500).send("Admin page failed to load");
  }
});

app.listen(PORT, () => {
  console.log(`💍  Wedding invitation running at http://localhost:${PORT}`);
});

