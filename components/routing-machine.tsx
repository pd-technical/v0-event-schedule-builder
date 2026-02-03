"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

type Point = {
  lat: number;
  lng: number;
};

export default function RoutingMachine({ points }: { points: Point[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: points.map(p => L.latLng(p.lat, p.lng)),
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: "#022851", weight: 5 }],
      },
    }).addTo(map);

    return () => {
  try {
    routingControl?.remove();
  } catch {}
};
  }, [points, map]);

  return null;
}
