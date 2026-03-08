import { v4 as uuid } from "uuid";
import { COLUMN_MAP } from "./columnMap";

export function normalizeEvent(row: Record<string, string>) {
  // initialize location object with all possible fields set to null
  const location: Record<string, any> = {
      name: null,
      address: null,
      latitude: null,
      longitude: null,
  };

  // if there is a "Coordinates" column, attempt to parse it and set the latitude and longitude fields in the location object
  const coordinateString = row["Coordinates"];
  if (coordinateString) {
    const cleaned = coordinateString
      .replace("−", "-") // normalize the -'s
      .replace(/\s/g, ""); // remove all whitespace

      const [lat, lng] = cleaned.split(",");

      if (lat && lng) {
        location.latitude = parseFloat(lat);
        location.longitude = parseFloat(lng);
      }
  }

  // initialize event object with all possible fields set to null
  const event: Record<string, any> = {
      id: null,
      location_id: null,
      name: null,
      description: null,
      category: null,
      popularity: null,
      location_detail: null,
      start_time: null,
      end_time: null,
      showtime: null,
  };


  // loop through each column in the row, and use the COLUMN_MAP to determine how to map it to our event and location objects
  for (const [column, value] of Object.entries(row)) {
      const rule = COLUMN_MAP[column];
      if (!rule) continue;

      if (rule.type === "id") {
        if (rule.target === "events") {
          if (!value || !value.trim()) {
            event.id = uuid();
          } else {
            event.id = value.trim();
          }
        }
      }

      if (rule.type === "field") {
          if (rule.target === "events") {
              event[rule.path] = value;
          }

          if (rule.target === "locations") {
              location[rule.path] = value;
          }

          continue;
      }

      if (rule.type === "tags") {
          event.tags = value
              .split(",")
              .map(tag => tag.trim())
              .filter(Boolean);
      }
  }

  return { event, location };
}