import shutil
import sqlite3
import os
from pathlib import Path

# Runtime database location. Overridable via the DB_PATH env var so the app can
# point at a persistent disk in production (e.g. Render mounts one at /data).
# Locally this defaults to the file next to this module.
DB_PATH = Path(os.environ.get("DB_PATH", str(Path(__file__).parent / "sydney_trip.db")))

# Snapshot of the trip data baked into the image. On first boot against an empty
# persistent disk, this is copied to DB_PATH so the deployed app starts with the
# real data instead of empty seed defaults.
SEED_DB = Path(__file__).parent / "sydney_trip.seed.db"


def _bootstrap_db() -> None:
    """Seed a fresh DB_PATH from the bundled snapshot, if one is available."""
    if DB_PATH.exists():
        return
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if SEED_DB.exists():
        shutil.copy2(SEED_DB, DB_PATH)
        print(f"Seeded database from snapshot {SEED_DB} -> {DB_PATH}")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def run_migrations():
    _bootstrap_db()
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS budgets (
            category TEXT PRIMARY KEY,
            budget_twd INTEGER NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            amount_twd INTEGER NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
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
    """)

    cur.execute("""
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
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS my_places (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            notes TEXT,
            maps_url TEXT,
            website TEXT,
            category TEXT,
            day_labels TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS checklist_items (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            checked INTEGER DEFAULT 0,
            category TEXT,
            sort_order INTEGER DEFAULT 0
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS itinerary_slots (
            id TEXT PRIMARY KEY,
            day_number INTEGER NOT NULL,
            slot_type TEXT NOT NULL CHECK (slot_type IN ('morning','breakfast','afternoon','lunch','evening','dinner')),
            place_id TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (place_id) REFERENCES my_places(id) ON DELETE CASCADE,
            UNIQUE (day_number, slot_type, place_id)
        )
    """)

    # Migration: add image_url to my_places if not present
    try:
        cur.execute("ALTER TABLE my_places ADD COLUMN image_url TEXT")
    except sqlite3.OperationalError:
        pass  # column already exists

    cur.execute("""
        CREATE TABLE IF NOT EXISTS day_customizations (
            day_number INTEGER PRIMARY KEY,
            title TEXT,
            image_url TEXT
        )
    """)

    conn.commit()
    conn.close()


def seed_data():
    conn = get_conn()
    cur = conn.cursor()

    # ── Budgets ──
    count = cur.execute("SELECT COUNT(*) FROM budgets").fetchone()[0]
    if count == 0:
        defaults = [
            ("Flights", 100000),
            ("Transportation", 6200),
            ("Accommodation", 30000),
            ("Food", 10000),
            ("SIM Card", 1500),
            ("Tickets", 5000),
        ]
        cur.executemany("INSERT INTO budgets (category, budget_twd) VALUES (?, ?)", defaults)

    # ── Attractions ──
    count = cur.execute("SELECT COUNT(*) FROM attractions").fetchone()[0]
    if count == 0:
        attractions = [
            ("a1", "Sydney Opera House", "UNESCO World Heritage icon on Bennelong Point. Take a kid-friendly Junior Tour and snap harbour-front photos.", "Bennelong Point", "https://www.google.com/maps/search/?api=1&query=Sydney+Opera+House", "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&q=80", "Landmark", "Day 2"),
            ("a2", "The Rocks Market", "Sydney's oldest neighborhood with artisan stalls, street performers, and Harbour Bridge views.", "The Rocks", "https://www.google.com/maps/search/?api=1&query=The+Rocks+Sydney", "https://images.unsplash.com/photo-1713262841373-6e045ac8ab91?w=500&auto=format&fit=crop&q=60", "Market", "Day 2"),
            ("a3", "SEA LIFE Sydney Aquarium", "Home to sharks, penguins, and Australia's only dugongs. Interactive exhibits perfect for toddlers.", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=SEA+LIFE+Sydney+Aquarium", "https://www.darlingharbour.com/getmedia/942467a1-59e6-44f3-897e-8a482c710090/sealife-aquarium-8.jpg", "Family Fun", "Day 3"),
            ("a4", "Sydney Fish Market", "Australia's largest fish market. Fresh seafood, rock oysters, and fish & chips.", "Pyrmont", "https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market", "https://assets.atdw-online.com.au/images/13c262933509a479b608d051ab07af95.jpeg?rect=62%2C0%2C2876%2C2157&w=1600&h=1200&fm=jpg", "Food", "Day 3"),
            ("a5", "Featherdale Wildlife Park", "Get up close with koalas, kangaroos, wombats, and more. A highlight for kids of all ages.", "Doonside", "https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney", "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=500&auto=format&fit=crop&q=60", "Wildlife", "Day 4"),
            ("a6", "Luna Park Sydney", "Iconic amusement park with family-friendly rides and the famous smiling face entrance.", "Milsons Point", "https://www.google.com/maps/search/?api=1&query=Luna+Park+Sydney", "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1470&auto=format&fit=crop", "Theme Park", "Day 4"),
            ("a7", "Manly Beach", "A scenic 30-min ferry ride from Circular Quay. Build sandcastles, splash in the shallows, and walk to Shelly Beach.", "Manly", "https://www.google.com/maps/search/?api=1&query=Manly+Beach+Sydney", "https://images.unsplash.com/photo-1729023410572-ae94d0019ec9?q=80&w=1469&auto=format&fit=crop", "Beach", "Day 5"),
            ("a8", "Darling Harbour", "Waterfront precinct with restaurants, playgrounds, and stunning night lights.", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Darling+Harbour+Sydney", "https://images.unsplash.com/photo-1659684383997-adcabe839378?q=80&w=1471&auto=format&fit=crop", "Waterfront", "Day 1"),
            ("a9", "Queen Victoria Building (QVB)", "Heritage shopping arcade with beautiful Romanesque architecture. Home to the Royal Clock.", "CBD", "https://www.google.com/maps/search/?api=1&query=Queen+Victoria+Building+Sydney", "https://images.unsplash.com/photo-1668376186936-7d003242d9a1?q=80&w=1470&auto=format&fit=crop", "Shopping", "Day 6"),
            ("a10", "Hyde Park", "Sydney's oldest public park with lawns, fountains, and St. Mary's Cathedral nearby.", "CBD", "https://www.google.com/maps/search/?api=1&query=Hyde+Park+Sydney", "https://assets.atdw-online.com.au/images/33c2b3d0228741c4cad0094a332d4d74.jpeg?rect=0%2C0%2C2048%2C1536&w=2048&h=1536", "Park", "Day 6"),
        ]
        cur.executemany(
            "INSERT INTO attractions (id, name, description, location, maps_url, image_url, tag, day_label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            attractions,
        )

    # ── Restaurants ──
    count = cur.execute("SELECT COUNT(*) FROM restaurants").fetchone()[0]
    if count == 0:
        restaurants = [
            ("r1", "The Malaya", "Malaysian", "Award-winning Malaysian restaurant at Darling Harbour. Famous for laksa and rendang. Spacious with high chairs available.", "$$", "39 Lime St, King Street Wharf", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=The+Malaya+Sydney", "https://themalaya.com.au", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", 1, "Dinner", "Day 1"),
            ("r2", "Hurricane's Grill", "Steakhouse/BBQ", "Famous for their pork ribs and harbour views. Kid-friendly with a dedicated children's menu.", "$$", "Darling Harbour", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Hurricane's+Grill+Darling+Harbour+Sydney", "https://hurricanesgrill.com.au", "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80", 1, "Dinner", "Day 1,Day 6"),
            ("r3", "Zaaffran", "Indian", "Modern Indian cuisine with stunning harbour views. Great naan and curries. Family-friendly atmosphere.", "$$", "Level 2, 345 Harbourside", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Zaaffran+Darling+Harbour+Sydney", "https://zaaffran.com", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80", 1, "Dinner", "Day 1"),
            ("r4", "The Glenmore", "Australian Pub", "Rooftop pub in The Rocks with incredible Opera House & Harbour Bridge views. Good pub grub and family-friendly during daytime.", "$$", "96 Cumberland St, The Rocks", "The Rocks", "https://www.google.com/maps/search/?api=1&query=The+Glenmore+The+Rocks+Sydney", "https://theglenmore.com.au", "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80", 1, "Lunch", "Day 2"),
            ("r5", "Pancakes on the Rocks", "Pancakes/Casual", "A Sydney institution! Open almost 24/7. Kids love the pancakes, crepes, and pizzas. Very toddler-friendly.", "$", "4 Hickson Rd, The Rocks", "The Rocks", "https://www.google.com/maps/search/?api=1&query=Pancakes+on+the+Rocks+Sydney", "https://pancakesontherocks.com.au", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80", 1, "Lunch,Dinner", "Day 2"),
            ("r6", "Opera Bar", "Australian/Bar", "Waterfront bar right next to the Opera House. Perfect for drinks and casual bites with the best view in Sydney.", "$$", "Lower Concourse, Sydney Opera House", "Circular Quay", "https://www.google.com/maps/search/?api=1&query=Opera+Bar+Sydney", "https://operabar.com.au", "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=600&q=80", 1, "Lunch,Dinner", "Day 2"),
            ("r7", "Sydney Fish Market (Dine-in)", "Seafood", "Fresh seafood right at the market — oysters, sashimi, fish & chips. Multiple vendors to choose from. Outdoor seating.", "$-$$", "Bank St, Pyrmont", "Pyrmont", "https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market", "https://www.sydneyfishmarket.com.au", "https://images.unsplash.com/photo-1534483509719-8fbc3c37030d?w=600&q=80", 1, "Lunch", "Day 3"),
            ("r8", "Nick's Seafood Restaurant", "Seafood", "Premium seafood dining at Darling Harbour. Known for the seafood platter. Kids' menu available.", "$$$", "The Promenade, Cockle Bay Wharf", "Darling Harbour", "https://www.google.com/maps/search/?api=1&query=Nick's+Seafood+Restaurant+Darling+Harbour+Sydney", "https://nicksseafoodrestaurant.com.au", "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80", 1, "Dinner", "Day 3"),
            ("r9", "Featherdale Cafe", "Cafe", "On-site cafe inside Featherdale Wildlife Park. Sandwiches, pies, coffee, and kid-friendly snacks.", "$", "217 Kildare Rd, Doonside", "Doonside", "https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney", "https://www.featherdale.com.au", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", 1, "Lunch", "Day 4"),
            ("r10", "Milky Lane", "Burgers/Desserts", "Over-the-top burgers, loaded fries, and insane milkshakes. A visual feast kids will love. Multiple locations.", "$$", "Multiple Sydney locations", "CBD", "https://www.google.com/maps/search/?api=1&query=Milky+Lane+Sydney", "https://milkylane.com.au", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", 1, "Dinner", "Day 4"),
            ("r11", "The Pantry Manly", "Australian/Brunch", "Beachfront cafe right on Manly Beach. Excellent brunch, acai bowls, and fresh juices. High chairs available.", "$$", "Ocean Promenade, North Steyne, Manly", "Manly", "https://www.google.com/maps/search/?api=1&query=The+Pantry+Manly+Sydney", "https://thepantrymanly.com", "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&q=80", 1, "Brunch,Lunch", "Day 5"),
            ("r12", "Hugos Manly", "Italian/Pizza", "Beachfront Italian right on the Manly Wharf. Great pizzas, pasta, and gelato. Kids love the thin-crust pizzas.", "$$", "Manly Wharf, East Esplanade", "Manly", "https://www.google.com/maps/search/?api=1&query=Hugos+Manly+Sydney", "https://hugos.com.au", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80", 1, "Lunch,Dinner", "Day 5"),
            ("r13", "Manly Greenhouse", "Modern Australian", "Three-level venue with rooftop views of Manly Beach. Ground floor pizzeria is very family-friendly.", "$$", "56 Sydney Rd, Manly", "Manly", "https://www.google.com/maps/search/?api=1&query=The+Greenhouse+Manly+Sydney", None, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", 1, "Lunch,Dinner", "Day 5"),
            ("r14", "Din Tai Fung (World Square)", "Taiwanese/Dumplings", "World-famous Taiwanese soup dumplings (xiao long bao). A taste of home! Always busy — go early or expect a queue.", "$$", "World Square, 644 George St", "CBD", "https://www.google.com/maps/search/?api=1&query=Din+Tai+Fung+World+Square+Sydney", "https://dintaifung.com.au", "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80", 1, "Lunch", "Day 6"),
            ("r15", "QVB Tea Room", "Cafe/High Tea", "Elegant tea room inside the Queen Victoria Building. Great for a light afternoon tea break.", "$$", "Queen Victoria Building, 455 George St", "CBD", "https://www.google.com/maps/search/?api=1&query=QVB+Tea+Room+Sydney", None, "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80", 1, "Afternoon Tea", "Day 6"),
            ("r16", "Ester Restaurant", "Modern Australian", "Acclaimed woodfired-cooking restaurant in Chippendale, close to the hotel. Great for a special night out.", "$$$", "46-52 Meagher St, Chippendale", "Chippendale", "https://www.google.com/maps/search/?api=1&query=Ester+Restaurant+Chippendale+Sydney", "https://ester-restaurant.com.au", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", 0, "Dinner", "Day 1,Day 2,Day 3,Day 4,Day 5,Day 6"),
            ("r17", "Kensington Street Social", "Modern Australian", "Trendy Chippendale dining near the hotel. Spice Alley food court next door is great for casual Asian eats with a toddler.", "$$", "Kensington St, Chippendale", "Chippendale", "https://www.google.com/maps/search/?api=1&query=Kensington+Street+Chippendale+Sydney", None, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80", 1, "Dinner", "Day 1,Day 2,Day 3,Day 4,Day 5,Day 6"),
            ("r18", "Spice Alley", "Asian Street Food", "Outdoor hawker-style food court in Chippendale. Thai, Malaysian, Chinese, Japanese — affordable and kid-friendly. 2 min walk from hotel.", "$", "Kensington St, Chippendale", "Chippendale", "https://www.google.com/maps/search/?api=1&query=Spice+Alley+Chippendale+Sydney", "https://spicealley.com.au", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", 1, "Lunch,Dinner", "Day 1,Day 2,Day 3,Day 4,Day 5,Day 6"),
        ]
        cur.executemany(
            "INSERT INTO restaurants (id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            restaurants,
        )

    # ── Checklist ──
    count = cur.execute("SELECT COUNT(*) FROM checklist_items").fetchone()[0]
    if count == 0:
        import uuid
        items = [
            ("Passports", "Documents", 1),
            ("Visa / ETA", "Documents", 2),
            ("Travel insurance docs", "Documents", 3),
            ("Hotel booking confirmation", "Documents", 4),
            ("Flight tickets (QF 8730 / QF 8729)", "Documents", 5),
            ("Copies of IDs (digital + paper)", "Documents", 6),
            ("Winter jacket (July is winter!)", "Clothing", 10),
            ("Warm layers / sweaters", "Clothing", 11),
            ("Comfortable walking shoes", "Clothing", 12),
            ("Rain jacket / umbrella", "Clothing", 13),
            ("Warm pajamas", "Clothing", 14),
            ("Hat & scarf", "Clothing", 15),
            ("Toothbrush & toothpaste", "Toiletries", 20),
            ("Sunscreen (UV is strong even in winter)", "Toiletries", 21),
            ("Medications", "Toiletries", 22),
            ("Hand sanitizer", "Toiletries", 23),
            ("Stroller", "Baby Items", 30),
            ("Diapers & wipes", "Baby Items", 31),
            ("Baby food & snacks", "Baby Items", 32),
            ("Sippy cup / water bottle", "Baby Items", 33),
            ("Favorite toys / books", "Baby Items", 34),
            ("Extra change of clothes", "Baby Items", 35),
            ("Baby carrier / sling", "Baby Items", 36),
            ("Phone chargers", "Electronics", 40),
            ("Type I power adapter (AU plug)", "Electronics", 41),
            ("Portable battery pack", "Electronics", 42),
            ("Camera", "Electronics", 43),
            ("Headphones", "Electronics", 44),
            ("Reusable water bottle", "Miscellaneous", 50),
            ("Snacks for the plane", "Miscellaneous", 51),
            ("Travel pillow & blanket", "Miscellaneous", 52),
            ("Ziplock bags", "Miscellaneous", 53),
            ("Cash (AUD) & cards", "Miscellaneous", 54),
        ]
        cur.executemany(
            "INSERT INTO checklist_items (id, text, checked, category, sort_order) VALUES (?, ?, 0, ?, ?)",
            [(str(uuid.uuid4()), text, cat, order) for text, cat, order in items],
        )

    conn.commit()
    conn.close()
