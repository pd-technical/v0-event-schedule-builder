"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";
import { renderToStaticMarkup } from "react-dom/server";
import { LuUtensils, LuToilet } from "react-icons/lu";
import { getCategoryIcon } from "../lib/eventUtils";
const NAVY = "#123c73";
const GOLD = "#ffbf00";
const GOLD_DARK = "#d89f00";


import {
  FaPaw, FaBug, FaFlask, FaPaintbrush, FaMusic, FaUtensils, FaInfo,
  FaGamepad, FaLeaf, FaHorse, FaEgg, FaCat, FaTractor, FaScissors, FaChess, FaBook, FaRobot, FaSeedling, FaCloudSun
} from "react-icons/fa6"
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiMicrophoneStageFill } from "react-icons/pi";



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

function renderReactIcon(iconKey: string, bg: string): string {
  const iconSize = 11;

  const iconMap: Record<string, React.ReactElement> = {
    horse:      <FaHorse       color="white" size={iconSize} />,
    egg:        <FaEgg         color="white" size={iconSize} />,
    bug:        <FaBug         color="white" size={iconSize} />,
    cat:        <FaCat         color="white" size={iconSize} />,
    leaf:       <FaLeaf        color="white" size={iconSize} />,
    sun:        <FaSeedling    color="white" size={iconSize} />,
    music:      <FaMusic       color="white" size={iconSize} />,
    art:        <FaPaintbrush  color="white" size={iconSize} />,
    paw:        <FaPaw         color="white" size={iconSize} />,
    flask:      <FaFlask       color="white" size={iconSize} />,
    robot:      <FaRobot       color="white" size={iconSize} />,
    gamepad:    <FaGamepad     color="white" size={iconSize} />,
    book:       <FaBook        color="white" size={iconSize} />,
    microphone: <PiMicrophoneStageFill  color="white" size={iconSize} />,
    utensils:   <FaUtensils    color="white" size={iconSize} />,
    scissors:   <FaScissors    color="white" size={iconSize} />,
    cloudSun:   <FaCloudSun    color="white" size={iconSize} />,
    tractor:    <FaTractor     color="white" size={iconSize} />,
    pin:        <FaMapMarkerAlt color="white" size={iconSize} />,
    games:      <FaChess       color="white" size={iconSize} />,
    info:       <FaInfo        color="white" size={iconSize} />,
  }

  const svgString = renderToStaticMarkup(iconMap[iconKey] ?? iconMap.pin)

  return `
    <div style="
      background-color: ${bg};
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
    ">
      ${svgString}
    </div>
  `
}

function createCategoryIcon(event: Event | ScheduledEvent, isHovered = false): L.DivIcon {
  const { icon, color } = getCategoryIcon(event)
  const bg = isHovered ? 'var(--color-primary)' : color  // blue on hover, keep icon white either way

  return L.divIcon({
    className: "",
    html: renderReactIcon(icon, bg),
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
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


  return createCategoryIcon(event, isHovered);
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

  // Freeze all interactions while exporting so a stray touch can't pan the map
  // during html2canvas capture.
  useEffect(() => {
    if (!isExporting) return;
    map.dragging.disable();
    map.touchZoom.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if ((map as unknown as { tap?: { disable(): void; enable(): void } }).tap) {
      (map as unknown as { tap: { disable(): void; enable(): void } }).tap.disable();
    }
    return () => {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if ((map as unknown as { tap?: { disable(): void; enable(): void } }).tap) {
        (map as unknown as { tap: { disable(): void; enable(): void } }).tap.enable();
      }
    };
  }, [isExporting, map]);

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

/* During export, nudge scheduled markers apart in pixel space so numbered
   circles that sit close together don't render on top of each other in the
   captured map image. Runs only while `isExporting` is true and resets on
   export end. */
function SpreadScheduledMarkersOnExport({
  isExporting,
  scheduledEvents,
  offsetPositions,
  markerRefs,
  recentlyAddedId,
}: {
  isExporting: boolean;
  scheduledEvents: ScheduledEvent[];
  offsetPositions: Map<string, [number, number]>;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
  recentlyAddedId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!isExporting || scheduledEvents.length === 0) return;

    const MIN_SEPARATION = 22;
    const ITERATIONS = 12;

    const apply = () => {
      type Entry = { id: string; x: number; y: number; ox: number; oy: number };
      const entries: Entry[] = scheduledEvents.map((e) => {
        const [lat, lng] = offsetPositions.get(e.id) ?? [e.lat, e.lng];
        const p = map.latLngToLayerPoint([lat, lng]);
        return { id: e.id, x: p.x, y: p.y, ox: 0, oy: 0 };
      });

      for (let iter = 0; iter < ITERATIONS; iter++) {
        let moved = false;
        for (let a = 0; a < entries.length; a++) {
          for (let b = a + 1; b < entries.length; b++) {
            const A = entries[a];
            const B = entries[b];
            const dx = (B.x + B.ox) - (A.x + A.ox);
            const dy = (B.y + B.oy) - (A.y + A.oy);
            const dist = Math.hypot(dx, dy);
            if (dist >= MIN_SEPARATION) continue;
            if (dist === 0) {
              const angle = (a + 1) * 0.8;
              const push = MIN_SEPARATION / 2;
              A.ox -= Math.cos(angle) * push;
              A.oy -= Math.sin(angle) * push;
              B.ox += Math.cos(angle) * push;
              B.oy += Math.sin(angle) * push;
              moved = true;
              continue;
            }
            const overlap = (MIN_SEPARATION - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            A.ox -= nx * overlap;
            A.oy -= ny * overlap;
            B.ox += nx * overlap;
            B.oy += ny * overlap;
            moved = true;
          }
        }
        if (!moved) break;
      }

      entries.forEach((e, i) => {
        const marker = markerRefs.current.get(e.id);
        if (!marker) return;
        const newIcon = createScheduledNumberedIcon(
          i + 1,
          recentlyAddedId === e.id,
          [e.ox, e.oy]
        );
        marker.setIcon(newIcon);
      });
    };

    const t = window.setTimeout(apply, 50);
    const onMoveEnd = () => apply();
    map.on("moveend", onMoveEnd);

    return () => {
      window.clearTimeout(t);
      map.off("moveend", onMoveEnd);
      scheduledEvents.forEach((e, i) => {
        const marker = markerRefs.current.get(e.id);
        if (!marker) return;
        marker.setIcon(
          createScheduledNumberedIcon(i + 1, recentlyAddedId === e.id)
        );
      });
    };
  }, [isExporting, scheduledEvents, offsetPositions, map, markerRefs, recentlyAddedId]);

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
  withRipple: boolean,
  anchorOffset: [number, number] = [0, 0]
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
    // Subtracting the offset from the anchor moves the rendered icon by
    // (+dx, +dy) in screen-space while keeping its lat/lng logical position.
    iconAnchor: [size / 2 - anchorOffset[0], size / 2 - anchorOffset[1]],
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
      className="relative w-full h-full lg:h-auto lg:flex-1 lg:min-h-0"
    >
      <div className="
        absolute z-[2000]
        top-3 right-3
        lg:top-auto lg:right-auto lg:bottom-3 lg:left-3
    ">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur px-2 py-1.5 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-black/5">

          {/* Scheduled */}
          <button
            onClick={() => setShowScheduleOnly((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showScheduleOnly ? NAVY : "white",
              color: showScheduleOnly ? "white" : NAVY,
              border: `1px solid ${NAVY}`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "999px",
                background: GOLD,
              }}
            />
            <span>Scheduled</span>
          </button>

          {/* Food */}
          <button
            onClick={() => setShowFoodOnly((prev) => !prev)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: showFoodOnly ? NAVY : "white",
              color: showFoodOnly ? "white" : NAVY,
              border: `1px solid ${NAVY}`,
            }}
          >
            <LuUtensils size={14} />
          </button>

          {/* Restroom */}
          <button
            onClick={() => setShowRestroomOnly((prev) => !prev)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: showRestroomOnly ? NAVY : "white",
              color: showRestroomOnly ? "white" : NAVY,
              border: `1px solid ${NAVY}`,
            }}
          >
            <LuToilet size={14} />
          </button>

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
          const isFood = isFoodTruck(event);
          const isRestroomEvent = isRestroom(event);

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

          // Layer order: scheduled (top) > regular search results > food/restrooms
          let zIndex = 0;
          if (isScheduled) {
            zIndex = 200;
          } else if (isFood || isRestroomEvent) {
            zIndex = 40;
          } else {
            zIndex = 120;
          }
          if (isHovered) zIndex += 15;

          return (
            <Marker
              key={event.id}
              ref={(el) => {
                if (el) markerRefs.current.set(event.id, el);
                else markerRefs.current.delete(event.id);
              }}
              position={[lat, lng]}
              icon={icon}
              zIndexOffset={zIndex}
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
        <SpreadScheduledMarkersOnExport
          isExporting={!!isExporting}
          scheduledEvents={scheduledEvents}
          offsetPositions={offsetPositions}
          markerRefs={markerRefs}
          recentlyAddedId={recentlyAddedId}
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
