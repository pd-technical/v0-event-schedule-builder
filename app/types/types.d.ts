type TargetTable = "events" | "locations" | "tags";

type ColumnRule =
  | {
      type: "field";
      target: TargetTable;
      path: string;
    }
  | {
      type: "ignore";
    }
  | {
      type: "id";
      target: "events";
      path: string;
    }
  | {
      type: "tags";
      target: "tags";
    };

export type EventRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  start_time: string | null;
  end_time: string | null;
  location_detail: string | null;
  showtime: string | null;

  location_name: string;
  address: string;
  latitude: number;
  longitude: number;

  tag_name: string;
}

export type ColumnMapType = Record<string, ColumnRule>;