# Implementation Plan

## 1. Replace Restaurants with CRUD "My Places" page
**Backend** (`database.py`, `main.py`):
- New table `my_places` (id, name, notes, maps_url, website, category, day_labels, created_at)
- CRUD endpoints: GET/POST/PUT/DELETE `/api/places`, GET `/api/places/by-day/{day_label}`
- Migrate existing restaurant seed data into `my_places` on first run
- Keep restaurants table/endpoints temporarily for backward compatibility

**Frontend** (`MyPlaces.tsx`, `api.ts`):
- New `PlaceRow` type + CRUD API functions
- CRUD page with add/edit/delete modal (plain HTML form pattern from Budget.tsx)
- Day filter pills (like current Restaurants page)
- Each place card shows: name, notes, category badge, Google Maps iframe embed, external links
- Google Maps iframe: `https://maps.google.com/maps?q={encoded_name_or_url}&output=embed`

## 2. Embedded Google Maps on Itinerary page
- Add a Google Maps iframe in the left sidebar below stats card
- Build URL from the day's activity locations as waypoints
- URL format: `https://www.google.com/maps/dir/?api=1&origin=...&destination=...&waypoints=...`
- Embedded in an iframe or as a clickable "View on Map" button opening directions
- Update restaurant references to use "My Places" API instead

## 3. Travel Info page (`TravelInfo.tsx`)
- Static content page at `/info` route
- Sections: Weather, Clothing, Power/Sockets, Currency, Emergency, Timezone, Language, SIM/WiFi, Family Tips
- Card-based layout with icons, responsive grid (1→2→3 cols)
- All text via i18n translation keys

## 4. Packing Checklist page (`Checklist.tsx`)
**Backend**:
- New table `checklist_items` (id, text, checked, category, sort_order)
- CRUD endpoints: GET/POST/PUT/DELETE `/api/checklist`
- Seed with common items: Documents, Clothing, Toiletries, Baby Items, Electronics, Misc

**Frontend**:
- Items grouped by category
- Toggle checkbox (PATCH checked state)
- Add/Edit/Delete items via plain HTML modal
- Progress bar: "X of Y packed"

## 5. Complete i18n
- Add ~60 new translation keys for: nav items, My Places, Travel Info, Checklist
- Wire up existing untranslated strings in Itinerary.tsx
- Audit all pages for hardcoded English

## 6. Routing & Nav updates
- Replace `/restaurants` → `/places` (MyPlaces)
- Add `/info` (TravelInfo)
- Add `/checklist` (Checklist)
- Nav icons: MapPinned (Places), Info (Info), CheckSquare (Checklist)

## Files to modify
- `backend/database.py` — 2 new tables + seeds
- `backend/main.py` — ~8 new endpoints
- `src/lib/api.ts` — 2 new types + ~8 new functions
- `src/pages/Restaurants.tsx` → delete, replace with `MyPlaces.tsx`
- `src/pages/Itinerary.tsx` — swap restaurant → places, add map embed
- NEW `src/pages/TravelInfo.tsx`
- NEW `src/pages/Checklist.tsx`
- `src/App.tsx` — update routes
- `src/components/Navbar.tsx` — update nav items
- `src/i18n/translations.ts` — ~60 new keys
