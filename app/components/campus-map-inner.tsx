"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";
import { renderToStaticMarkup } from "react-dom/server";
import { LuUtensils, LuToilet } from "react-icons/lu";

const NAVY = "#123c73";
const GOLD = "#ffbf00";
const GOLD_DARK = "#d89f00";

function isFoodTruck(event: Event | ScheduledEvent) {
  return event.tags?.some(
    (tag) => tag.toLowerCase().includes("food")
  );
}

function isRestroom(event: Event | ScheduledEvent) {
  return event.tags?.some(
    (tag) => tag.toLowerCase().includes("restroom")
  );
}

function createFoodTruckIcon(): L.DivIcon {
  const size = 20;

  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:white;
      border:1.8px solid ${GOLD};
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:17px;
      line-height:1;
      box-shadow:0 1px 3px rgba(0,0,0,0.15);
    ">
      ${renderToStaticMarkup(<LuUtensils size={10} color={GOLD_DARK} />)}
    </div>
  `;

  return L.divIcon({
    html,
    className: "event-marker-foodtruck",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createRestroomIcon(): L.DivIcon {
  const size = 20;

  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:white;
      border:1.8px solid ${NAVY};
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:17px;
      line-height:1;
      box-shadow:0 1px 3px rgba(0,0,0,0.15);
    ">
      ${renderToStaticMarkup(<LuToilet size={10} color={NAVY} />)}
    </div>
  `;

  return L.divIcon({
    html,
    className: "event-marker-restroom",
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
    restroom: L.DivIcon
  }
}) {
  if (isScheduled) {
    return createScheduledNumberedIcon(scheduleIndex!, isNewlyAdded);
  }

  if (isFoodTruck(event)) {
    return icons.foodTruck;
  }

  if (isRestroom(event)) {
    return icons.restroom;
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
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:white;border:1.5px solid rgba(18,60,115,0.6);box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>`;
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
      background:${NAVY};
      border:2px solid white;
      box-shadow:0 0 0 2px rgba(18,60,115,0.25);
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
  const size = 18;

  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${NAVY};
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 1px 3px rgba(0,0,0,0.2);
      position:relative;
    ">
      <span style="
        color:white;
        font-size:8px;
        font-weight:600;
      ">
        ${number}
      </span>
      ${withRipple ? `<span class="scheduled-ripple"></span>` : ""}
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
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
  const [showRestroomOnly, setShowRestroomOnly] = useState(false);
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

    if (showRestroomOnly) {
      events.forEach((e) => {
        if (isRestroom(e) && !byId.has(e.id)) {
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
    showRestroomOnly,
  ]);

  /* Offset positions */
  const offsetPositions = useOffsetPositions(eventsOnMap);

  /* Icons */
  const icons = useMemo(() => ({
    available: createAvailableIcon(),
    hovered: createHoveredIcon(),
    foodTruck: createFoodTruckIcon(),
    restroom: createRestroomIcon(),
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
        <div
          className="rounded-2xl bg-white/95 backdrop-blur px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 flex flex-col gap-2"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            Show on map
          </div>

          <div className="flex items-center gap-2">
            {/* Schedule Mode */}
            <button
              onClick={() => setShowScheduleOnly((prev) => !prev)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{
                background: showScheduleOnly ? NAVY : "white",
                color: showScheduleOnly ? "white" : NAVY,
                border: `1.5px solid ${NAVY}`,
                boxShadow: showScheduleOnly
                  ? "0 0 0 2px rgba(18,60,115,0.18)"
                  : "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <span
                className="shrink-0"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "999px",
                  background: GOLD,
                  boxShadow: "0 0 0 2px rgba(255,191,0,0.18)",
                }}
              />
              <span className="tracking-tight">Scheduled</span>
            </button>

            {/* Food Layer */}
            <button
              onClick={() => setShowFoodOnly((prev) => !prev)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: showFoodOnly ? NAVY : "white",
                color: showFoodOnly ? "white" : NAVY,
                border: `1.5px solid ${NAVY}`,
                boxShadow: showFoodOnly
                  ? "0 0 0 2px rgba(18,60,115,0.18)"
                  : "0 2px 8px rgba(0,0,0,0.12)",
                opacity: showFoodOnly ? 1 : 0.9,
              }}
            >
              <LuUtensils size={16} />
            </button>

            {/* Restroom Layer */}
            <button
              onClick={() => setShowRestroomOnly((prev) => !prev)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: showRestroomOnly ? NAVY : "white",
                color: showRestroomOnly ? "white" : NAVY,
                border: `1.5px solid ${NAVY}`,
                boxShadow: showRestroomOnly
                  ? "0 0 0 2px rgba(18,60,115,0.18)"
                  : "0 2px 8px rgba(0,0,0,0.12)",
                opacity: showRestroomOnly ? 1 : 0.9,
              }}
            >
              <LuToilet size={16} />
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
