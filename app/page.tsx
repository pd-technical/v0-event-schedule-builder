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
  const [scrollToEventId, setScrollToEventId] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [resultsPage, setResultsPage] = useState(0)
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)

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

  const handleMapMarkerClick = useCallback((eventId: string) => {
    const index = filteredEvents.findIndex((e) => e.id === eventId)
    if (index >= 0) {
      const page = Math.floor(index / RESULTS_PAGE_SIZE)
      setResultsPage(page)
      setScrollToEventId(eventId)
    }
  }, [filteredEvents])

  const addToSchedule = useCallback((event: Event) => {
    setScheduledEvents(prev => {
      if (prev.find(e => e.id === event.id)) return prev
      return [...prev, { ...event, orderIndex: prev.length }]
    })

    setRecentlyAddedId(event.id)

    setTimeout(() => {
      setRecentlyAddedId(null)
    }, 700)
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

      <main className="pt-3 pb-8 px-4 md:pt-4 md:px-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Mobile: column (map first, then search+results). Desktop: row (search left, map right) */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            {/* Map + Schedule — mobile: stacked (map then schedule below); desktop: map with overlay panel */}
            <div className="order-1 w-full min-w-0 flex flex-col gap-4 relative md:order-2 md:flex-1 md:gap-0">
              <CampusMap
                events={filteredEvents}
                scheduledEvents={scheduledEvents}
                hoveredEvent={hoveredEvent}
                setHoveredEvent={setHoveredEvent}
                onMarkerClick={handleMapMarkerClick}
                resultsPage={resultsPage}
                pageSize={RESULTS_PAGE_SIZE}
                recentlyAddedId={recentlyAddedId}
              />
              <SchedulePanel
                scheduledEvents={scheduledEvents}
                removeFromSchedule={removeFromSchedule}
                reorderSchedule={reorderSchedule}
              />
            </div>

            {/* Search, Filters, Events — on mobile: order 2 (below map); on desktop: left column */}
            <div className="order-2 flex flex-col min-w-0 md:order-1 md:flex-1 md:max-w-[640px]">
              <SearchSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              <div className="flex flex-col gap-4 mt-4 min-w-0 md:flex-row">
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
                    scrollToEventId={scrollToEventId}
                    onScrollToEventDone={() => setScrollToEventId(null)}
                    page={resultsPage}
                    totalPages={totalResultsPages}
                    onPageChange={setResultsPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
