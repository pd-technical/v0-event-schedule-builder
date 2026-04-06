"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";
import { renderToStaticMarkup } from "react-dom/server";
import { LuUtensils } from "react-icons/lu";
import { Check, CheckCheck } from "lucide-react";

const NAVY = "#123c73";
const GOLD = "#ffbf00";
const GOLD_DARK = "#d89f00";

function isFoodTruck(event: Event | ScheduledEvent) {
  return event.tags?.some(
    (tag) => tag.toLowerCase().includes("food")
  );
}

function createFoodTruckIcon(): L.DivIcon {
  const size = 28;

  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:white;
      border:2px solid ${GOLD};
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:17px;
      line-height:1;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">
      ${renderToStaticMarkup(<LuUtensils color={GOLD_DARK} />)}
    </div>
  `;

  return L.divIcon({
    html,
    className: "event-marker-foodtruck",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getMarkerIcon({
  event,
  isScheduled,
  scheduleIndex,
  isHovered,
  isNewlyAdded,
  icons
}: {
  event: Event | ScheduledEvent
  isScheduled: boolean
  scheduleIndex?: number
  isHovered: boolean
  isNewlyAdded: boolean
  icons: {
    available: L.DivIcon
    hovered: L.DivIcon
    foodTruck: L.DivIcon
  }
}) {
  if (isScheduled) {
    return createScheduledNumberedIcon(scheduleIndex!, isNewlyAdded);
  }

  if (isFoodTruck(event)) {
    return icons.foodTruck;
  }

  if (isHovered) {
    return icons.hovered;
  }

  return icons.available;
}

/* Re-tile when container resizes (prevents gray area at bottom) */
function InvalidateSizeOnResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  return null;
}

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

    const pointsBounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    const routeBounds = routeBoundsRef?.current;
    // Always include all pin locations; extend with route geometry if available
    const bounds =
      routeBounds && routeBounds.isValid()
        ? routeBounds.extend(pointsBounds)
        : pointsBounds;

    const zoom = Math.min(map.getBoundsZoom(bounds, false, L.point(80, 80)), 18);
    map.setView(bounds.getCenter(), zoom, { animate: false });

    return () => {
      map.options.zoomSnap = prevSnap;
    };
  }, [isExporting, points, map, routeBoundsRef]);

  return null;
}

/* Fit map to show all search result markers when the events list changes */
function FitBoundsToSearchResults({
  events,
  skip,
}: {
  events: (Event | ScheduledEvent)[];
  skip?: boolean;
}) {
  const map = useMap();
  const prevEventsKeyRef = useRef<string>("");

  useEffect(() => {
    if (skip || events.length === 0) return;

    const eventsKey = events.map((e) => e.id).join(",");
    if (eventsKey === prevEventsKeyRef.current) return;
    prevEventsKeyRef.current = eventsKey;

    const bounds = L.latLngBounds(
      events.map((e) => [e.lat, e.lng] as [number, number])
    );
    const padding = L.point(48, 48);
    const maxZoom = 18;
    const zoom = Math.min(
      map.getBoundsZoom(bounds, false, padding),
      maxZoom
    );
    map.setView(bounds.getCenter(), zoom, { animate: true, duration: 0.4 });
  }, [events, map, skip]);

  return null;
}

/* =========================
   Dot Offset Logic
========================= */

// Same-location threshold (~1–2m)
const LOCATION_KEY_DECIMALS = 5;

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
          // radius grows with number of points
          const radius = 0.0001 + i * 0.00005;

          const angle = i * 0.8; // spiral instead of circle

          const lat = e.lat + radius * Math.cos(angle);
          const lng = e.lng + radius * Math.sin(angle);

          out.set(e.id, [lat, lng]);
        }
      }
    }

    return out;
  }, [events]);
}

function FlyToHoveredEvent({
    hoveredEvent,
    events,
    shouldPan,
  }: {
    hoveredEvent: string | null
    events: (Event | ScheduledEvent)[]
    shouldPan: boolean
  }) {
    const map = useMap()

    useEffect(() => {
      if (!shouldPan || !hoveredEvent) return

      const event = events.find((e) => e.id === hoveredEvent)
      if (!event) return

      map.panTo([event.lat, event.lng], {
        animate: true,
        duration: 2.0,
      })
    }, [hoveredEvent, events, map, shouldPan])

    return null
  }

/* =========================
   Icon Logic
========================= */

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
      background:${GOLD};
      border:2px solid ${NAVY};
      box-shadow:0 0 0 2px rgba(255,191,0,0.3);
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
  browseEvents: Event[];
  scheduledEvents: ScheduledEvent[];
  hoveredEvent: string | null;
  setHoveredEvent: (id: string | null) => void;
  shouldPanToHovered?: boolean;
  onMarkerClick?: (eventId: string) => void;
  resultsPage: number;
  pageSize: number;
  recentlyAddedId: string | null;
  isExporting?: boolean;
}

export default function CampusMapInner({
  events,
  browseEvents,
  scheduledEvents,
  hoveredEvent,
  setHoveredEvent,
  shouldPanToHovered = false,
  onMarkerClick,
  resultsPage,
  pageSize,
  recentlyAddedId,
  isExporting,
}: Props) {
  const [showScheduleOnly, setShowScheduleOnly] = useState(false)
  const [showFoodOnly, setShowFoodOnly] = useState(false);
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

    const eventsForCurrentPage = browseEvents.slice(
      resultsPage * pageSize,
      (resultsPage + 1) * pageSize
    );

    const hovered = hoveredEvent
      ? browseEvents.find((e) => e.id === hoveredEvent)
      : undefined;

    const byId = new Map<string, Event | ScheduledEvent>();

    // base set:
    // - if schedule is on, show scheduled events
    // - otherwise show scheduled + current page events + hovered
    if (showScheduleOnly) {
      scheduledEvents.forEach((e) => byId.set(e.id, e));
    } else {
      scheduledEvents.forEach((e) => byId.set(e.id, e));
      eventsForCurrentPage.forEach((e) => {
        if (!byId.has(e.id)) byId.set(e.id, e);
      });

      if (hovered && !byId.has(hovered.id)) {
        byId.set(hovered.id, hovered);
      }
    }

    // food toggle is additive:
    // add food events on top of whatever is already visible
    if (showFoodOnly) {
      events.forEach((e) => {
        if (isFoodTruck(e) && !byId.has(e.id)) {
          byId.set(e.id, e);
        }
      });
    }

    return Array.from(byId.values());
  }, [
    events,
    browseEvents,
    scheduledEvents,
    resultsPage,
    pageSize,
    hoveredEvent,
    isExporting,
    showScheduleOnly,
    showFoodOnly,
  ]);

  /* Offset positions */
  const offsetPositions = useOffsetPositions(eventsOnMap);

  /* Icons */
  const icons = useMemo(() => ({
    available: createAvailableIcon(),
    hovered: createHoveredIcon(),
    foodTruck: createFoodTruckIcon()
  }), []);

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

  const handleRouteBounds = useCallback((bounds: L.LatLngBounds) => {
    routeBoundsRef.current = bounds;
  }, []);

  return (
    <div
      data-onboarding="campus-map"
      className="relative w-full min-h-[320px] h-[400px] lg:h-auto lg:flex-1 lg:min-h-0"
    >
      <div className="absolute bottom-4 left-4 z-[2000]">
      <div className="rounded-xl border border-border/70 bg-card/90 px-2.5 py-2 shadow-lg backdrop-blur-md">
        
        <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Map filters
        </div>

        <div className="flex items-center gap-2">
          
          {/* Schedule */}
          <button
            type="button"
            onClick={() => setShowScheduleOnly((prev) => !prev)}
            aria-pressed={showScheduleOnly}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.96] ${
              showScheduleOnly
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-primary hover:bg-secondary"
            }`}
          >
            <Check className="h-3 w-3" />
            Schedule
          </button>

          {/* Food */}
          <button
            type="button"
            onClick={() => setShowFoodOnly((prev) => !prev)}
            aria-pressed={showFoodOnly}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-[0.96] ${
              showFoodOnly
                ? "bg-accent text-accent-foreground shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            <LuUtensils size={12} />
            Food
          </button>

        </div>
      </div>
    </div>
      <MapContainer
        className="h-full w-full"
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
        <InvalidateSizeOnResize />

        {eventsOnMap.map((event) => {
          const scheduleIndex = scheduleIndexByEventId.get(event.id);
          const isScheduled = scheduleIndex != null;
          const isHovered = hoveredEvent === event.id;
          const isNewlyAdded = recentlyAddedId === event.id;

          const [lat, lng] =
            offsetPositions.get(event.id) ?? [event.lat, event.lng];

          const icon = getMarkerIcon({
            event,
            isScheduled,
            scheduleIndex,
            isHovered,
            isNewlyAdded,
            icons
          });

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
                  {event.startTime}
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
        <FitBoundsToSearchResults
          events={showFoodOnly ? eventsOnMap : browseEvents}
          skip={!!isExporting || shouldPanToHovered}
        />
        <FlyToHoveredEvent
          hoveredEvent={hoveredEvent}
          events={eventsOnMap}
          shouldPan={shouldPanToHovered}
        />
        <RoutingMachine
          points={routePoints}
          onRouteBounds={handleRouteBounds}
        />
      </MapContainer>
    </div>
  );
}