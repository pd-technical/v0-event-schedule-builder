"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";

/** Matches schedule list: w-5 h-5, rounded-full, bg-primary, text-primary-foreground, text-[10px] font-bold */
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
}

export default function CampusMapInner({
  events,
  scheduledEvents,
  hoveredEvent
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
  const scheduledIds = new Set(scheduledEvents.map(e => e.id));
  const visibleEvents = events.filter(event =>
    scheduledIds.has(event.id) || hoveredEvent === event.id
  );

  return (
    
    <div className="bg-card rounded-lg border border-border overflow-hidden h-[280px] sm:h-[320px] md:h-[480px] w-full">
      <MapContainer
        center={[38.5382, -121.7617]}
        zoom={15}
        minZoom={14}
        maxZoom={18}
        maxBounds={[
          [38.528, -121.775], // southwest corner
          [38.555, -121.735], // northeast corner
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {visibleEvents.map(event => {
                const scheduleIndex = scheduleIndexByEventId.get(event.id);
                return (
                  <Marker
                    key={event.id}
                    position={[event.lat, event.lng]}
                    icon={
                      scheduleIndex != null
                        ? createNumberedCircleIcon(scheduleIndex)
                        : new L.Icon.Default()
                    }
                  />
                );
              })}

              <RoutingMachine points={routePoints} />
            </MapContainer>
          </div>
        );
}
