# Event Schedule Builder

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://pd-schedule-builder.vercel.app/)

The Picnic Day Schedule Builder helps visitors plan their day at UC Davis's annual Picnic Day event — browse events, build a personalized schedule, and get a walking route, all in one place.

## Overview

Picnic Day features hundreds of activities and locations spread across campus.

**Key features:**
- Browse and search events by category, tag, or keyword
- Interactive campus map with event pins
- Drag-and-drop schedule builder with local persistence
- Walking route directions between scheduled events (Mapbox)
- Export your schedule as PDF or iCalendar (.ics)
- Responsive layout for desktop and mobile

Event data is maintained in a Google Sheets spreadsheet and synced into a local SQLite database. The app exposes the data through API routes that feed the frontend.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Codebase Architecture](#codebase-architecture)
- [Database](#database)
- [Walking Routes](#walking-routes)
- [Contributing](#contributing)
- [Deployment](#deployment)

---

## Getting Started

### Prerequisites

- Node.js 22+ and npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```bash
   CSV_URL=your_google_sheet_csv_url
   SYNC_SECRET=a_secret_bearer_token_you_choose
   ```
   See [Environment Variables](#environment-variables) for the full reference.

3. (Optional) Copy the sample database to skip the first sync:
   ```bash
   cp templates/database.sqlite3 ./volumes/database.sqlite3
   ```
   > An empty database will be created automatically on startup if this step is skipped.

### Running locally

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). The database is initialized on first startup.

### Syncing event data

After the server is running, pull the latest event data from the spreadsheet:

```bash
npx tsx scripts/run-sync.ts
```

Re-run this script any time the spreadsheet changes. You do not need to restart the server after syncing.

---

## Docker Setup

The project includes a `Dockerfile` and `docker-compose.yml` for containerized deployment.

1. Ensure your `.env` file is set up (see [Environment Variables](#environment-variables)).

2. Start the container:
   ```bash
   docker-compose up
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

3. After startup, run the sync script to populate event data:
   ```bash
   npx tsx scripts/run-sync.ts
   ```

**What docker-compose does:**
- Builds the image from the local `Dockerfile`
- Mounts `./volumes/` into the container so the SQLite database persists across restarts
- Loads environment variables from `.env`
- Exposes port 3000

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CSV_URL` | Yes | Google Sheets CSV export URL — the source of all event data |
| `SYNC_SECRET` | Yes (production) | Bearer token used to authenticate the `/api/admin/sync-events` endpoint |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | No | Mapbox public token for walking route directions (see [Walking Routes](#walking-routes)). |
| `DB_PATH` | No | Path to the SQLite database file. Defaults to `./volumes/database.sqlite3` |

**Local development:** put `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local` (gitignored) so it's not committed.

**Vercel deployment:** add all variables under your project's Environment Variables settings.

---

## Codebase Architecture

### Folder structure

```
v0-event-schedule-builder/
├── app/
│   ├── api/
│   │   ├── events/                  # GET /api/events — fetches events from the DB
│   │   └── admin/sync-events/       # POST /api/admin/sync-events — triggers a CSV sync
│   ├── components/
│   │   ├── desktop/                 # Desktop-only layout components
│   │   ├── mobile/                  # Mobile-only layout components
│   │   ├── onboarding/              # Onboarding flow shown to first-time visitors
│   │   ├── campus-map.tsx           # Leaflet map with event markers
│   │   ├── event-list.tsx           # Scrollable event listing
│   │   ├── schedule-panel.tsx       # User's personal schedule
│   │   ├── filter-section.tsx       # Category and tag filters
│   │   ├── search-bar-section.tsx   # Search input and history
│   │   └── routing-machine.tsx      # Walking route overlay on the map
│   ├── hooks/
│   │   ├── useScheduleManager.ts    # Schedule state (add, remove, reorder, persist)
│   │   └── useEventResults.ts       # Filtered and searched event results
│   ├── lib/
│   │   ├── db/
│   │   │   ├── db.ts                # SQLite initialization and schema
│   │   │   ├── queries.ts           # All database queries
│   │   │   └── syncEvents.ts        # CSV download → parse → upsert logic
│   │   ├── exportPdf.ts             # PDF schedule export
│   │   ├── exportIcs.ts             # iCalendar (.ics) export
│   │   ├── searchUtils.ts           # Full-text search algorithm
│   │   ├── eventFilters.ts          # Filter logic (category, tag, time)
│   │   └── fetchEvents.ts           # Client-side API call to /api/events
│   ├── types/                       # Shared TypeScript types
│   ├── page.tsx                     # App entry point
│   └── layout.tsx                   # Root layout
├── scripts/
│   └── run-sync.ts                  # Standalone script to manually trigger a sync
├── templates/
│   └── database.sqlite3             # Sample pre-populated database
├── volumes/
│   └── database.sqlite3             # Runtime database (gitignored)
├── .env                             # Local environment variables (gitignored)
├── template.env                     # Template for deployment env config
├── docker-compose.yml
└── Dockerfile
```

### Data flow

```
Google Sheets (CSV)
         |
         v
scripts/run-sync.ts
(or /api/admin/sync-events)
         |
         v
SQLite DB (volumes/)
         |
         v
   /api/events
         |
         v
  React frontend
       /     \
      v       v
User schedule  Mapbox API
(localStorage) (walking routes)
```

**Adding a new feature:** most feature work touches a component in `app/components/`, a hook in `app/hooks/`, or a utility in `app/lib/`. The database schema lives in `app/lib/db/db.ts` — if you add a column, update the queries in `app/lib/db/queries.ts` to match.

---

## Database

### How it works

Event data is sourced from a Google Sheets CSV export. The sync process:
1. Downloads the CSV from `CSV_URL`
2. Parses each row into an event object
3. Upserts the result into the SQLite database (safe to re-run)

Trigger a sync manually — see [Syncing event data](#syncing-event-data) — or POST to `/api/admin/sync-events` with the `SYNC_SECRET` bearer token to trigger a sync from a running server.

### Schema

The database has 4 tables. The precise schema (column types, constraints) is in `app/lib/db/db.ts`.

**LOCATIONS**
| Column | Description |
|---|---|
| id | Unique location ID |
| name | Location name |
| address | Street address |
| latitude | Map latitude |
| longitude | Map longitude |

**EVENTS**
| Column | Description |
|---|---|
| id | Unique event ID |
| location_id | References LOCATIONS |
| name | Event name |
| description | Event description |
| start_time | Start time |
| end_time | End time |
| category | Event category (e.g. CDF, ENT, EXH) |
| location_detail | Room number, specific spot, etc. |
| show_time | Reserved for future use |

**TAGS**
| Column | Description |
|---|---|
| id | Tag ID |
| name | Tag name |

**EVENT_TAGS**

Many-to-many join table between EVENTS and TAGS.

---

## Walking Routes

Routes between scheduled events use the **Mapbox Directions API** with the **walking** profile so paths follow sidewalks rather than roads.

To enable walking routes:

1. Create a [Mapbox account](https://account.mapbox.com/) and copy your default public access token (or create a new one).
2. Add it to `.env.local` in the project root:
   ```bash
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   ```

If the token is not set, the map falls back to the default routing provider (driving-style routes).

---

## Contributing

### Branch naming

Use the pattern `yourname/short-description`, for example:
```
miguel/pdf-export-fix
jordan/event-cleanup
sruti/mobile-ui
```

### Opening a pull request

1. Push your branch and open a PR against `main`.
2. Fill out the PR template (`.github/pull_request_template.md`) — describe what changed and why, attach screenshots for UI changes, and note anything still broken.
3. Link the relevant issue with `Closes #X` in the PR description.
4. Get at least one review before merging.

### After spreadsheet changes

If event data in Google Sheets was updated, re-run the sync — see [Syncing event data](#syncing-event-data). It's safe to run multiple times.

---

## Deployment

The app is deployed on Vercel:

**[https://pd-schedule-builder.vercel.app/](https://pd-schedule-builder.vercel.app/)**

Set all required environment variables in your Vercel project settings before deploying. After each deployment, trigger a sync via the `/api/admin/sync-events` endpoint or by running the sync script against the production database.
