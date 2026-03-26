# Sydney 2026 — Family Trip Planner

A travel planning website for a family trip to Sydney, Australia (July 2026). Built with React + FastAPI + SQLite.

## Features

- **Trip Overview** — Hero banner, trip details, budget summary, attraction highlights
- **Day-by-Day Itinerary** — 6-day plan with interactive Google Maps, clickable attractions
- **My Places** — CRUD for saving restaurants, cafes, and attractions with Google Maps embeds
- **Budget Tracker** — Track expenses in TWD & AUD with auto currency conversion (1 AUD = 20.5 TWD)
- **Travel Info** — Weather, power sockets, currency, emergency numbers, family tips
- **Packing Checklist** — Pre-seeded with 33 items, full CRUD, progress tracking
- **Bilingual** — English and Traditional Chinese (toggle in navbar)
- **7 Themes** — Light, Dark, Ocean, Sunset, Forest, Slate, Sakura

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.10+

## Installation

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd sydney_trip_website
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Start the backend (FastAPI + SQLite)

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

The backend will automatically create the SQLite database (`backend/sydney_trip.db`) and seed it with default budgets, attractions, restaurants, and checklist items on first run.

### 5. Start the frontend (in a separate terminal)

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend on port 8001 (configured in `vite.config.ts`).

## Project Structure

```
sydney_trip_website/
├── backend/
│   ├── main.py           # FastAPI app with all API endpoints
│   ├── database.py        # SQLite setup, migrations, seed data
│   ├── requirements.txt   # Python dependencies
│   └── sydney_trip.db     # SQLite database (auto-created)
├── src/
│   ├── pages/             # React pages (Overview, Itinerary, MyPlaces, Budget, TravelInfo, Checklist)
│   ├── components/        # Navbar, PageHero, Toast, ThemeToggle, shadcn-ui components
│   ├── hooks/             # useBudget custom hook
│   ├── data/              # Static trip data (itinerary, budget categories)
│   ├── i18n/              # Translations (EN/ZH) and language context
│   └── lib/               # API client, utilities
├── Dockerfile             # Multi-stage build for Railway deployment
├── railway.toml           # Railway deployment config
└── vite.config.ts         # Vite config with API proxy
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List all budget categories |
| PUT | `/api/budgets/{category}` | Update a budget amount |
| GET | `/api/expenses` | List all expenses |
| POST | `/api/expenses` | Add an expense |
| PUT | `/api/expenses/{id}` | Update an expense |
| DELETE | `/api/expenses/{id}` | Delete an expense |
| GET | `/api/attractions` | List all attractions |
| GET | `/api/places` | List all saved places |
| POST | `/api/places` | Add a place |
| PUT | `/api/places/{id}` | Update a place |
| DELETE | `/api/places/{id}` | Delete a place |
| GET | `/api/checklist` | List all checklist items |
| POST | `/api/checklist` | Add a checklist item |
| PUT | `/api/checklist/{id}` | Update a checklist item |
| DELETE | `/api/checklist/{id}` | Delete a checklist item |

## Deployment (Railway)

The app is configured for one-click deployment on [Railway](https://railway.app):

1. Push to GitHub
2. Create a new Railway project and connect the repo
3. Railway auto-builds using the `Dockerfile` (Node for frontend + Python for backend)
4. Generate a public domain in Settings > Networking

The `Dockerfile` builds the React frontend and serves it as static files from FastAPI, so everything runs as a single service.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn-ui
- **Backend:** FastAPI, SQLite, Pydantic
- **Icons:** Lucide React
- **Deployment:** Docker, Railway
