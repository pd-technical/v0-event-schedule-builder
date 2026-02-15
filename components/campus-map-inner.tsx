"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";

//Same-location threshold in degrees (~1–2 m); events within this are grouped for offset
const LOCATION_KEY_DECIMALS = 5;
const OFFSET_RADIUS_DEG = 0.00012; 

function locationKey(lat: number, lng: number): string {
  return `${lat.toFixed(LOCATION_KEY_DECIMALS)},${lng.toFixed(LOCATION_KEY_DECIMALS)}`;
}

//Slight offset [lat, lng] when multiple events have the same location 
function useOffsetPositions(events: Event[]): Map<string, [number, number]> {
  return useMemo(() => {
    const keyToEvents = new Map<string, Event[]>();
    for (const e of events) {
      const key = locationKey(e.lat, e.lng);
      const list = keyToEvents.get(key) ?? [];
      list.push(e);
      keyToEvents.set(key, list);
    }
    const out = new Map<string, [number, number]>();
    for (const [, list] of keyToEvents) {
      const n = list.length;
      for (let i = 0; i < n; i++) {
        const e = list[i];
        if (n === 1) {
          out.set(e.id, [e.lat, e.lng]);
        } else {
          const angle = (2 * Math.PI * i) / n;
          const lat = e.lat + OFFSET_RADIUS_DEG * Math.cos(angle);
          const lng = e.lng + OFFSET_RADIUS_DEG * Math.sin(angle);
          out.set(e.id, [lat, lng]);
        }
      }
    }
    return out;
  }, [events]);
}

function createNumberedCircleIcon(number: number): L.DivIcon {
  const size = 20;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--primary);color:var(--primary-foreground);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;">${number}</div>`;
  return L.divIcon({
    html,
    className: "numbered-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface Props {
  events: Event[];
  scheduledEvents: ScheduledEvent[];
  hoveredEvent: string | null;
  resultsPage: number;
  pageSize: number;
}

function createWhiteCircleIcon(): L.DivIcon {
  const size = 20;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:white;border:2px solid #334155;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></div>`;
  return L.divIcon({
    html,
    className: "event-marker-whites",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createBlueNumberedCircleIcon(number: number): L.DivIcon {
  const size = 24;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#2563eb;color:white;border:2px solid #1e40af;box-shadow:0 1px 3px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;">${number}</div>`;
  return L.divIcon({
    html,
    className: "event-marker-numbered",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function CampusMapInner({
  events,
  scheduledEvents,
  hoveredEvent,
  resultsPage,
  pageSize,
}: Props) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const scheduleIndexByEventId = useMemo(
    () => new Map(scheduledEvents.map((e, i) => [e.id, i + 1])),
    [scheduledEvents]
  );

  const routePoints = scheduledEvents.map(e => ({
    lat: e.lat,
    lng: e.lng,
  }));

  // Show events for the current list page so map stays in sync with next/prev; scheduled get numbers, rest get white dots
  const visibleEvents = useMemo(() => {
    const eventsForCurrentPage = events.slice(
      resultsPage * pageSize,
      (resultsPage + 1) * pageSize
    );
    const byId = new Map<string, Event | ScheduledEvent>();
    scheduledEvents.forEach((e) => byId.set(e.id, e));
    eventsForCurrentPage.forEach((e) => {
      if (!byId.has(e.id)) byId.set(e.id, e);
    });

    // Include hovered event so it appears when hovering in list 
    if (hoveredEvent) {
      const hovered = events.find((e) => e.id === hoveredEvent);
      if (hovered && !byId.has(hovered.id)) byId.set(hovered.id, hovered);
    }
    return Array.from(byId.values());
  }, [events, scheduledEvents, resultsPage, pageSize, hoveredEvent]);

  const offsetPositions = useOffsetPositions(visibleEvents);
  const whiteIcon = useMemo(() => createWhiteCircleIcon(), []);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-[280px] sm:h-[320px] md:h-[480px] w-full">
      <MapContainer
        center={[38.5382, -121.7617]}
        zoom={15}
        minZoom={14}
        maxZoom={18}
        maxBounds={[
          [38.528, -121.775],
          [38.555, -121.735],
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {visibleEvents.map(event => {
          const scheduleIndex = scheduleIndexByEventId.get(event.id);
          const isScheduled = scheduleIndex != null;
          const [lat, lng] = offsetPositions.get(event.id) ?? [event.lat, event.lng];
          return (
            <Marker
              key={event.id}
              position={[lat, lng]}
              icon={
                isScheduled
                  ? createNumberedCircleIcon(scheduleIndex)
                  : whiteIcon
              }
              zIndexOffset={isScheduled ? 100 : 0}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1} className="text-left">
                <div className="font-medium">{event.name}</div>
                <div className="text-muted-foreground text-xs">{event.startTime}</div>
              </Tooltip>
            </Marker>
          );
        })}

        <RoutingMachine points={routePoints} />
      </MapContainer>
    </div>
  );
}
