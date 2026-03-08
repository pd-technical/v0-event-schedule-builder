import db from "./db";
import { EventRow } from "@/app/types/types"

export const getEvents = () => {
  const rows = db.prepare(`
    SELECT 
      events.*,

      locations.name AS location_name,
      locations.address,
      locations.latitude,
      locations.longitude,

      tags.name AS tag_name
    FROM events
    LEFT JOIN locations
      ON events.location_id = locations.id
    
    LEFT JOIN event_tags
      on events.id = event_tags.event_id

    LEFT JOIN tags
      on event_tags.tag_id = tags.id
      
    `).all() as EventRow[];

    const eventsMap = new Map<string, any>();

    for (const row of rows) {
      // if event is new, add it to the map
      if (!eventsMap.has(row.id)) {
        eventsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          start_time: row.start_time,
          end_time: row.end_time,
          location_detail: row.location_detail,
          showtime: row.showtime,
          location: {
            name: row.location_name,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude
          },
          tags: []
        });
      }

      // if there's a tag, add it to the event's tags array
      if (row.tag_name) {
        eventsMap.get(row.id).tags.push(row.tag_name);
      }
    }

    const events = Array.from(eventsMap.values());
    
    return events;
};