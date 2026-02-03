"use client"

import { useState, useCallback, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { SearchSection } from "@/components/search-section"
import { CategoryFilters } from "@/components/category-filters"
import { EventList } from "@/components/event-list"
import { CampusMap } from "@/components/campus-map"
import { SchedulePanel } from "@/components/schedule-panel"
import { supabase } from "@/lib/supabaseClient"

import { getEvents } from "@/app/api/events"

export interface Event {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  category: string
  showtime: string
  lat: number
  lng: number
}

export interface ScheduledEvent extends Event {
  orderIndex: number
}

export default function PicnicDayPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [activeTab, setActiveTab] = useState<"browse" | "popular" | "nearby">("browse")
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
  async function loadEvents() {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (error) {
      console.error("Failed to load events:", error)
    }
  }
  loadEvents()
}, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(event.category)
    
    return matchesSearch && matchesCategory
  })

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
            <div className="flex-1 max-w-[640px] min-w-0">
              <SearchSection 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              
             
              <div className="flex gap-4 mt-4 min-w-0">
                
                <CategoryFilters 
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                />
     
                <div className="flex-1 min-w-0">
                  <EventList 
                    events={filteredEvents}
                    scheduledEvents={scheduledEvents}
                    addToSchedule={addToSchedule}
                    hoveredEvent={hoveredEvent}
                    setHoveredEvent={setHoveredEvent}
                  />
                </div>
              </div>
            </div>


            {/* Right Section - Map and Schedule */}
            <div className="flex-1 relative">
              <CampusMap 
                events={filteredEvents}
                scheduledEvents={scheduledEvents}
                hoveredEvent={hoveredEvent}
              />
              
              <SchedulePanel 
                scheduledEvents={scheduledEvents}
                removeFromSchedule={removeFromSchedule}
                reorderSchedule={reorderSchedule}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
