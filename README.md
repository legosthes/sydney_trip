# Sydney 2026 — Family Trip Planner

A quiet, editorial planner for a family trip to Sydney, Australia (July 2026). Built with React + FastAPI + SQLite.

## Features

- **Overview** — Hero carousel built from attraction photos, About + trip stats, dossier strip (dates/travelers/hotel/flights), budget summary, featured-day card, week-at-a-glance package strip, saved-places gallery, big wordmark footer.
- **Itinerary** — 6-day plan with a drag-and-drop slot board (Morning / Breakfast / Afternoon / Lunch / Evening / Dinner). Each day has an editable title and a swappable cover photo, picked from photos of the places you've already slotted into that day.
- **My Places** — CRUD for saving restaurants, cafes, attractions, and other spots. Each place gets a Google Maps embed; places dropped into itinerary slots are marked as "planned".
- **Budget** — Track expenses in TWD and AUD. AUD amounts are converted using a live exchange rate fetched from [open.er-api.com](https://open.er-api.com), refreshed every 4 hours and stamped with the last update time. CSV export.
- **Travel Info** — Weather, power sockets, currency, emergency numbers, family-with-toddler tips.
- **Checklist** — Pre-seeded with 33 items across 6 groups; full CRUD with progress tracking.
- **Bilingual** — English and Traditional Chinese, toggle in the navbar.
- **Light / Dark** — A single sliding theme toggle. Defaults to your OS preference.

## Design

A restrained, editorial register: warm tinted neutrals (OKLCH), bracket-label eyebrows (`[Like This]`), display-weight headlines, image cards with bottom-anchored captions, and a big `SYDNEY` wordmark in the footer. Motion stays calm (ease-out-quint curves, no bounce); `prefers-reduced-motion` is respected.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.10+

## Local Development

### 1. Install

```bash
git clone <your-repo-url>
cd sydney_trip
npm install
pip install -r backend/requirements.txt
```

### 2. Start the backend (FastAPI + SQLite)

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

On first run, the backend creates `backend/sydney_trip.db` and seeds it with default budgets, attractions, restaurants, day-customizations, itinerary-slot tables, and checklist items.

### 3. Start the frontend (in a separate terminal)

```bash
npm run dev
```

The frontend runs on [http://localhost:5173](http://localhost:5173) and proxies `/api/*` to the backend on port 8001 (see `vite.config.ts`).

## Project Structure

```
sydney_trip/
├── backend/
│   ├── main.py             # FastAPI app, all API endpoints
│   ├── database.py         # SQLite schema, migrations, seed data
│   ├── requirements.txt
│   └── sydney_trip.db      # auto-created on first run
├── src/
│   ├── pages/              # Overview, Itinerary, MyPlaces, Budget, TravelInfo, Checklist
│   ├── components/         # Navbar, PageHero, ThemeToggle, Toast, shadcn-ui primitives
│   ├── hooks/              # useBudget (loads rate, computes totals)
│   ├── data/               # Static trip metadata (itinerary, budget categories, rate fetch)
│   ├── i18n/               # EN/ZH translation map, LanguageContext
│   ├── lib/                # API client, utils
│   └── index.css           # Tokens, typography utilities, motion utilities
├── Dockerfile              # Multi-stage build (Node → Python)
├── railway.toml            # Railway deployment config
└── vite.config.ts          # Dev proxy to :8001
```

## API

### Budget & expenses
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/budgets` | List budget categories |
| PUT    | `/api/budgets/{category}` | Update a budget |
| GET    | `/api/expenses` | List expenses |
| POST   | `/api/expenses` | Create an expense |
| PUT    | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |

### Places (user-added)
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/places` | List places |
| GET    | `/api/places/by-day/{day_label}` | Places tagged with a given day |
| POST   | `/api/places` | Create a place |
| PUT    | `/api/places/{id}` | Update a place |
| DELETE | `/api/places/{id}` | Delete a place |

### Itinerary slots
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/itinerary/slots` | List all slots |
| GET    | `/api/itinerary/slots/{day_number}` | Slots for a day |
| POST   | `/api/itinerary/slots` | Add a place to a slot |
| DELETE | `/api/itinerary/slots/{slot_id}` | Remove a slot entry |

### Day customizations (title / cover photo overrides per day)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/day-customizations` | List per-day overrides |
| PUT | `/api/day-customizations/{day_number}` | Upsert title and/or `image_url` |

### Attractions & restaurants (seed-only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attractions` | Curated list of Sydney attractions |
| GET | `/api/restaurants` | Curated list of family-friendly restaurants |
| GET | `/api/restaurants/by-day/{day_label}` | Restaurants tagged with a day |

### Checklist
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/checklist` | List items |
| POST   | `/api/checklist` | Add an item |
| PUT    | `/api/checklist/{id}` | Update an item |
| DELETE | `/api/checklist/{id}` | Delete an item |

## Docker

The Dockerfile builds the React frontend, then copies the static bundle into a Python image that serves both the API and the SPA. Single container, single port.

### Build

```bash
docker build -t sydney-trip .
```

### Run

```bash
docker run -d -p 8000:8000 --restart unless-stopped --name sydney-trip sydney-trip
```

App lives at [http://localhost:8000](http://localhost:8000). With `-p 8000:8000` bound to `0.0.0.0` (Docker's default), other devices on your LAN can hit it at `http://<your-mac-ip>:8000`.

### Persist your local SQLite data

Mount the file directly so the container reads/writes your real database:

```bash
docker run -d -p 8000:8000 --restart unless-stopped \
  -v "$PWD/backend/sydney_trip.db:/app/backend/sydney_trip.db" \
  --name sydney-trip sydney-trip
```

### Stop and rebuild

```bash
docker stop sydney-trip && docker rm sydney-trip
docker build --no-cache -t sydney-trip .
```

## Deployment (Railway)

Configured for one-click deploy on [Railway](https://railway.app):

1. Push to GitHub.
2. Create a Railway project, connect the repo.
3. Railway builds from the `Dockerfile`. No extra config required.
4. Generate a public domain under Settings → Networking.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn-ui, dnd-kit, Lucide icons
- **Backend:** FastAPI, SQLite, Pydantic
- **Fonts:** Geist (variable, sans-serif)
- **Deployment:** Docker, Railway
