"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

type Point = {
  lat: number;
  lng: number;
};

const ROUTE_LINE_OPTIONS = {
  styles: [{ color: "#022851", weight: 5 }],
  renderer: L.canvas(),
};

/** Latitude must be in [-90, 90], longitude in [-180, 180]. Fix if swapped. */
function normalizePoint(p: Point): Point {
  const a = p.lat;
  const b = p.lng;
  const aIsLat = Math.abs(a) <= 90;
  const bIsLng = Math.abs(b) <= 180;
  const aIsLng = Math.abs(a) <= 180;
  const bIsLat = Math.abs(b) <= 90;
  if (aIsLat && bIsLng) return { lat: a, lng: b };
  if (aIsLng && bIsLat) return { lat: b, lng: a };
  return { lat: a, lng: b };
}

export default function RoutingMachine({ points }: { points: Point[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const hasValidToken =
      typeof mapboxToken === "string" &&
      mapboxToken.trim().length > 0 &&
      mapboxToken.startsWith("pk.");

    const MAPBOX_POLYLINE_PRECISION = 6;
    const MAPBOX_GEOMETRIES = "polyline6";

    let router: ReturnType<typeof L.Routing.mapbox> | undefined;
    if (hasValidToken) {
      console.log("Using Mapbox router");
      router = L.Routing.mapbox(mapboxToken!.trim(), {
        profile: "mapbox/walking",
        polylinePrecision: MAPBOX_POLYLINE_PRECISION,
        requestParameters: {
          geometries: MAPBOX_GEOMETRIES,
        },
      });
      console.log(
        "Mapbox polyline: request geometries=%s, decoder polylinePrecision=%d (must match)",
        MAPBOX_GEOMETRIES,
        MAPBOX_POLYLINE_PRECISION
      );
    } else {
      if (!mapboxToken || mapboxToken.trim() === "") {
        console.warn("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is missing.");
      } else {
        console.warn("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is invalid.");
      }
      console.log("Falling back to OSRM router");
      router = undefined;
    }

    const firstTwoRaw = points.slice(0, 2);
    console.log("First two waypoints (input) — raw array:", firstTwoRaw);
    console.log(
      "First two waypoints (input) — { lat, lng }:",
      firstTwoRaw.map((p) => ({ lat: p.lat, lng: p.lng }))
    );

    const normalizedPoints = points.map(normalizePoint);
    const waypointsForRouter = normalizedPoints.map((p) => L.latLng(p.lat, p.lng));

    const firstTwoNormalized = normalizedPoints.slice(0, 2);
    if (
      firstTwoRaw.length >= 2 &&
      (firstTwoRaw[0].lat !== firstTwoNormalized[0].lat ||
        firstTwoRaw[0].lng !== firstTwoNormalized[0].lng ||
        firstTwoRaw[1].lat !== firstTwoNormalized[1].lat ||
        firstTwoRaw[1].lng !== firstTwoNormalized[1].lng)
    ) {
      console.log(
        "First two waypoints (after fixing [lng,lat]→[lat,lng]) — { lat, lng }:",
        firstTwoNormalized.map((p) => ({ lat: p.lat, lng: p.lng }))
      );
    }

    const routingControl = L.Routing.control({
      waypoints: waypointsForRouter,
      router,
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false, // keep user's zoom/pan; don't auto-fit to route
      show: false,
      lineOptions: ROUTE_LINE_OPTIONS,
    }).addTo(map);

    return () => {
      try {
        routingControl?.remove();
      } catch {}
    };
  }, [points, map]);

  return null;
}
