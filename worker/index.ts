import { Hono } from "hono";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { signToken, verifyToken } from "./auth";

// Ported from backend/main.py (FastAPI). Same routes, same status codes,
// same SQL, and the same {"detail": "..."} error shape the frontend expects.

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Random HMAC signing secret (wrangler secret / .dev.vars) */
  AUTH_SECRET: string;
  /** JSON map of username -> password (wrangler secret / .dev.vars) */
  AUTH_USERS: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// FastAPI-style error payload
const fail = (c: Context, status: 400 | 401 | 404 | 409, detail: string) =>
  c.json({ detail }, status);

// D1 rejects `undefined` bindings — coerce missing fields to NULL
const orNull = <T>(v: T | undefined | null): T | null => v ?? null;

// ── Auth ─────────────────────────────────────────────────

const AUTH_COOKIE = "trip_auth";
const REMEMBER_MAX_AGE = 365 * 24 * 3600; // 1 year
const SESSION_MAX_AGE = 24 * 3600; // 1 day (session cookie, token-limited)

// Everything under /api requires a valid auth cookie, except /api/auth/*
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth/")) return next();
  const token = getCookie(c, AUTH_COOKIE);
  const user = token ? await verifyToken(token, c.env.AUTH_SECRET) : null;
  if (!user) return fail(c, 401, "Not authenticated");
  return next();
});

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json<{
    username: string;
    password: string;
    remember?: boolean;
  }>();
  const users = JSON.parse(c.env.AUTH_USERS) as Record<string, string>;
  const expected = users[body.username];
  if (!expected || expected !== body.password) {
    return fail(c, 401, "Invalid username or password");
  }
  const maxAge = body.remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE;
  const token = await signToken(body.username, maxAge, c.env.AUTH_SECRET);
  setCookie(c, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    // Secure cookies break plain-http local dev in some browsers
    secure: new URL(c.req.url).protocol === "https:",
    // remember → persistent cookie; otherwise browser-session cookie
    ...(body.remember ? { maxAge } : {}),
  });
  return c.json({ username: body.username });
});

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, AUTH_COOKIE, { path: "/" });
  return c.body(null, 204);
});

app.get("/api/auth/me", async (c) => {
  const token = getCookie(c, AUTH_COOKIE);
  const user = token ? await verifyToken(token, c.env.AUTH_SECRET) : null;
  if (!user) return fail(c, 401, "Not authenticated");
  return c.json({ username: user });
});

// ── Budget endpoints ─────────────────────────────────────

app.get("/api/budgets", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT category, budget_twd FROM budgets ORDER BY rowid"
  ).all();
  return c.json(results);
});

app.put("/api/budgets/:category", async (c) => {
  const category = c.req.param("category");
  const body = await c.req.json<{ budget_twd: number }>();
  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO budgets (category, budget_twd) VALUES (?, ?)"
  )
    .bind(category, body.budget_twd)
    .run();
  const row = await c.env.DB.prepare(
    "SELECT category, budget_twd FROM budgets WHERE category = ?"
  )
    .bind(category)
    .first();
  if (!row) return fail(c, 404, "Budget not found");
  return c.json(row);
});

// ── Expense endpoints ────────────────────────────────────

interface ExpenseBody {
  category: string;
  description: string;
  amount: number;
  currency: string;
  amount_twd: number;
  date: string;
}

app.get("/api/expenses", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, category, description, amount, currency, amount_twd, date FROM expenses ORDER BY date DESC, created_at DESC"
  ).all();
  return c.json(results);
});

app.post("/api/expenses", async (c) => {
  const body = await c.req.json<ExpenseBody>();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO expenses (id, category, description, amount, currency, amount_twd, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(id, body.category, body.description, body.amount, body.currency, body.amount_twd, body.date)
    .run();
  return c.json({ id, ...body }, 201);
});

app.put("/api/expenses/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<ExpenseBody>();
  await c.env.DB.prepare(
    "UPDATE expenses SET category=?, description=?, amount=?, currency=?, amount_twd=?, date=? WHERE id=?"
  )
    .bind(body.category, body.description, body.amount, body.currency, body.amount_twd, body.date, id)
    .run();
  return c.json({ id, ...body });
});

app.delete("/api/expenses/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM expenses WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, 204);
});

// ── Attraction endpoints ─────────────────────────────────

app.get("/api/attractions", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, description, location, maps_url, image_url, tag, day_label FROM attractions ORDER BY rowid"
  ).all();
  return c.json(results);
});

// ── Restaurant endpoints ─────────────────────────────────

const RESTAURANT_COLS =
  "id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels";

app.get("/api/restaurants", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${RESTAURANT_COLS} FROM restaurants ORDER BY rowid`
  ).all();
  return c.json(results);
});

app.get("/api/restaurants/by-day/:day_label", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${RESTAURANT_COLS} FROM restaurants WHERE day_labels LIKE ? ORDER BY rowid`
  )
    .bind(`%${c.req.param("day_label")}%`)
    .all();
  return c.json(results);
});

// ── My Places endpoints ─────────────────────────────────

interface PlaceBody {
  name: string;
  notes?: string | null;
  maps_url?: string | null;
  website?: string | null;
  category?: string | null;
  day_labels?: string | null;
  image_url?: string | null;
}

const PLACE_COLS = "id, name, notes, maps_url, website, category, day_labels, image_url, created_at";

app.get("/api/places", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${PLACE_COLS} FROM my_places ORDER BY created_at DESC`
  ).all();
  return c.json(results);
});

app.get("/api/places/by-day/:day_label", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${PLACE_COLS} FROM my_places WHERE day_labels LIKE ? ORDER BY created_at DESC`
  )
    .bind(`%${c.req.param("day_label")}%`)
    .all();
  return c.json(results);
});

app.post("/api/places", async (c) => {
  const body = await c.req.json<PlaceBody>();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO my_places (id, name, notes, maps_url, website, category, day_labels, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      body.name,
      orNull(body.notes),
      orNull(body.maps_url),
      orNull(body.website),
      orNull(body.category),
      orNull(body.day_labels),
      orNull(body.image_url)
    )
    .run();
  const row = await c.env.DB.prepare(`SELECT ${PLACE_COLS} FROM my_places WHERE id = ?`)
    .bind(id)
    .first();
  return c.json(row, 201);
});

app.put("/api/places/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<PlaceBody>();
  await c.env.DB.prepare(
    "UPDATE my_places SET name=?, notes=?, maps_url=?, website=?, category=?, day_labels=?, image_url=? WHERE id=?"
  )
    .bind(
      body.name,
      orNull(body.notes),
      orNull(body.maps_url),
      orNull(body.website),
      orNull(body.category),
      orNull(body.day_labels),
      orNull(body.image_url),
      id
    )
    .run();
  const row = await c.env.DB.prepare(`SELECT ${PLACE_COLS} FROM my_places WHERE id = ?`)
    .bind(id)
    .first();
  if (!row) return fail(c, 404, "Place not found");
  return c.json(row);
});

app.delete("/api/places/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM my_places WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, 204);
});

// ── Itinerary Slot endpoints ─────────────────────────────

const ACTIVITY_SLOTS = new Set(["morning", "afternoon", "evening"]);
const MEAL_SLOTS = new Set(["breakfast", "lunch", "dinner"]);

const SLOT_COLS = "id, day_number, slot_type, place_id, position, created_at";

app.get("/api/itinerary/slots", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${SLOT_COLS} FROM itinerary_slots ORDER BY day_number, position`
  ).all();
  return c.json(results);
});

app.get("/api/itinerary/slots/:day_number", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${SLOT_COLS} FROM itinerary_slots WHERE day_number = ? ORDER BY position`
  )
    .bind(Number(c.req.param("day_number")))
    .all();
  return c.json(results);
});

app.post("/api/itinerary/slots", async (c) => {
  const body = await c.req.json<{
    day_number: number;
    slot_type: string;
    place_id: string;
    position?: number;
  }>();

  if (!ACTIVITY_SLOTS.has(body.slot_type) && !MEAL_SLOTS.has(body.slot_type)) {
    return fail(c, 400, `Invalid slot_type: ${body.slot_type}`);
  }

  // Check capacity: meals hold 1 place, activity slots hold up to 3
  const countRow = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM itinerary_slots WHERE day_number = ? AND slot_type = ?"
  )
    .bind(body.day_number, body.slot_type)
    .first<{ n: number }>();
  const maxAllowed = MEAL_SLOTS.has(body.slot_type) ? 1 : 3;
  if ((countRow?.n ?? 0) >= maxAllowed) {
    return fail(c, 409, `Slot '${body.slot_type}' is full (max ${maxAllowed})`);
  }

  // Check duplicate
  const existing = await c.env.DB.prepare(
    "SELECT id FROM itinerary_slots WHERE day_number = ? AND slot_type = ? AND place_id = ?"
  )
    .bind(body.day_number, body.slot_type, body.place_id)
    .first();
  if (existing) return fail(c, 409, "Place already in this slot");

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO itinerary_slots (id, day_number, slot_type, place_id, position) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, body.day_number, body.slot_type, body.place_id, body.position ?? 0)
    .run();
  const row = await c.env.DB.prepare(`SELECT ${SLOT_COLS} FROM itinerary_slots WHERE id = ?`)
    .bind(id)
    .first();
  return c.json(row, 201);
});

app.delete("/api/itinerary/slots/:slot_id", async (c) => {
  await c.env.DB.prepare("DELETE FROM itinerary_slots WHERE id = ?")
    .bind(c.req.param("slot_id"))
    .run();
  return c.body(null, 204);
});

// ── Day customization endpoints ──────────────────────────

app.get("/api/day-customizations", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT day_number, title, image_url FROM day_customizations ORDER BY day_number"
  ).all();
  return c.json(results);
});

app.put("/api/day-customizations/:day_number", async (c) => {
  const dayNumber = Number(c.req.param("day_number"));
  const body = await c.req.json<{ title?: string | null; image_url?: string | null }>();
  await c.env.DB.prepare(
    "INSERT OR REPLACE INTO day_customizations (day_number, title, image_url) VALUES (?, ?, ?)"
  )
    .bind(dayNumber, orNull(body.title), orNull(body.image_url))
    .run();
  const row = await c.env.DB.prepare(
    "SELECT day_number, title, image_url FROM day_customizations WHERE day_number = ?"
  )
    .bind(dayNumber)
    .first();
  return c.json(row);
});

// ── Checklist endpoints ──────────────────────────────────

interface ChecklistRow {
  id: string;
  text: string;
  checked: number;
  category: string | null;
  sort_order: number;
}

app.get("/api/checklist", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, text, checked, category, sort_order FROM checklist_items ORDER BY category, sort_order"
  ).all();
  return c.json(results);
});

app.post("/api/checklist", async (c) => {
  const body = await c.req.json<{ text: string; category?: string | null; sort_order?: number }>();
  const id = crypto.randomUUID();
  const sortOrder = body.sort_order ?? 0;
  await c.env.DB.prepare(
    "INSERT INTO checklist_items (id, text, checked, category, sort_order) VALUES (?, ?, 0, ?, ?)"
  )
    .bind(id, body.text, orNull(body.category), sortOrder)
    .run();
  return c.json({ id, text: body.text, checked: 0, category: orNull(body.category), sort_order: sortOrder }, 201);
});

app.put("/api/checklist/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<Partial<Omit<ChecklistRow, "id">>>();
  const current = await c.env.DB.prepare(
    "SELECT id, text, checked, category, sort_order FROM checklist_items WHERE id = ?"
  )
    .bind(id)
    .first<ChecklistRow>();
  if (!current) return fail(c, 404, "Checklist item not found");

  // Partial update: merge only fields present in the body (mirrors FastAPI's
  // exclude-None model_dump merge)
  const merged: ChecklistRow = {
    ...current,
    ...(body.text != null ? { text: body.text } : {}),
    ...(body.checked != null ? { checked: body.checked } : {}),
    ...(body.category != null ? { category: body.category } : {}),
    ...(body.sort_order != null ? { sort_order: body.sort_order } : {}),
  };
  await c.env.DB.prepare(
    "UPDATE checklist_items SET text=?, checked=?, category=?, sort_order=? WHERE id=?"
  )
    .bind(merged.text, merged.checked, merged.category, merged.sort_order, id)
    .run();
  return c.json(merged);
});

app.delete("/api/checklist/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM checklist_items WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.body(null, 204);
});

// Unknown /api routes → FastAPI-style 404 (non-/api paths never reach the
// Worker: run_worker_first only routes /api/* here, assets handle the rest)
app.notFound((c) => fail(c, 404, "Not Found"));

export default app;
