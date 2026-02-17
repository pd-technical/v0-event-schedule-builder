"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";
import { formatTime } from "@/lib/time";

const NAVY = "#022851";

/** Available (search result): white fill, navy blue outline */
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

/** Hovered (from list or map): navy blue fill, navy blue outline */
function createHoveredIcon(): L.DivIcon {
  const size = 20;
  const html = `
    <div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:#daaa00;
      border:2px solid #022851;
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


/** Scheduled (added to calendar): navy fill, navy border, white number */
function createScheduledNumberedIcon(
  number: number,
  withRipple: boolean
): L.DivIcon {
  const size = 20;

  const html = `
    <div class="scheduled-marker">
      <span class="scheduled-number">${number}</span>
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


interface Props {
  events: Event[];
  scheduledEvents: ScheduledEvent[];
  hoveredEvent: string | null;
  setHoveredEvent: (id: string | null) => void;
  onMarkerClick?: (eventId: string) => void;
  resultsPage: number;
  pageSize: number;
  recentlyAddedId: string | null;
}

export default function CampusMapInner({
  events,
  scheduledEvents,
  hoveredEvent,
  setHoveredEvent,
  onMarkerClick,
  resultsPage,
  pageSize,
  recentlyAddedId
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
  const routePoints = scheduledEvents.map((e) => ({ lat: e.lat, lng: e.lng }));
  const prevScheduledIdsRef = useRef<Set<string>>(new Set());
  const newlyAddedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevScheduledIdsRef.current;
    const current = new Set(scheduledEvents.map(e => e.id));

    const newlyAdded = new Set<string>();

    current.forEach(id => {
      if (!prev.has(id)) {
        newlyAdded.add(id);
      }
    });

    newlyAddedIdsRef.current = newlyAdded;
    prevScheduledIdsRef.current = current;
  }, [scheduledEvents]);


  // Show events for the current list page + hovered event (so hovering in list shows it on map)
  const eventsOnMap = useMemo(() => {
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
  }, [events, scheduledEvents, resultsPage, pageSize, hoveredEvent]);

  const availableIcon = useMemo(() => createAvailableIcon(), []);
  const hoveredIcon = useMemo(() => createHoveredIcon(), []);
  const markerRefs = useRef(new Map<string, L.Marker>());

  // When hover comes from the list, open that marker's tooltip so the rectangle shows
  useEffect(() => {
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
    // If marker just mounted (e.g. hovered event from another page), ref may not be set yet
    const t = requestAnimationFrame(() => openHovered());
    return () => cancelAnimationFrame(t);
  }, [hoveredEvent]);

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

        {eventsOnMap.map((event) => {
          const scheduleIndex = scheduleIndexByEventId.get(event.id);
          const isScheduled = scheduleIndex != null;
          const isHovered = hoveredEvent === event.id;
          const isNewlyAdded = recentlyAddedId === event.id;

          const icon =
          isScheduled
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
              position={[event.lat, event.lng]}
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
                className="text-left"
                permanent={isHovered}
              >
                <div className="font-medium">{event.name}</div>
                <div className="text-muted-foreground text-xs">{formatTime(event.startTime)}</div>
              </Tooltip>
            </Marker>
          );
        })}

        <RoutingMachine points={routePoints} />
      </MapContainer>
    </div>
  );
}
