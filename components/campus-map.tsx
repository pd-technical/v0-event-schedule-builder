"use client";

import dynamic from "next/dynamic";
import type { Event, ScheduledEvent } from "@/app/page";

interface CampusMapProps {
  events: Event[];
  scheduledEvents: ScheduledEvent[];
  hoveredEvent: string | null;
  setHoveredEvent: (id: string | null) => void;
  onMarkerClick?: (eventId: string) => void;
  resultsPage: number;
  pageSize: number;
}

export const CampusMap = dynamic<CampusMapProps>(
  () => import("./campus-map-inner"),
  { ssr: false }
);
