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
import { rankedEventMatchesSearch } from "@/lib/searchUtils"

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
  const [resultsPage, setResultsPage] = useState(0)

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

  const searchRanked = rankedEventMatchesSearch(events, searchQuery)
  const filteredEvents = searchRanked.filter(
    (event) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(event.category)
  )

  const RESULTS_PAGE_SIZE = 20
  const totalResultsPages = Math.max(1, Math.ceil(filteredEvents.length / RESULTS_PAGE_SIZE))
  const eventsForCurrentPage = filteredEvents.slice(
    resultsPage * RESULTS_PAGE_SIZE,
    (resultsPage + 1) * RESULTS_PAGE_SIZE
  )

  useEffect(() => {
    if (resultsPage >= totalResultsPages && totalResultsPages > 0) {
      setResultsPage(Math.max(0, totalResultsPages - 1))
    }
  }, [totalResultsPages, resultsPage])

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

      <main className="pt-3 pb-8 px-4 sm:px-5 md:px-6 md:pt-5 lg:pt-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile/tablet: single column (search, filters, list, then map, schedule). Large: row (search left, map right) */}
          <div className="flex flex-col gap-5 md:gap-6 lg:flex-row lg:gap-8">
            {/* Search, Filters, Events — first when stacked; left column on large */}
            <div className="order-1 flex flex-col min-w-0 lg:flex-1 lg:max-w-[520px] xl:max-w-[600px]">
              <SearchSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <div className="flex flex-col gap-4 mt-2 min-w-0 lg:mt-4 lg:flex-row lg:gap-5">
                <CategoryFilters
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                />
                <div className="flex-1 min-w-0">
                  <EventList
                    events={eventsForCurrentPage}
                    allFilteredCount={filteredEvents.length}
                    scheduledEvents={scheduledEvents}
                    addToSchedule={addToSchedule}
                    removeFromSchedule={removeFromSchedule}
                    hoveredEvent={hoveredEvent}
                    setHoveredEvent={setHoveredEvent}
                    page={resultsPage}
                    totalPages={totalResultsPages}
                    onPageChange={setResultsPage}
                  />
                </div>
              </div>
            </div>

            {/* Map + Schedule — second when stacked; right column on large */}
            <div className="order-2 w-full min-w-0 flex flex-col gap-4 relative lg:flex-1 lg:gap-0 lg:min-w-[360px]">
              <CampusMap
                events={filteredEvents}
                scheduledEvents={scheduledEvents}
                hoveredEvent={hoveredEvent}
                resultsPage={resultsPage}
                pageSize={RESULTS_PAGE_SIZE}
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
