"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { SearchSection } from "@/components/search-section"
import { CategoryFilters } from "@/components/category-filters"
import { EventList } from "@/components/event-list"
import { CampusMap } from "@/components/campus-map"
import { SchedulePanel } from "@/components/schedule-panel"
import { getEvents, getAmenities, getLocationsWithFeatures } from "@/lib/data"
import type { Event as DbEvent, Amenity as DbAmenity, LocationWithFeatures, ScheduledEvent, AmenityVisibility } from "@/lib/types"

// Transform DB event to UI event format
interface UIEvent {
  id: string
  name: string
  time: string
  endTime: string
  location: string
  locationId: string
  category: string
  description: string
  mapPosition: { lat: number; lng: number }
  popularity: number
}

interface UIAmenity {
  id: string
  type: "food" | "bathroom" | "water"
  name: string
  position: { lat: number; lng: number }
}

interface UIScheduledEvent extends UIEvent {
  orderIndex: number
}

function formatTime(isoTime: string): string {
  const date = new Date(isoTime)
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

function transformEvent(event: DbEvent): UIEvent {
  return {
    id: event.id,
    name: event.name,
    time: formatTime(event.start_time),
    endTime: formatTime(event.end_time),
    location: event.location?.name || 'TBD',
    locationId: event.location_id,
    category: event.category,
    description: event.description || '',
    mapPosition: { 
      lat: event.location?.latitude || 38.5382, 
      lng: event.location?.longitude || -121.7617 
    },
    popularity: event.popularity
  }
}

function transformAmenity(amenity: DbAmenity): UIAmenity {
  return {
    id: amenity.id,
    type: amenity.type,
    name: amenity.name,
    position: { lat: amenity.latitude, lng: amenity.longitude }
  }
}

// Calculate distance between two points
function getDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) {
  return Math.sqrt(Math.pow(pos1.lat - pos2.lat, 2) + Math.pow(pos1.lng - pos2.lng, 2))
}

export default function PicnicDayPage() {
  const [events, setEvents] = useState<UIEvent[]>([])
  const [amenities, setAmenities] = useState<UIAmenity[]>([])
  const [locations, setLocations] = useState<LocationWithFeatures[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [scheduledEvents, setScheduledEvents] = useState<UIScheduledEvent[]>([])
  const [activeTab, setActiveTab] = useState<"browse" | "popular" | "nearby">("browse")
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [selectedScheduledEvent, setSelectedScheduledEvent] = useState<string | null>(null)
  const [amenityVisibility, setAmenityVisibility] = useState<AmenityVisibility>({
    food: false,
    bathroom: false,
    water: false
  })

  // Fetch data from Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [eventsData, amenitiesData, locationsData] = await Promise.all([
          getEvents(),
          getAmenities(),
          getLocationsWithFeatures()
        ])
        
        setEvents(eventsData.map(transformEvent))
        setAmenities(amenitiesData.map(transformAmenity))
        setLocations(locationsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Get reference event for "Near Me" tab (selected event or last in schedule)
  const referenceEvent = useMemo(() => {
    if (selectedScheduledEvent) {
      return scheduledEvents.find(e => e.id === selectedScheduledEvent) || null
    }
    return scheduledEvents.length > 0 ? scheduledEvents[scheduledEvents.length - 1] : null
  }, [selectedScheduledEvent, scheduledEvents])

  // Filter and sort events based on active tab
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(event.category)
      
      return matchesSearch && matchesCategory
    })

    // Sort by popularity for "Popular" tab
    if (activeTab === "popular") {
      filtered = [...filtered].sort((a, b) => b.popularity - a.popularity)
    }
    
    // Sort by distance for "Near Me" tab (relative to selected/last scheduled event)
    if (activeTab === "nearby" && referenceEvent) {
      filtered = [...filtered].sort((a, b) => {
        const distA = getDistance(a.mapPosition, referenceEvent.mapPosition)
        const distB = getDistance(b.mapPosition, referenceEvent.mapPosition)
        return distA - distB
      })
    }

    return filtered
  }, [events, searchQuery, selectedCategories, activeTab, referenceEvent])

  // Get unique categories from locations with features
  const locationFeatures = useMemo(() => {
    const features = new Set<string>()
    locations.forEach(loc => {
      loc.location_features?.forEach(f => features.add(f.feature_type))
    })
    return Array.from(features)
  }, [locations])

  const addToSchedule = useCallback((event: UIEvent) => {
    setScheduledEvents(prev => {
      if (prev.find(e => e.id === event.id)) return prev
      return [...prev, { ...event, orderIndex: prev.length }]
    })
  }, [])

  const removeFromSchedule = useCallback((eventId: string) => {
    setScheduledEvents(prev => prev.filter(e => e.id !== eventId))
  }, [])

  const reorderSchedule = useCallback((fromIndex: number, toIndex: number) => {
    setScheduledEvents(prev => {
      const result = [...prev]
      const [removed] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, removed)
      return result.map((e, i) => ({ ...e, orderIndex: i }))
    })
  }, [])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-4 pb-8 px-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex gap-6">
            {/* Left Section - Search, Filters, Events */}
            <div className="flex-1 max-w-[640px]">
              <SearchSection 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                hasScheduledEvents={scheduledEvents.length > 0}
              />
              
              <div className="flex gap-4 mt-4">
                <CategoryFilters 
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  locationFeatures={locationFeatures}
                />
                
                <EventList 
                  events={filteredEvents}
                  scheduledEvents={scheduledEvents}
                  addToSchedule={addToSchedule}
                  hoveredEvent={hoveredEvent}
                  setHoveredEvent={setHoveredEvent}
                />
              </div>
            </div>

            {/* Right Section - Map and Schedule */}
            <div className="flex-1 relative">
              <CampusMap 
                events={filteredEvents}
                scheduledEvents={scheduledEvents}
                hoveredEvent={hoveredEvent}
                amenities={amenities}
                amenityVisibility={amenityVisibility}
                setAmenityVisibility={setAmenityVisibility}
                locations={locations}
              />
              
              <SchedulePanel 
                scheduledEvents={scheduledEvents}
                removeFromSchedule={removeFromSchedule}
                reorderSchedule={reorderSchedule}
                selectedScheduledEvent={selectedScheduledEvent}
                setSelectedScheduledEvent={setSelectedScheduledEvent}
                amenityVisibility={amenityVisibility}
                setAmenityVisibility={setAmenityVisibility}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
