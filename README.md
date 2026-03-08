# Event schedule builder

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/technical-5785s-projects/v0-event-schedule-builder)

## Overview

The Picnic Day Schedule Builder helps visitors plan their day at UC Davis's annual Picnic Day event. Picnic Day features over a hundred different activities and locations of interest spread out all over campus. The team wanted a central page that allows attendees to explore and plan their day efficiently.

This tool allows users to browse events, explore locations through an interactive map, and build a personalized schedule and walking route for the day.

Event data is maintained in the MyMaps Google Sheets, and synchronized into a local SQLite database. The application then exposes the data through API routes that feed the data to the front end.

## Deployment

Your project is live at:

**[https://vercel.com/technical-5785s-projects/v0-event-schedule-builder](https://vercel.com/technical-5785s-projects/v0-event-schedule-builder)**

# Build your app

## Initialize and Sync the Picnic Day Database
1. Install dependencies
`npm install`

2. Create .env 
`CSV_URL=your_google_sheet_csv_url`

3. Initialize the database
`npx tsx scripts/init-db.ts`

4. Sync events from the spreadsheet
`npx tsx scripts/run-sync.ts`

5. Updating the database later (if spreadsheet changes)
Run `npx tsx scripts/run-sync.ts` once more, and rerun the server.

## Walking routes on the map

Routes between scheduled events use **Mapbox Directions API** with the **walking** profile so paths follow sidewalks and pedestrian-appropriate routes instead of driving roads.

To enable walking routes:

1. Create a [Mapbox account](https://account.mapbox.com/) and copy your **default public access token** (or create a new one).
2. Add it to your environment:
   - **Local:** create `.env.local` in the project root and add:
     ```bash
     NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
     ```
   - **Vercel:** in your project settings, add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` as an environment variable.

If the token is not set, the map falls back to the default routing provider (driving-style routes).

# More information about the Picnic Day Database.
## How it Works
### CSV Source
Event data comes from the Google Sheets CSV export.
`sync-csv`:
- downloads the CSV
- parses each row
- converts row into event object
- upserts the database

### Database Schema
The database has 4 main tables.
The precise schema can be found in `init-db`

LOCATIONS:
| Column | Description |
|-------------|------|
| id | unique location ID |
| name | location name |
| address | location address |
| latitude | map latitude |
| longitude | map longitude |

EVENTS: 
| Column | Description |
|-------------|------|
| id | unique location ID |
| location_id | references to the location table |
| name | event name |
| description | event description |
| start_time | start time |
| end_time | end time |
| category | event category (ex: CDF, ENT, EXH, etc) |
| location_detail | specifities (room number, in front, to the side, etc) |
| show_time | n/a for now, here only because some events might require in the future |


TAGS:
| Column | Description |
|-------------|------|
| id | tag id |
| name | tag name |

EVENT_TAGS:
Many-to-many relationship between events and tags.