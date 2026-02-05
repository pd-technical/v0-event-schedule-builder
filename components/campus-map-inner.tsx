"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { Event, ScheduledEvent } from "@/app/page";
import RoutingMachine from "./routing-machine";

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

  const routePoints = scheduledEvents.map(e => ({
    lat: e.lat,
    lng: e.lng,
  }));
  const scheduledIds = new Set(scheduledEvents.map(e => e.id));
  const visibleEvents = events.filter(event =>
    scheduledIds.has(event.id) || hoveredEvent === event.id
  );

  return (
    
    <div className="bg-card rounded-lg border border-border overflow-hidden h-[360px] md:h-[480px]">
      <MapContainer
        center={[38.5382, -121.7617]}
        zoom={15}
        minZoom={15}
        maxZoom={18}
        maxBounds={[
          [38.531, -121.770], // southwest
          [38.548, -121.742], // northeast
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {visibleEvents.map(event => (
                <Marker
                  key={event.id}
                  position={[event.lat, event.lng]}
                />
              ))}

              <RoutingMachine points={routePoints} />
            </MapContainer>
          </div>
        );
}
