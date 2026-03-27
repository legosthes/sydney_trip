const API_BASE = "/api";

// ── Types ──

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


// ── Budget API ──

export async function getAllBudgets(): Promise<BudgetRow[]> {
  const res = await fetch(`${API_BASE}/budgets`);
  return res.json();
}

export async function upsertBudget(
  category: string,
  budgetTwd: number
): Promise<void> {
  await fetch(`${API_BASE}/budgets/${encodeURIComponent(category)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget_twd: budgetTwd }),
  });
}

// ── Expense API ──

export async function getAllExpenses(): Promise<ExpenseRow[]> {
  const res = await fetch(`${API_BASE}/expenses`);
  return res.json();
}

export async function insertExpense(
  expense: Omit<ExpenseRow, "id">
): Promise<ExpenseRow> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
}

export async function updateExpense(
  id: string,
  expense: Partial<Omit<ExpenseRow, "id">>
): Promise<ExpenseRow> {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
}

export async function deleteExpense(id: string): Promise<void> {
  await fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
}

// ── Attraction API ──

export async function getAllAttractions(): Promise<AttractionRow[]> {
  const res = await fetch(`${API_BASE}/attractions`);
  return res.json();
}

// ── Day Customization API ──

export interface DayCustomization {
  day_number: number;
  title: string | null;
  image_url: string | null;
}

export async function getAllDayCustomizations(): Promise<DayCustomization[]> {
  const res = await fetch(`${API_BASE}/day-customizations`);
  return res.json();
}

export async function updateDayCustomization(
  dayNumber: number,
  data: { title?: string | null; image_url?: string | null }
): Promise<DayCustomization> {
  const res = await fetch(`${API_BASE}/day-customizations/${dayNumber}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Place API (My Places) ──

export interface PlaceRow {
  id: string;
  name: string;
  notes: string | null;
  maps_url: string | null;
  website: string | null;
  category: string | null;
  day_labels: string | null;
  image_url: string | null;
  created_at: string | null;
}

export type SlotType = 'morning' | 'breakfast' | 'afternoon' | 'lunch' | 'evening' | 'dinner';

export interface ItinerarySlotRow {
  id: string;
  day_number: number;
  slot_type: SlotType;
  place_id: string;
  position: number;
  created_at: string | null;
}

export async function getAllPlaces(): Promise<PlaceRow[]> {
  const res = await fetch(`${API_BASE}/places`);
  return res.json();
}

export async function getPlacesByDay(dayLabel: string): Promise<PlaceRow[]> {
  const res = await fetch(
    `${API_BASE}/places/by-day/${encodeURIComponent(dayLabel)}`
  );
  return res.json();
}

export async function insertPlace(
  place: Omit<PlaceRow, "id" | "created_at">
): Promise<PlaceRow> {
  const res = await fetch(`${API_BASE}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(place),
  });
  return res.json();
}

export async function updatePlace(
  id: string,
  place: Omit<PlaceRow, "id" | "created_at">
): Promise<PlaceRow> {
  const res = await fetch(`${API_BASE}/places/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(place),
  });
  return res.json();
}

export async function deletePlace(id: string): Promise<void> {
  await fetch(`${API_BASE}/places/${id}`, { method: "DELETE" });
}

// ── Checklist API ──

export interface ChecklistItemRow {
  id: string;
  text: string;
  checked: number;
  category: string | null;
  sort_order: number;
}

export async function getAllChecklist(): Promise<ChecklistItemRow[]> {
  const res = await fetch(`${API_BASE}/checklist`);
  return res.json();
}

export async function insertChecklistItem(
  item: Omit<ChecklistItemRow, "id" | "checked">
): Promise<ChecklistItemRow> {
  const res = await fetch(`${API_BASE}/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateChecklistItem(
  id: string,
  updates: Partial<Omit<ChecklistItemRow, "id">>
): Promise<ChecklistItemRow> {
  const res = await fetch(`${API_BASE}/checklist/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteChecklistItem(id: string): Promise<void> {
  await fetch(`${API_BASE}/checklist/${id}`, { method: "DELETE" });
}

// ── Itinerary Slots API ──

export async function getAllSlots(): Promise<ItinerarySlotRow[]> {
  const res = await fetch(`${API_BASE}/itinerary/slots`);
  return res.json();
}

export async function getSlotsByDay(dayNumber: number): Promise<ItinerarySlotRow[]> {
  const res = await fetch(`${API_BASE}/itinerary/slots/${dayNumber}`);
  return res.json();
}

export async function addSlot(
  slot: Omit<ItinerarySlotRow, "id" | "created_at">
): Promise<ItinerarySlotRow> {
  const res = await fetch(`${API_BASE}/itinerary/slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slot),
  });
  if (res.status === 409) {
    const err = await res.json();
    throw new Error(err.detail || "Slot is full");
  }
  return res.json();
}

export async function removeSlot(slotId: string): Promise<void> {
  await fetch(`${API_BASE}/itinerary/slots/${slotId}`, { method: "DELETE" });
}
