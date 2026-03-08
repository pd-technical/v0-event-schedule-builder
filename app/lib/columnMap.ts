import { ColumnMapType } from "../types/types";

// defines the mapping from the column names in the CSV to the fields in our database.
// Each key is a column name in the CSV, and the value defines how to map that column to our database fields.
// ex: "Event" column in the CSV should be mapped to the "name" field in the "events" table in our database.
export const COLUMN_MAP: ColumnMapType= {
  "Department": {
    type: "field",
    target: "events",
    path: "category",
  },

  "Event ID": {
    type: "id",
    target: "events",
    path: "id",
  },

  "Event": {
    type: "field",
    target: "events",
    path: "name",
  },

  "Description": {
    type: "field",
    target: "events",
    path: "description",
  },

  "Start": {
    type: "field",
    target: "events",
    path: "start_time",
  },

  "End": {
    type: "field",
    target: "events",
    path: "end_time",
  },

  "Showtime (if applicable)": {
    type: "ignore",
  },

  "Location": {
    type: "field",
    target: "locations",
    path: "name",
  },

  "Location Details": {
    type: "field",
    target: "events",
    path: "location_detail",
  },

  "Address": {
    type: "field",
    target: "locations",
    path: "address",
  },
  "Tags": {
    type: "tags",
    target: "tags",
  },
};
