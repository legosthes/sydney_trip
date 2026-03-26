// @ts-expect-error — asm build has no separate types
import initSqlJs from "sql.js/dist/sql-asm.js";
import type { Database } from "sql.js";

const DB_NAME = "sydney-trip-budget";
const DB_STORE = "sqliteDb";

let db: Database | null = null;
let dbReady: Promise<Database> | null = null;

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => {
      const tx = request.result.transaction(DB_STORE, "readonly");
      const store = tx.objectStore(DB_STORE);
      const get = store.get("db");
      get.onsuccess = () => resolve(get.result ?? null);
      get.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}

function saveToIndexedDB(data: Uint8Array): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => {
      const tx = request.result.transaction(DB_STORE, "readwrite");
      const store = tx.objectStore(DB_STORE);
      store.put(data, "db");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

async function initDb(): Promise<Database> {
  const SQL = await initSqlJs();

  const saved = await loadFromIndexedDB();
  const database = saved ? new SQL.Database(saved) : new SQL.Database();

  runMigrations(database);
  seedBudgets(database);
  seedAttractions(database);
  seedRestaurants(database);

  await persist(database);
  return database;
}

function runMigrations(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY,
      budget_twd INTEGER NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      amount_twd INTEGER NOT NULL,
      date TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS attractions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      maps_url TEXT,
      image_url TEXT,
      tag TEXT,
      day_label TEXT
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT,
      description TEXT,
      price_range TEXT,
      address TEXT,
      area TEXT NOT NULL,
      maps_url TEXT,
      website TEXT,
      image_url TEXT,
      kid_friendly INTEGER DEFAULT 1,
      meal_type TEXT,
      day_labels TEXT
    )
  `);
}

function seedBudgets(database: Database) {
  const count = database.exec("SELECT COUNT(*) FROM budgets");
  if (count[0]?.values[0]?.[0] === 0) {
    const defaults = [
      ["Flights", 100000],
      ["Transportation", 6200],
      ["Accommodation", 30000],
      ["Food", 10000],
      ["SIM Card", 1500],
      ["Tickets", 5000],
    ] as const;
    const stmt = database.prepare(
      "INSERT INTO budgets (category, budget_twd) VALUES (?, ?)"
    );
    for (const [cat, amount] of defaults) {
      stmt.run([cat, amount]);
    }
    stmt.free();
  }
}

function seedAttractions(database: Database) {
  const count = database.exec("SELECT COUNT(*) FROM attractions");
  if ((count[0]?.values[0]?.[0] as number) > 0) return;

  const attractions = [
    ["a1", "Sydney Opera House", "UNESCO World Heritage icon on Bennelong Point. Take a kid-friendly Junior Tour and snap harbour-front photos.", "Bennelong Point", "https://www.google.com/maps/search/?api=1&query=Sydney+Opera+House", "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&q=80", "Landmark", "Day 2"],
    ["a2", "The Rocks Market", "Sydney's oldest neighborhood with artisan stalls, street performers, and Harbour Bridge views.", "The Rocks", "https://www.google.com/maps/search/?api=1&query=The+Rocks+Sydney", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80", "Market", "Day 2"],
    ["a3", "SEA LIFE Sydney Aquarium", "Home to sharks, penguins, and Australia's only dugongs. Interactive exhibits perfect for toddlers.", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=SEA+LIFE+Sydney+Aquarium", "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&q=80", "Family Fun", "Day 3"],
    ["a4", "Sydney Fish Market", "Australia's largest fish market. Fresh seafood, rock oysters, and fish & chips.", "Pyrmont", "https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market", "https://images.unsplash.com/photo-1534483509719-8fbc3c37030d?w=600&q=80", "Food", "Day 3"],
    ["a5", "Featherdale Wildlife Park", "Get up close with koalas, kangaroos, wombats, and more. A highlight for kids of all ages.", "Doonside", "https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney", "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=600&q=80", "Wildlife", "Day 4"],
    ["a6", "Luna Park Sydney", "Iconic amusement park with family-friendly rides and the famous smiling face entrance.", "Milsons Point", "https://www.google.com/maps/search/?api=1&query=Luna+Park+Sydney", "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=600&q=80", "Theme Park", "Day 4"],
    ["a7", "Manly Beach", "A scenic 30-min ferry ride from Circular Quay. Build sandcastles, splash in the shallows, and walk to Shelly Beach.", "Manly", "https://www.google.com/maps/search/?api=1&query=Manly+Beach+Sydney", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", "Beach", "Day 5"],
    ["a8", "Darling Harbour", "Waterfront precinct with restaurants, playgrounds, and stunning night lights.", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Darling+Harbour+Sydney", "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80", "Waterfront", "Day 1"],
    ["a9", "Queen Victoria Building (QVB)", "Heritage shopping arcade with beautiful Romanesque architecture. Home to the Royal Clock.", "CBD", "https://www.google.com/maps/search/?api=1&query=Queen+Victoria+Building+Sydney", "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80", "Shopping", "Day 6"],
    ["a10", "Hyde Park", "Sydney's oldest public park with lawns, fountains, and St. Mary's Cathedral nearby.", "CBD", "https://www.google.com/maps/search/?api=1&query=Hyde+Park+Sydney", "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80", "Park", "Day 6"],
  ];

  const stmt = database.prepare("INSERT INTO attractions (id, name, description, location, maps_url, image_url, tag, day_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  for (const a of attractions) {
    stmt.run(a);
  }
  stmt.free();
}

function seedRestaurants(database: Database) {
  const count = database.exec("SELECT COUNT(*) FROM restaurants");
  if ((count[0]?.values[0]?.[0] as number) > 0) return;

  const restaurants = [
    // Day 1 — Darling Harbour area
    ["r1", "The Malaya", "Malaysian", "Award-winning Malaysian restaurant at Darling Harbour. Famous for laksa and rendang. Spacious with high chairs available.", "$$", "39 Lime St, King Street Wharf", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=The+Malaya+Sydney", "https://themalaya.com.au", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", 1, "Dinner", "Day 1"],
    ["r2", "Hurricane's Grill", "Steakhouse/BBQ", "Famous for their pork ribs and harbour views. Kid-friendly with a dedicated children's menu.", "$$", "Darling Harbour", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Hurricane's+Grill+Darling+Harbour+Sydney", "https://hurricanesgrill.com.au", "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80", 1, "Dinner", "Day 1,Day 6"],
    ["r3", "Zaaffran", "Indian", "Modern Indian cuisine with stunning harbour views. Great naan and curries. Family-friendly atmosphere.", "$$", "Level 2, 345 Harbourside", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Zaaffran+Darling+Harbour+Sydney", "https://zaaffran.com", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", 1, "Dinner", "Day 1"],

    // Day 2 — Opera House / The Rocks / Circular Quay
    ["r4", "The Glenmore", "Australian Pub", "Rooftop pub in The Rocks with incredible Opera House & Harbour Bridge views. Good pub grub and family-friendly during daytime.", "$$", "96 Cumberland St, The Rocks", "The Rocks", "https://www.google.com/maps/search/?api=1&query=The+Glenmore+The+Rocks+Sydney", "https://theglenmore.com.au", "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80", 1, "Lunch", "Day 2"],
    ["r5", "Pancakes on the Rocks", "Pancakes/Casual", "A Sydney institution! Open almost 24/7. Kids love the pancakes, crepes, and pizzas. Very toddler-friendly.", "$", "4 Hickson Rd, The Rocks", "The Rocks", "https://www.google.com/maps/search/?api=1&query=Pancakes+on+the+Rocks+Sydney", "https://pancakesontherocks.com.au", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80", 1, "Lunch,Dinner", "Day 2"],
    ["r6", "Opera Bar", "Australian/Bar", "Waterfront bar right next to the Opera House. Perfect for drinks and casual bites with the best view in Sydney.", "$$", "Lower Concourse, Sydney Opera House", "Circular Quay", "https://www.google.com/maps/search/?api=1&query=Opera+Bar+Sydney", "https://operabar.com.au", "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&q=80", 1, "Lunch,Dinner", "Day 2"],

    // Day 3 — SEA LIFE / Fish Market
    ["r7", "Sydney Fish Market (Dine-in)", "Seafood", "Fresh seafood right at the market — oysters, sashimi, fish & chips. Multiple vendors to choose from. Outdoor seating.", "$–$$", "Bank St, Pyrmont", "Pyrmont", "https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market", "https://www.sydneyfishmarket.com.au", "https://images.unsplash.com/photo-1534483509719-8fbc3c37030d?w=600&q=80", 1, "Lunch", "Day 3"],
    ["r8", "Nick's Seafood Restaurant", "Seafood", "Premium seafood dining at Darling Harbour. Known for the seafood platter. Kids' menu available.", "$$$", "The Promenade, Cockle Bay Wharf", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Nick's+Seafood+Restaurant+Darling+Harbour+Sydney", "https://nicksseafoodrestaurant.com.au", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", 1, "Dinner", "Day 3"],

    // Day 4 — Featherdale / Blacktown area
    ["r9", "Featherdale Café", "Café", "On-site café inside Featherdale Wildlife Park. Sandwiches, pies, coffee, and kid-friendly snacks.", "$", "217 Kildare Rd, Doonside", "Doonside", "https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney", "https://www.featherdale.com.au", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", 1, "Lunch", "Day 4"],
    ["r10", "Milky Lane", "Burgers/Desserts", "Over-the-top burgers, loaded fries, and insane milkshakes. A visual feast kids will love. Multiple locations.", "$$", "Multiple Sydney locations", "CBD", "https://www.google.com/maps/search/?api=1&query=Milky+Lane+Sydney", "https://milkylane.com.au", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", 1, "Dinner", "Day 4"],

    // Day 5 — Manly Beach
    ["r11", "The Pantry Manly", "Australian/Brunch", "Beachfront café right on Manly Beach. Excellent brunch, acai bowls, and fresh juices. High chairs available.", "$$", "Ocean Promenade, North Steyne, Manly", "Manly", "https://www.google.com/maps/search/?api=1&query=The+Pantry+Manly+Sydney", "https://thepantrymanly.com", "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80", 1, "Brunch,Lunch", "Day 5"],
    ["r12", "Hugos Manly", "Italian/Pizza", "Beachfront Italian right on the Manly Wharf. Great pizzas, pasta, and gelato. Kids love the thin-crust pizzas.", "$$", "Manly Wharf, East Esplanade", "Manly", "https://www.google.com/maps/search/?api=1&query=Hugos+Manly+Sydney", "https://hugos.com.au", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80", 1, "Lunch,Dinner", "Day 5"],
    ["r13", "Manly Greenhouse", "Modern Australian", "Three-level venue with rooftop views of Manly Beach. Ground floor pizzeria is very family-friendly.", "$$", "56 Sydney Rd, Manly", "Manly", "https://www.google.com/maps/search/?api=1&query=The+Greenhouse+Manly+Sydney", null, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", 1, "Lunch,Dinner", "Day 5"],

    // Day 6 — QVB / CBD / Farewell
    ["r14", "Din Tai Fung (World Square)", "Taiwanese/Dumplings", "World-famous Taiwanese soup dumplings (xiao long bao). A taste of home! Always busy — go early or expect a queue.", "$$", "World Square, 644 George St", "CBD", "https://www.google.com/maps/search/?api=1&query=Din+Tai+Fung+World+Square+Sydney", "https://dintaifung.com.au", "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80", 1, "Lunch", "Day 6"],
    ["r15", "QVB Tea Room", "Café/High Tea", "Elegant tea room inside the Queen Victoria Building. Great for a light afternoon tea break.", "$$", "Queen Victoria Building, 455 George St", "CBD", "https://www.google.com/maps/search/?api=1&query=QVB+Tea+Room+Sydney", null, "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80", 1, "Afternoon Tea", "Day 6"],

    // Near hotel — available all days
    ["r16", "Ester Restaurant", "Modern Australian", "Acclaimed woodfired-cooking restaurant in Chippendale, close to the hotel. Great for a special night out.", "$$$", "46-52 Meagher St, Chippendale", "Chippendale", "https://www.google.com/maps/search/?api=1&query=Ester+Restaurant+Chippendale+Sydney", "https://ester-restaurant.com.au", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", 0, "Dinner", "Day 1,Day 2,Day 3,Day 4,Day 5,Day 6"],
    ["r17", "Kensington Street Social", "Modern Australian", "Trendy Chippendale dining near the hotel. Spice Alley food court next door is great for casual Asian eats with a toddler.", "$$", "Kensington St, Chippendale", "Chippendale", "https://www.google.com/maps/search/?api=1&query=Kensington+Street+Chippendale+Sydney", null, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", 1, "Dinner", "Day 1,Day 2,Day 3,Day 4,Day 5,Day 6"],
    ["r18", "Spice Alley", "Asian Street Food", "Outdoor hawker-style food court in Chippendale. Thai, Malaysian, Chinese, Japanese — affordable and kid-friendly. 2 min walk from hotel.", "$", "Kensington St, Chippendale", "Chippendale", "https://www.google.com/maps/search/?api=1&query=Spice+Alley+Chippendale+Sydney", "https://spicealley.com.au", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", 1, "Lunch,Dinner", "Day 1,Day 2,Day 3,Day 4,Day 5,Day 6"],
  ];

  const stmt = database.prepare("INSERT INTO restaurants (id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const r of restaurants) {
    stmt.run(r);
  }
  stmt.free();
}

async function persist(database: Database) {
  const data = database.export();
  await saveToIndexedDB(data);
}

export async function getDb(): Promise<Database> {
  if (db) return db;
  if (!dbReady) {
    dbReady = initDb().then((d) => {
      db = d;
      return d;
    });
  }
  return dbReady;
}

export async function persistDb() {
  if (db) await persist(db);
}

// ----- Types -----

export interface BudgetRow {
  category: string;
  budget_twd: number;
}

export interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  amount_twd: number;
  date: string;
}

export interface AttractionRow {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  maps_url: string | null;
  image_url: string | null;
  tag: string | null;
  day_label: string | null;
}

export interface RestaurantRow {
  id: string;
  name: string;
  cuisine: string | null;
  description: string | null;
  price_range: string | null;
  address: string | null;
  area: string;
  maps_url: string | null;
  website: string | null;
  image_url: string | null;
  kid_friendly: number;
  meal_type: string | null;
  day_labels: string | null;
}

// ----- Budget queries -----

export async function getAllBudgets(): Promise<BudgetRow[]> {
  const database = await getDb();
  const results = database.exec("SELECT category, budget_twd FROM budgets");
  if (!results[0]) return [];
  return results[0].values.map(([category, budget_twd]) => ({
    category: category as string,
    budget_twd: budget_twd as number,
  }));
}

export async function upsertBudget(category: string, budgetTwd: number) {
  const database = await getDb();
  database.run(
    "INSERT OR REPLACE INTO budgets (category, budget_twd) VALUES (?, ?)",
    [category, budgetTwd]
  );
  await persist(database);
}

export async function getAllExpenses(): Promise<ExpenseRow[]> {
  const database = await getDb();
  const results = database.exec(
    "SELECT id, category, description, amount, currency, amount_twd, date FROM expenses ORDER BY date DESC"
  );
  if (!results[0]) return [];
  return results[0].values.map(
    ([id, category, description, amount, currency, amount_twd, date]) => ({
      id: id as string,
      category: category as string,
      description: description as string,
      amount: amount as number,
      currency: currency as string,
      amount_twd: amount_twd as number,
      date: date as string,
    })
  );
}

export async function insertExpense(expense: ExpenseRow) {
  const database = await getDb();
  database.run(
    "INSERT INTO expenses (id, category, description, amount, currency, amount_twd, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [expense.id, expense.category, expense.description, expense.amount, expense.currency, expense.amount_twd, expense.date]
  );
  await persist(database);
}

export async function deleteExpense(id: string) {
  const database = await getDb();
  database.run("DELETE FROM expenses WHERE id = ?", [id]);
  await persist(database);
}

export async function exportDbFile(): Promise<Uint8Array> {
  const database = await getDb();
  return database.export();
}

// ----- Attraction queries -----

export async function getAllAttractions(): Promise<AttractionRow[]> {
  const database = await getDb();
  const results = database.exec("SELECT id, name, description, location, maps_url, image_url, tag, day_label FROM attractions ORDER BY rowid");
  if (!results[0]) return [];
  return results[0].values.map(([id, name, description, location, maps_url, image_url, tag, day_label]) => ({
    id: id as string,
    name: name as string,
    description: description as string | null,
    location: location as string | null,
    maps_url: maps_url as string | null,
    image_url: image_url as string | null,
    tag: tag as string | null,
    day_label: day_label as string | null,
  }));
}

// ----- Restaurant queries -----

export async function getAllRestaurants(): Promise<RestaurantRow[]> {
  const database = await getDb();
  const results = database.exec("SELECT id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels FROM restaurants ORDER BY rowid");
  if (!results[0]) return [];
  return results[0].values.map(([id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels]) => ({
    id: id as string,
    name: name as string,
    cuisine: cuisine as string | null,
    description: description as string | null,
    price_range: price_range as string | null,
    address: address as string | null,
    area: area as string,
    maps_url: maps_url as string | null,
    website: website as string | null,
    image_url: image_url as string | null,
    kid_friendly: kid_friendly as number,
    meal_type: meal_type as string | null,
    day_labels: day_labels as string | null,
  }));
}

export async function getRestaurantsByDay(dayLabel: string): Promise<RestaurantRow[]> {
  const database = await getDb();
  const results = database.exec(
    "SELECT id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels FROM restaurants WHERE day_labels LIKE ? ORDER BY rowid",
    [`%${dayLabel}%`]
  );
  if (!results[0]) return [];
  return results[0].values.map(([id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels]) => ({
    id: id as string,
    name: name as string,
    cuisine: cuisine as string | null,
    description: description as string | null,
    price_range: price_range as string | null,
    address: address as string | null,
    area: area as string,
    maps_url: maps_url as string | null,
    website: website as string | null,
    image_url: image_url as string | null,
    kid_friendly: kid_friendly as number,
    meal_type: meal_type as string | null,
    day_labels: day_labels as string | null,
  }));
}
