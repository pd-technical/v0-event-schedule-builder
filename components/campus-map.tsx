"use client"

import { useEffect, useRef, useState } from "react"
import type { Event, ScheduledEvent, Amenity, AmenityVisibility } from "@/app/page"
import { Utensils, Droplets, Bath } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface CampusMapProps {
  events: Event[]
  scheduledEvents: ScheduledEvent[]
  hoveredEvent: string | null
  amenities: Amenity[]
  amenityVisibility: AmenityVisibility
  setAmenityVisibility: (visibility: AmenityVisibility) => void
}

export function CampusMap({ 
  events, 
  scheduledEvents, 
  hoveredEvent, 
  amenities, 
  amenityVisibility,
  setAmenityVisibility 
}: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const amenityMarkersRef = useRef<L.Marker[]>([])
  const polylineRef = useRef<L.Polyline | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const getScheduleIndex = (eventId: string) => {
    const index = scheduledEvents.findIndex(e => e.id === eventId)
    return index >= 0 ? index + 1 : null
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      // UC Davis campus center
      const map = L.map(mapRef.current!, {
        center: [38.537, -121.755],
        zoom: 16,
        zoomControl: true,
        attributionControl: false
      })

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setIsMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update event markers
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    events.forEach(event => {
      const scheduleIndex = getScheduleIndex(event.id)
      const isHovered = hoveredEvent === event.id
      const isScheduled = scheduleIndex !== null

      // Create custom icon
      const iconHtml = isScheduled
        ? `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#022851] text-white font-bold text-xs shadow-lg border-2 border-white">${scheduleIndex}</div>`
        : `<div class="w-5 h-5 rounded-full ${isHovered ? 'bg-[#daaa00] border-2 border-[#022851]' : 'bg-white border-2 border-[#5b6770]'} shadow-md"></div>`

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: isScheduled ? [32, 32] : [20, 20],
        iconAnchor: isScheduled ? [16, 16] : [10, 10]
      })

      const marker = L.marker([event.mapPosition.x, event.mapPosition.y], { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div class="p-1">
            <p class="font-semibold text-sm">${event.name}</p>
            <p class="text-xs text-gray-600">${event.time} - ${event.location}</p>
          </div>
        `)

      markersRef.current.push(marker)
    })
  }, [events, scheduledEvents, hoveredEvent, isMapReady])

  // Update route polyline
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (scheduledEvents.length > 1) {
      const points: [number, number][] = scheduledEvents.map(event => [
        event.mapPosition.x,
        event.mapPosition.y
      ])

      polylineRef.current = L.polyline(points, {
        color: '#022851',
        weight: 3,
        opacity: 0.7,
        dashArray: '8, 6'
      }).addTo(mapInstanceRef.current)
    }
  }, [scheduledEvents, isMapReady])

  // Update amenity markers
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return

    // Clear existing amenity markers
    amenityMarkersRef.current.forEach(marker => marker.remove())
    amenityMarkersRef.current = []

    const visibleAmenities = amenities.filter(a => amenityVisibility[a.type])

    visibleAmenities.forEach(amenity => {
      let iconColor = '#5b6770'
      let iconSvg = ''
      
      if (amenity.type === 'food') {
        iconColor = '#c97723'
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
      } else if (amenity.type === 'bathroom') {
        iconColor = '#3b7ea1'
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" x2="8" y1="5" y2="7"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="7" x2="7" y1="19" y2="21"/><line x1="17" x2="17" y1="19" y2="21"/></svg>`
      } else if (amenity.type === 'water') {
        iconColor = '#0077b6'
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`
      }

      const iconHtml = `<div class="flex items-center justify-center w-6 h-6 rounded-full shadow-md" style="background-color: ${iconColor}">${iconSvg}</div>`

      const icon = L.divIcon({
        html: iconHtml,
        className: 'amenity-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      const marker = L.marker([amenity.position.x, amenity.position.y], { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`<div class="p-1 text-sm font-medium">${amenity.name}</div>`)

      amenityMarkersRef.current.push(marker)
    })
  }, [amenities, amenityVisibility, isMapReady])

  const toggleAmenity = (type: keyof AmenityVisibility) => {
    setAmenityVisibility({
      ...amenityVisibility,
      [type]: !amenityVisibility[type]
    })
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-[520px] relative">
      {/* Leaflet Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Amenity Toggle Overlays */}
      <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-2 z-[1000]">
        <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wide">Show on map</p>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => toggleAmenity('food')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              amenityVisibility.food 
                ? 'bg-[#c97723] text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Food
          </button>
          <button
            onClick={() => toggleAmenity('bathroom')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              amenityVisibility.bathroom 
                ? 'bg-[#3b7ea1] text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            <Bath className="w-3.5 h-3.5" />
            Restrooms
          </button>
          <button
            onClick={() => toggleAmenity('water')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              amenityVisibility.water 
                ? 'bg-[#0077b6] text-white' 
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Water
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-2 z-[1000]">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] text-primary-foreground font-bold">1</div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-card border-2 border-muted-foreground/50 rounded-full" />
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
