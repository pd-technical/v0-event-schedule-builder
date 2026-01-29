"use client"

import { useState, useCallback, useMemo } from "react"
import { NavBar } from "@/components/nav-bar"
import { SearchSection } from "@/components/search-section"
import { CategoryFilters } from "@/components/category-filters"
import { EventList } from "@/components/event-list"
import { CampusMap } from "@/components/campus-map"
import { SchedulePanel } from "@/components/schedule-panel"

export interface Event {
  id: string
  name: string
  time: string
  endTime: string
  location: string
  category: string
  description: string
  mapPosition: { x: number; y: number }
  popularity: number // number of users who added this to their schedule
}

export interface ScheduledEvent extends Event {
  orderIndex: number
}

export interface Amenity {
  id: string
  type: "food" | "bathroom" | "water"
  name: string
  position: { x: number; y: number }
}

export type AmenityVisibility = {
  food: boolean
  bathroom: boolean
  water: boolean
}

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    name: "Doxie Derby",
    time: "10:00 AM",
    endTime: "11:00 AM",
    location: "Hutchison Field",
    category: "animals",
    description: "Watch adorable dachshunds race across the field in this beloved Picnic Day tradition.",
    mapPosition: { x: 38.538, y: -121.761 },
    popularity: 342
  },
  {
    id: "2",
    name: "Chemistry Magic Show",
    time: "11:00 AM",
    endTime: "12:00 PM",
    location: "Chemistry Building",
    category: "science",
    description: "Witness spectacular chemical reactions and learn the science behind the magic.",
    mapPosition: { x: 38.537, y: -121.749 },
    popularity: 256
  },
  {
    id: "3",
    name: "Insect Pavilion Tour",
    time: "9:30 AM",
    endTime: "10:30 AM",
    location: "Briggs Hall",
    category: "nature",
    description: "Explore the fascinating world of insects with entomology experts.",
    mapPosition: { x: 38.536, y: -121.752 },
    popularity: 189
  },
  {
    id: "4",
    name: "Animal Science Demo",
    time: "1:00 PM",
    endTime: "2:00 PM",
    location: "Animal Science Building",
    category: "animals",
    description: "Interactive demonstrations featuring farm animals and animal science research.",
    mapPosition: { x: 38.534, y: -121.756 },
    popularity: 278
  },
  {
    id: "5",
    name: "Opening Ceremony",
    time: "8:00 AM",
    endTime: "9:00 AM",
    location: "Main Quad",
    category: "featured",
    description: "Kick off Picnic Day with the official opening ceremony and welcome address.",
    mapPosition: { x: 38.539, y: -121.754 },
    popularity: 456
  },
  {
    id: "6",
    name: "Battle of the Bands",
    time: "2:00 PM",
    endTime: "4:00 PM",
    location: "ARC Pavilion",
    category: "arts",
    description: "Student bands compete for the title of Picnic Day champion.",
    mapPosition: { x: 38.542, y: -121.760 },
    popularity: 312
  },
  {
    id: "7",
    name: "Botanical Garden Walk",
    time: "10:30 AM",
    endTime: "11:30 AM",
    location: "Arboretum",
    category: "nature",
    description: "Guided tour through the beautiful UC Davis Arboretum.",
    mapPosition: { x: 38.532, y: -121.758 },
    popularity: 145
  },
  {
    id: "8",
    name: "Engineering Showcase",
    time: "11:00 AM",
    endTime: "1:00 PM",
    location: "Kemper Hall",
    category: "science",
    description: "See innovative student engineering projects and robotics demonstrations.",
    mapPosition: { x: 38.535, y: -121.750 },
    popularity: 203
  }
]

const MOCK_AMENITIES: Amenity[] = [
  { id: "f1", type: "food", name: "Food Court A", position: { x: 38.537, y: -121.755 } },
  { id: "f2", type: "food", name: "BBQ Station", position: { x: 38.540, y: -121.758 } },
  { id: "f3", type: "food", name: "Ice Cream Stand", position: { x: 38.535, y: -121.752 } },
  { id: "b1", type: "bathroom", name: "Restroom - Quad", position: { x: 38.538, y: -121.754 } },
  { id: "b2", type: "bathroom", name: "Restroom - Sciences", position: { x: 38.536, y: -121.750 } },
  { id: "b3", type: "bathroom", name: "Restroom - ARC", position: { x: 38.541, y: -121.759 } },
  { id: "w1", type: "water", name: "Water Station 1", position: { x: 38.537, y: -121.753 } },
  { id: "w2", type: "water", name: "Water Station 2", position: { x: 38.539, y: -121.757 } },
  { id: "w3", type: "water", name: "Water Station 3", position: { x: 38.534, y: -121.755 } },
]

// Calculate distance between two points (simplified for demo)
function getDistance(pos1: { x: number; y: number }, pos2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
}

export default function PicnicDayPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [activeTab, setActiveTab] = useState<"browse" | "popular" | "nearby">("browse")
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [selectedScheduledEvent, setSelectedScheduledEvent] = useState<string | null>(null)
  const [amenityVisibility, setAmenityVisibility] = useState<AmenityVisibility>({
    food: false,
    bathroom: false,
    water: false
  })

  // Get reference event for "Near Me" tab (selected event or last in schedule)
  const referenceEvent = useMemo(() => {
    if (selectedScheduledEvent) {
      return scheduledEvents.find(e => e.id === selectedScheduledEvent) || null
    }
    return scheduledEvents.length > 0 ? scheduledEvents[scheduledEvents.length - 1] : null
  }, [selectedScheduledEvent, scheduledEvents])

  // Filter and sort events based on active tab
  const filteredEvents = useMemo(() => {
    let events = MOCK_EVENTS.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(event.category)
      
      return matchesSearch && matchesCategory
    })

    // Sort by popularity for "Popular" tab
    if (activeTab === "popular") {
      events = [...events].sort((a, b) => b.popularity - a.popularity)
    }
    
    // Sort by distance for "Near Me" tab (relative to selected/last scheduled event)
    if (activeTab === "nearby" && referenceEvent) {
      events = [...events].sort((a, b) => {
        const distA = getDistance(a.mapPosition, referenceEvent.mapPosition)
        const distB = getDistance(b.mapPosition, referenceEvent.mapPosition)
        return distA - distB
      })
    }

    return events
  }, [searchQuery, selectedCategories, activeTab, referenceEvent])

  const addToSchedule = useCallback((event: Event) => {
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
                amenities={MOCK_AMENITIES}
                amenityVisibility={amenityVisibility}
                setAmenityVisibility={setAmenityVisibility}
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
