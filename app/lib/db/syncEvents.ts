import db from "@/app/lib/db/db";
import { normalizeEvent } from "@/app/lib/normalizeEvent";
import { parse } from "csv-parse/sync";
import { v4 as uuidv4 } from "uuid";

type CSVRow = Record<string, string>; // keys and values are strings

const CSV_URL = process.env.CSV_URL;

async function sync () {
  if (!CSV_URL) {
    throw new Error("CSV_URL is not defined in the environment variables");
  }

  // fetch the CSV file from the provided URL
  const res = await fetch(CSV_URL);
  const csvText = await res.text();

  // convert each line into a json object using the first row as column headers
  const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
  }) as CSVRow[];
  const csvEventIds: string[] = [];

  for (const row of rows) {
    const { event, location } = normalizeEvent(row);
    csvEventIds.push(event.id);
    // insert the event and locations into the database
    // if the location already exists (based on name), update it with any new information and return the id. If it doesn't exist, create it and return the new id.
    const locationRow = db.prepare(`
      INSERT INTO locations (id, name, address, latitude, longitude)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(name) 
      DO UPDATE SET
        address=excluded.address,
        latitude=excluded.latitude,
        longitude=excluded.longitude
      RETURNING id
    `).get(
      uuidv4(),
      location.name,
      location.address,
      location.latitude,
      location.longitude
    ) as { id: string } | undefined;

    const locationId = locationRow?.id ?? null;

    db.prepare(`
      INSERT INTO events (id, location_id, name, description, category, start_time, end_time, location_detail, showtime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        location_id=excluded.location_id,
        name=excluded.name,
        description=excluded.description,
        category=excluded.category,
        start_time=excluded.start_time,
        end_time=excluded.end_time,
        location_detail=excluded.location_detail,
        showtime=excluded.showtime
    `).run(
      event.id,
      locationId,
      event.name,
      event.description,
      event.category,
      event.start_time,
      event.end_time,
      event.location_detail,
      event.showtime
    );

    // insert tags and event_tags
    for (const tag of event.tags || []) {
      const tagRow = db.prepare(`
        INSERT INTO tags (id, name)
        VALUES (?, ?)
        ON CONFLICT(name) DO UPDATE SET name=excluded.name
        RETURNING id
      `).get(uuidv4(), tag) as { id: string } | undefined;

      const tagId = tagRow?.id ?? null;

      if (tagId) {
        db.prepare(`
          INSERT INTO event_tags (event_id, tag_id)
          VALUES (?, ?)
          ON CONFLICT(event_id, tag_id) DO NOTHING
        `).run(event.id, tagId);
      }
    }
  }
  // cleanup removed events
  const placeholders = csvEventIds.map(() => "?").join(", ");
  if (placeholders.length > 0) {
    db.prepare(`
      DELETE FROM event_tags
      WHERE event_id NOT IN (${placeholders})
    `).run(...csvEventIds);
    db.prepare(`
      DELETE FROM events
      WHERE id NOT IN (${placeholders})
    `).run(...csvEventIds);
  }
}

export default sync;