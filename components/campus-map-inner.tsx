"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";
import { formatTime } from "@/lib/time";

/* Fit map bounds to scheduled events when exporting */
function FitBoundsOnExport({
  points,
  isExporting,
  routeBoundsRef,
}: {
  points: { lat: number; lng: number }[];
  isExporting: boolean;
  routeBoundsRef?: React.MutableRefObject<L.LatLngBounds | null>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!isExporting || points.length === 0) return;

    // Temporarily allow fractional zoom for a tight fit
    const prevSnap = map.options.zoomSnap;
    map.options.zoomSnap = 0;

    const routeBounds = routeBoundsRef?.current;
    const bounds =
      routeBounds && routeBounds.isValid()
        ? routeBounds
        : L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));

    const zoom = Math.min(map.getBoundsZoom(bounds, false, L.point(40, 40)), 18);
    map.setView(bounds.getCenter(), zoom, { animate: false });

    return () => {
      map.options.zoomSnap = prevSnap;
    };
  }, [isExporting, points, map, routeBoundsRef]);

  return null;
}

/* =========================
   Dot Offset Logic
========================= */

// Same-location threshold (~1–2m)
const LOCATION_KEY_DECIMALS = 5;
const OFFSET_RADIUS_DEG = 0.00012;

function locationKey(lat: number, lng: number): string {
  return `${lat.toFixed(LOCATION_KEY_DECIMALS)},${lng.toFixed(
    LOCATION_KEY_DECIMALS
  )}`;
}

function useOffsetPositions(
  events: (Event | ScheduledEvent)[]
): Map<string, [number, number]> {
  return useMemo(() => {
    const keyToEvents = new Map<string, (Event | ScheduledEvent)[]>();

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

/* =========================
   Icon Logic
========================= */

const NAVY = "#022851";

function createAvailableIcon(): L.DivIcon {
  const size = 20;
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:white;border:2px solid ${NAVY};box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>`;
  return L.divIcon({
    html,
    className: "event-marker-available",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createHoveredIcon(): L.DivIcon {
  const size = 20;
  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:#daaa00;
      border:2px solid ${NAVY};
      box-shadow:0 0 0 2px rgba(218,170,0,0.3);
      transform:scale(1.15);
      transition:all 0.2s ease;
    "></div>
  `;
  return L.divIcon({
    html,
    className: "event-marker-hovered",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createScheduledNumberedIcon(
  number: number,
  withRipple: boolean
): L.DivIcon {
  const size = 20;

  const html = `
    <div class="scheduled-marker">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="position:absolute;top:0;left:0;">
        <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
              fill="white" font-size="10" font-weight="bold">${number}</text>
      </svg>
      ${withRipple ? `<span class="scheduled-ripple"></span>` : ""}
    </div>
  `;

  return L.divIcon({
    html,
    className: "event-marker-scheduled",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/* =========================
   Component
========================= */

interface Props {
  events: Event[];
  scheduledEvents: ScheduledEvent[];
  hoveredEvent: string | null;
  setHoveredEvent: (id: string | null) => void;
  onMarkerClick?: (eventId: string) => void;
  resultsPage: number;
  pageSize: number;
  recentlyAddedId: string | null;
  isExporting?: boolean;
}

export default function CampusMapInner({
  events,
  scheduledEvents,
  hoveredEvent,
  setHoveredEvent,
  onMarkerClick,
  resultsPage,
  pageSize,
  recentlyAddedId,
  isExporting,
}: Props) {
  /* Leaflet icon fix */
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

  const routePoints = scheduledEvents.map((e) => ({
    lat: e.lat,
    lng: e.lng,
  }));

  /* Events to show on map */
  const eventsOnMap = useMemo(() => {
    if (isExporting) {
      return scheduledEvents as (Event | ScheduledEvent)[];
    }

    const eventsForCurrentPage = events.slice(
      resultsPage * pageSize,
      (resultsPage + 1) * pageSize
    );

    const byId = new Map<string, Event | ScheduledEvent>();

    scheduledEvents.forEach((e) => byId.set(e.id, e));
    eventsForCurrentPage.forEach((e) => {
      if (!byId.has(e.id)) byId.set(e.id, e);
    });

    if (hoveredEvent) {
      const hovered = events.find((e) => e.id === hoveredEvent);
      if (hovered && !byId.has(hovered.id)) byId.set(hovered.id, hovered);
    }

    return Array.from(byId.values());
  }, [events, scheduledEvents, resultsPage, pageSize, hoveredEvent, isExporting]);

  /* Offset positions */
  const offsetPositions = useOffsetPositions(eventsOnMap);

  /* Icons */
  const availableIcon = useMemo(() => createAvailableIcon(), []);
  const hoveredIcon = useMemo(() => createHoveredIcon(), []);

  const markerRefs = useRef(new Map<string, L.Marker>());
  const routeBoundsRef = useRef<L.LatLngBounds | null>(null);

  /* Close all tooltips when export starts */
  useEffect(() => {
    if (isExporting) {
      markerRefs.current.forEach((m) => m.closeTooltip());
    }
  }, [isExporting]);

  /* Auto-open tooltip on hover (suppressed during export) */
  useEffect(() => {
    if (isExporting) return;

    if (!hoveredEvent) {
      markerRefs.current.forEach((m) => m.closeTooltip());
      return;
    }

    const openHovered = () => {
      const marker = markerRefs.current.get(hoveredEvent);
      if (marker) marker.openTooltip();
      markerRefs.current.forEach((marker, id) => {
        if (id !== hoveredEvent) marker.closeTooltip();
      });
    };

    openHovered();
    const t = requestAnimationFrame(openHovered);
    return () => cancelAnimationFrame(t);
  }, [hoveredEvent, isExporting]);

  function FlyToHoveredEvent({
    hoveredEvent,
    events,
  }: {
    hoveredEvent: string | null
    events: (Event | ScheduledEvent)[]
  }) {
    const map = useMap()

    useEffect(() => {
      if (!hoveredEvent) return

      const event = events.find((e) => e.id === hoveredEvent)
      if (!event) return

      map.panTo([event.lat, event.lng], {
        animate: true,
        duration: 0.5,
      })
    }, [hoveredEvent, events, map])

    return null
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden w-full flex-1 min-h-[400px]">
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
        preferCanvas={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {eventsOnMap.map((event) => {
          const scheduleIndex = scheduleIndexByEventId.get(event.id);
          const isScheduled = scheduleIndex != null;
          const isHovered = hoveredEvent === event.id;
          const isNewlyAdded = recentlyAddedId === event.id;

          const [lat, lng] =
            offsetPositions.get(event.id) ?? [event.lat, event.lng];

          const icon = isScheduled
            ? createScheduledNumberedIcon(scheduleIndex!, isNewlyAdded)
            : isHovered
            ? hoveredIcon
            : availableIcon;

          return (
            <Marker
              key={event.id}
              ref={(el) => {
                if (el) markerRefs.current.set(event.id, el);
                else markerRefs.current.delete(event.id);
              }}
              position={[lat, lng]}
              icon={icon}
              zIndexOffset={isScheduled ? 100 : isHovered ? 50 : 0}
              eventHandlers={{
                mouseover: () => setHoveredEvent(event.id),
                mouseout: () => setHoveredEvent(null),
                click: () => onMarkerClick?.(event.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -12]}
                opacity={1}
                permanent={isHovered && !isExporting}
              >
                <div className="font-medium">{event.name}</div>
                <div className="text-muted-foreground text-xs">
                  {formatTime(event.startTime)}
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        <FitBoundsOnExport
          points={routePoints}
          isExporting={!!isExporting}
          routeBoundsRef={routeBoundsRef}
        />
        <FlyToHoveredEvent
          hoveredEvent={hoveredEvent}
          events={eventsOnMap}
        />
        <RoutingMachine
          points={routePoints}
          onRouteBounds={(bounds) => { routeBoundsRef.current = bounds; }}
        />
      </MapContainer>
    </div>
  );
}