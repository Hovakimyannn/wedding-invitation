const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const RSVP_FILE = path.join(DATA_DIR, "rsvps.json");

// Make sure the data store exists before we start serving requests.
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RSVP_FILE)) fs.writeFileSync(RSVP_FILE, "[]", "utf8");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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

function appendRsvp(entry) {
  writeQueue = writeQueue.then(async () => {
    const list = await readRsvps();
    list.push(entry);
    await fsp.writeFile(RSVP_FILE, JSON.stringify(list, null, 2), "utf8");
  });
  return writeQueue;
}

// Save a guest's RSVP.
app.post("/api/rsvp", async (req, res) => {
  const { name, attending, guests, message, drinks } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ ok: false, error: "Անունը պարտադիր է" });
  }
  const ATTENDING = ["yes", "pair", "no", "later"];
  if (!ATTENDING.includes(attending)) {
    return res.status(400).json({ ok: false, error: "Նշիր՝ կգաս թե ոչ" });
  }

  const guestCount = Number.parseInt(guests, 10);

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim().slice(0, 120),
    attending,
    guests: Number.isFinite(guestCount) ? Math.min(Math.max(guestCount, 0), 20) : 0,
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
    res.status(500).json({ ok: false, error: "Չհաջողվեց պահպանել, փորձիր նորից" });
  }
});

// Simple guarded list of all RSVPs (for the couple).
// Open it as /api/rsvps?key=YOUR_KEY — set ADMIN_KEY env var to enable.
app.get("/api/rsvps", async (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.query.key !== adminKey) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }
  try {
    const list = await readRsvps();
    const going = list.filter((r) => r.attending === "yes");
    const totalGuests = going.reduce((sum, r) => sum + 1 + (r.guests || 0), 0);
    res.json({ ok: true, count: list.length, totalGuests, rsvps: list });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Read failed" });
  }
});

app.listen(PORT, () => {
  console.log(`💍  Wedding invitation running at http://localhost:${PORT}`);
});
