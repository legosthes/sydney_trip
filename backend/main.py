from __future__ import annotations

import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database import get_conn, run_migrations, seed_data, DB_PATH

# Path to the built React frontend
DIST_DIR = Path(__file__).parent.parent / "dist"


# ── Lifespan ──────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    seed_data()
    print(f"Database ready at {DB_PATH}")
    yield


app = FastAPI(title="Sydney Trip API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic models ──────────────────────────────────────


class BudgetOut(BaseModel):
    category: str
    budget_twd: int


class BudgetUpdate(BaseModel):
    budget_twd: int


class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float
    currency: str  # "AUD" | "TWD"
    amount_twd: int
    date: str


class ExpenseOut(ExpenseCreate):
    id: str


class AttractionOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    maps_url: Optional[str] = None
    image_url: Optional[str] = None
    tag: Optional[str] = None
    day_label: Optional[str] = None


class RestaurantOut(BaseModel):
    id: str
    name: str
    cuisine: Optional[str] = None
    description: Optional[str] = None
    price_range: Optional[str] = None
    address: Optional[str] = None
    area: str
    maps_url: Optional[str] = None
    website: Optional[str] = None
    image_url: Optional[str] = None
    kid_friendly: int = 1
    meal_type: Optional[str] = None
    day_labels: Optional[str] = None


class PlaceCreate(BaseModel):
    name: str
    notes: Optional[str] = None
    maps_url: Optional[str] = None
    website: Optional[str] = None
    category: Optional[str] = None
    day_labels: Optional[str] = None
    image_url: Optional[str] = None


class PlaceOut(PlaceCreate):
    id: str
    created_at: Optional[str] = None


class SlotCreate(BaseModel):
    day_number: int
    slot_type: str
    place_id: str
    position: int = 0


class SlotOut(SlotCreate):
    id: str
    created_at: Optional[str] = None


class ChecklistItemCreate(BaseModel):
    text: str
    category: Optional[str] = None
    sort_order: Optional[int] = 0


class ChecklistItemOut(ChecklistItemCreate):
    id: str
    checked: int = 0


class ChecklistItemUpdate(BaseModel):
    text: Optional[str] = None
    checked: Optional[int] = None
    category: Optional[str] = None
    sort_order: Optional[int] = None


# ── Budget endpoints ─────────────────────────────────────


@app.get("/api/budgets", response_model=list[BudgetOut])
def list_budgets():
    conn = get_conn()
    rows = conn.execute("SELECT category, budget_twd FROM budgets ORDER BY rowid").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.put("/api/budgets/{category}", response_model=BudgetOut)
def update_budget(category: str, body: BudgetUpdate):
    conn = get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO budgets (category, budget_twd) VALUES (?, ?)",
        (category, body.budget_twd),
    )
    conn.commit()
    row = conn.execute("SELECT category, budget_twd FROM budgets WHERE category = ?", (category,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Budget not found")
    return dict(row)


# ── Expense endpoints ────────────────────────────────────


@app.get("/api/expenses", response_model=list[ExpenseOut])
def list_expenses():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, category, description, amount, currency, amount_twd, date FROM expenses ORDER BY date DESC, created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/expenses", response_model=ExpenseOut, status_code=201)
def create_expense(body: ExpenseCreate):
    expense_id = str(uuid.uuid4())
    conn = get_conn()
    conn.execute(
        "INSERT INTO expenses (id, category, description, amount, currency, amount_twd, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (expense_id, body.category, body.description, body.amount, body.currency, body.amount_twd, body.date),
    )
    conn.commit()
    conn.close()
    return ExpenseOut(id=expense_id, **body.model_dump())


@app.put("/api/expenses/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: str, body: ExpenseCreate):
    conn = get_conn()
    conn.execute(
        "UPDATE expenses SET category=?, description=?, amount=?, currency=?, amount_twd=?, date=? WHERE id=?",
        (body.category, body.description, body.amount, body.currency, body.amount_twd, body.date, expense_id),
    )
    conn.commit()
    conn.close()
    return ExpenseOut(id=expense_id, **body.model_dump())


@app.delete("/api/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()


# ── Attraction endpoints ─────────────────────────────────


@app.get("/api/attractions", response_model=list[AttractionOut])
def list_attractions():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, description, location, maps_url, image_url, tag, day_label FROM attractions ORDER BY rowid"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Restaurant endpoints ─────────────────────────────────


@app.get("/api/restaurants", response_model=list[RestaurantOut])
def list_restaurants():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels FROM restaurants ORDER BY rowid"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/restaurants/by-day/{day_label}", response_model=list[RestaurantOut])
def restaurants_by_day(day_label: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, cuisine, description, price_range, address, area, maps_url, website, image_url, kid_friendly, meal_type, day_labels FROM restaurants WHERE day_labels LIKE ? ORDER BY rowid",
        (f"%{day_label}%",),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── My Places endpoints ─────────────────────────────────


@app.get("/api/places", response_model=list[PlaceOut])
def list_places():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, notes, maps_url, website, category, day_labels, image_url, created_at FROM my_places ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/places/by-day/{day_label}", response_model=list[PlaceOut])
def places_by_day(day_label: str):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, notes, maps_url, website, category, day_labels, image_url, created_at FROM my_places WHERE day_labels LIKE ? ORDER BY created_at DESC",
        (f"%{day_label}%",),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/places", response_model=PlaceOut, status_code=201)
def create_place(body: PlaceCreate):
    place_id = str(uuid.uuid4())
    conn = get_conn()
    conn.execute(
        "INSERT INTO my_places (id, name, notes, maps_url, website, category, day_labels, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (place_id, body.name, body.notes, body.maps_url, body.website, body.category, body.day_labels, body.image_url),
    )
    conn.commit()
    row = conn.execute("SELECT id, name, notes, maps_url, website, category, day_labels, image_url, created_at FROM my_places WHERE id = ?", (place_id,)).fetchone()
    conn.close()
    return dict(row)


@app.put("/api/places/{place_id}", response_model=PlaceOut)
def update_place(place_id: str, body: PlaceCreate):
    conn = get_conn()
    conn.execute(
        "UPDATE my_places SET name=?, notes=?, maps_url=?, website=?, category=?, day_labels=?, image_url=? WHERE id=?",
        (body.name, body.notes, body.maps_url, body.website, body.category, body.day_labels, body.image_url, place_id),
    )
    conn.commit()
    row = conn.execute("SELECT id, name, notes, maps_url, website, category, day_labels, image_url, created_at FROM my_places WHERE id = ?", (place_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Place not found")
    return dict(row)


@app.delete("/api/places/{place_id}", status_code=204)
def delete_place(place_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM my_places WHERE id = ?", (place_id,))
    conn.commit()
    conn.close()


# ── Itinerary Slot endpoints ─────────────────────────────

ACTIVITY_SLOTS = {"morning", "afternoon", "evening"}
MEAL_SLOTS = {"breakfast", "lunch", "dinner"}


@app.get("/api/itinerary/slots", response_model=list[SlotOut])
def list_all_slots():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, day_number, slot_type, place_id, position, created_at FROM itinerary_slots ORDER BY day_number, position"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/itinerary/slots/{day_number}", response_model=list[SlotOut])
def list_slots_by_day(day_number: int):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, day_number, slot_type, place_id, position, created_at FROM itinerary_slots WHERE day_number = ? ORDER BY position",
        (day_number,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/itinerary/slots", response_model=SlotOut, status_code=201)
def create_slot(body: SlotCreate):
    # Validate slot_type
    all_slots = ACTIVITY_SLOTS | MEAL_SLOTS
    if body.slot_type not in all_slots:
        raise HTTPException(400, f"Invalid slot_type: {body.slot_type}")

    conn = get_conn()

    # Check capacity
    count = conn.execute(
        "SELECT COUNT(*) FROM itinerary_slots WHERE day_number = ? AND slot_type = ?",
        (body.day_number, body.slot_type),
    ).fetchone()[0]

    max_allowed = 1 if body.slot_type in MEAL_SLOTS else 3
    if count >= max_allowed:
        conn.close()
        raise HTTPException(409, f"Slot '{body.slot_type}' is full (max {max_allowed})")

    # Check duplicate
    existing = conn.execute(
        "SELECT id FROM itinerary_slots WHERE day_number = ? AND slot_type = ? AND place_id = ?",
        (body.day_number, body.slot_type, body.place_id),
    ).fetchone()
    if existing:
        conn.close()
        raise HTTPException(409, "Place already in this slot")

    slot_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO itinerary_slots (id, day_number, slot_type, place_id, position) VALUES (?, ?, ?, ?, ?)",
        (slot_id, body.day_number, body.slot_type, body.place_id, body.position),
    )
    conn.commit()
    row = conn.execute(
        "SELECT id, day_number, slot_type, place_id, position, created_at FROM itinerary_slots WHERE id = ?",
        (slot_id,),
    ).fetchone()
    conn.close()
    return dict(row)


@app.delete("/api/itinerary/slots/{slot_id}", status_code=204)
def delete_slot(slot_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM itinerary_slots WHERE id = ?", (slot_id,))
    conn.commit()
    conn.close()


# ── Checklist endpoints ──────────────────────────────────


@app.get("/api/checklist", response_model=list[ChecklistItemOut])
def list_checklist():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, text, checked, category, sort_order FROM checklist_items ORDER BY category, sort_order"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/checklist", response_model=ChecklistItemOut, status_code=201)
def create_checklist_item(body: ChecklistItemCreate):
    item_id = str(uuid.uuid4())
    conn = get_conn()
    conn.execute(
        "INSERT INTO checklist_items (id, text, checked, category, sort_order) VALUES (?, ?, 0, ?, ?)",
        (item_id, body.text, body.category, body.sort_order or 0),
    )
    conn.commit()
    conn.close()
    return ChecklistItemOut(id=item_id, text=body.text, checked=0, category=body.category, sort_order=body.sort_order or 0)


@app.put("/api/checklist/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(item_id: str, body: ChecklistItemUpdate):
    conn = get_conn()
    row = conn.execute("SELECT id, text, checked, category, sort_order FROM checklist_items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Checklist item not found")
    current = dict(row)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    current.update(updates)
    conn.execute(
        "UPDATE checklist_items SET text=?, checked=?, category=?, sort_order=? WHERE id=?",
        (current["text"], current["checked"], current["category"], current["sort_order"], item_id),
    )
    conn.commit()
    conn.close()
    return ChecklistItemOut(**current)


@app.delete("/api/checklist/{item_id}", status_code=204)
def delete_checklist_item(item_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM checklist_items WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()


# ── Static file serving (production) ────────────────────

if DIST_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the React SPA for all non-API routes."""
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(DIST_DIR / "index.html"))
