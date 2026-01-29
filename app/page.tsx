"use client"

import { useState, useCallback } from "react"
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
}

export interface ScheduledEvent extends Event {
  orderIndex: number
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
    mapPosition: { x: 45, y: 55 }
  },
  {
    id: "2",
    name: "Chemistry Magic Show",
    time: "11:00 AM",
    endTime: "12:00 PM",
    location: "Chemistry Building",
    category: "science",
    description: "Witness spectacular chemical reactions and learn the science behind the magic.",
    mapPosition: { x: 65, y: 35 }
  },
  {
    id: "3",
    name: "Insect Pavilion Tour",
    time: "9:30 AM",
    endTime: "10:30 AM",
    location: "Briggs Hall",
    category: "nature",
    description: "Explore the fascinating world of insects with entomology experts.",
    mapPosition: { x: 55, y: 45 }
  },
  {
    id: "4",
    name: "Animal Science Demo",
    time: "1:00 PM",
    endTime: "2:00 PM",
    location: "Animal Science Building",
    category: "animals",
    description: "Interactive demonstrations featuring farm animals and animal science research.",
    mapPosition: { x: 35, y: 65 }
  },
  {
    id: "5",
    name: "Opening Ceremony",
    time: "8:00 AM",
    endTime: "9:00 AM",
    location: "Main Quad",
    category: "featured",
    description: "Kick off Picnic Day with the official opening ceremony and welcome address.",
    mapPosition: { x: 50, y: 40 }
  },
  {
    id: "6",
    name: "Battle of the Bands",
    time: "2:00 PM",
    endTime: "4:00 PM",
    location: "ARC Pavilion",
    category: "arts",
    description: "Student bands compete for the title of Picnic Day champion.",
    mapPosition: { x: 25, y: 30 }
  },
  {
    id: "7",
    name: "Botanical Garden Walk",
    time: "10:30 AM",
    endTime: "11:30 AM",
    location: "Arboretum",
    category: "nature",
    description: "Guided tour through the beautiful UC Davis Arboretum.",
    mapPosition: { x: 70, y: 60 }
  },
  {
    id: "8",
    name: "Engineering Showcase",
    time: "11:00 AM",
    endTime: "1:00 PM",
    location: "Kemper Hall",
    category: "science",
    description: "See innovative student engineering projects and robotics demonstrations.",
    mapPosition: { x: 60, y: 50 }
  }
]

export default function PicnicDayPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [activeTab, setActiveTab] = useState<"browse" | "popular" | "nearby">("browse")
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  const filteredEvents = MOCK_EVENTS.filter(event => {
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
            <div className="flex-1 max-w-[640px]">
              <SearchSection 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
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
