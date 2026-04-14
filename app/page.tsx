"use client"

import { useState, useCallback, useEffect, useMemo } from "react"

// components

// components
import { SearchSection } from "@/app/components/search-section"
import { EventList } from "@/app/components/event-list"
import { CampusMap } from "@/app/components/campus-map"
import { SchedulePanel } from "@/app/components/schedule-panel"
import { OnboardingProvider } from "@/app/components/onboarding/onboarding-provider"
import { PersonalizationDialog } from "@/app/components/onboarding/personalization-dialog"
import { MobileScheduleMap } from "./components/mobile/mobile-view"

// utils
import { getEvents } from "@/app/lib/fetchEvents"
import { rankedEventMatchesSearch } from "@/app/lib/searchUtils"
import { exportSchedulePdf } from "@/app/lib/exportPdf"
import { exportScheduleIcs } from "@/app/lib/exportIcs"
import {
  readScheduleCache,
  writeScheduleCache,
  scheduleFromCachedIds,
} from "@/app/lib/scheduleCache"
import {
  PERSONALIZATION_PILLS,
  topEventsForPersonalization,
  type PersonalizationPillId,
} from "@/app/lib/personalizationInterests"

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
  location_details: string
  tags: string[]
}

export interface ScheduledEvent extends Event {
  location_details: any
  orderIndex: number
}

function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return Number.POSITIVE_INFINITY
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0
  return hours * 60 + minutes
}

function compareEventsByTime(a: Event | ScheduledEvent, b: Event | ScheduledEvent) {
  const startCompare = timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  if (startCompare !== 0) return startCompare
  return timeToMinutes(a.endTime) - timeToMinutes(b.endTime)
}

export default function PicnicDayPage() {

  // data
  const [events, setEvents] = useState<Event[]>([])
  const [eventsReady, setEventsReady] = useState(false)

  // search + filters
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("")
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] =
    useState<"relevance" | "alphabetical" | "time">("relevance")

  // schedule
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [scheduleCacheReady, setScheduleCacheReady] = useState(false)
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)

  // ui state
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [shouldPanToHovered, setShouldPanToHovered] = useState(false)
  const [scrollToEventId, setScrollToEventId] = useState<string | null>(null)
  const [resultsPage, setResultsPage] = useState(0)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [personalInterests, setPersonalInterests] = useState<PersonalizationPillId[] | null>(null)
  const [personalizationSeedPending, setPersonalizationSeedPending] =
    useState<PersonalizationPillId[] | null>(null)
  const [activeFeedTab, setActiveFeedTab] =
    useState<"recommended" | "all">("all")
  const [isEditingRecommended, setIsEditingRecommended] = useState(false)

  // layout
  const [isMobile, setIsMobile] = useState(false)
  const [RESULTS_PAGE_SIZE, setResultsPageSize] = useState(20)

  const categoryToTags: Record<string, string[]> = {
    family: ["kids", "toddlers", "fun", "activities", "games"],
    animals: ["animals", "bugs", "insects", "pets"],
    science: ["science", "education", "tech", "engineering", "math"],
    music: ["music", "performance"],
    creative: ["art", "crafts"],
    food: ["food", "drink", "coffee"],
    community: ["cultural", "culture", "personal", "services"],
  }

  // helpers
  function timeToMinutes(timeStr: string): number {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return Number.POSITIVE_INFINITY
    let hours = Number(match[1])
    const minutes = Number(match[2])
    const period = match[3].toUpperCase()

    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  function isFoodEvent(event: Event) {
    return event.tags?.some(tag =>
      tag.toLowerCase().includes("food")
    )
  }

  function isRestroom(event: Event | ScheduledEvent) {
    return event.tags?.some(tag =>
      tag.toLowerCase().includes("restroom")
    )
  }

  // effects

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (err) {
        console.error("Failed to load events:", err)
      } finally {
        setEventsReady(true)
      }
    }
    loadEvents()
  }, [])

  // Restore schedule from localStorage after events load (2-day expiry handled in scheduleCache).
  useEffect(() => {
    if (!eventsReady || events.length === 0) return

    const cached = readScheduleCache()
    if (cached?.orderedEventIds.length) {
      const restored = scheduleFromCachedIds(cached.orderedEventIds, events)
      if (restored.length > 0) {
        setScheduledEvents(restored)
        writeScheduleCache(restored.map(e => e.id))
      }
    }

    setScheduleCacheReady(true)
  }, [eventsReady, events])

  useEffect(() => {
    if (!scheduleCacheReady || events.length === 0) return
    writeScheduleCache(scheduledEvents.map(e => e.id))
  }, [scheduledEvents, scheduleCacheReady, events.length])

  const handlePersonalizationComplete = useCallback((interestIds: PersonalizationPillId[]) => {
    setPersonalInterests(interestIds)
    setSelectedCategories([])
    setSearchQuery("")
    setSubmittedSearchQuery("")
    setActiveFeedTab("recommended")
    setResultsPage(0)
  }, [])

  const recommendedSeedEvents = useMemo(
    () =>
      personalInterests?.length
        ? topEventsForPersonalization(events, personalInterests, 3)
        : [],
    [events, personalInterests]
  )

  const selectedInterestLabels = useMemo(() => {
    if (!personalInterests?.length) return []
    const map = new Map(PERSONALIZATION_PILLS.map((pill) => [pill.id, pill.label]))
    return personalInterests.map((id) => map.get(id) ?? id).slice(0, 3)
  }, [personalInterests])

  const baseEvents = useMemo(() => {
    if (activeFeedTab === "recommended" && personalInterests?.length) {
      return recommendedSeedEvents
    }
    if (activeFeedTab === "recommended") {
      return []
    }
    return events
  }, [activeFeedTab, personalInterests, recommendedSeedEvents, events])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSubmittedSearchQuery("")
      setResultsPage(0)
    }
  }, [searchQuery])

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      if (width < 640) setResultsPageSize(5)
      else if (width < 1024) setResultsPageSize(10)
      else setResultsPageSize(20)
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])


  const searchRanked = useMemo(() => {
    const q = submittedSearchQuery.trim()
    if (!q) return baseEvents
    // Recommended feed should only search within that feed, not the full catalog.
    const pool = activeFeedTab === "recommended" ? baseEvents : events
    return rankedEventMatchesSearch(pool, submittedSearchQuery)
  }, [baseEvents, submittedSearchQuery, events, activeFeedTab])

  const filteredEvents = useMemo(() => {
    let result = searchRanked

    if (selectedCategories.length > 0) {
      result = result.filter(event =>
        selectedCategories.some(category => {
          const validTags = categoryToTags[category] || []
          return validTags.some(tag =>
            event.tags?.some(
              eventTag =>
                eventTag.toLowerCase() === tag.toLowerCase()
            )
          )
        })
      )
    }

    let sorted = [...result]

    if (sortOption === "time") {
      sorted.sort(compareEventsByTime)
    }

    else if (sortOption === "alphabetical") {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    }

    else if (sortOption === "relevance") {
      if (!submittedSearchQuery.trim()) {
        sorted.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    return sorted
  }, [searchRanked, selectedCategories, sortOption, submittedSearchQuery])

  const nonFoodEvents = filteredEvents.filter(
    (event) => !isFoodEvent(event) && !isRestroom(event)
  );

  const totalResultsPages = Math.max(1, Math.ceil(nonFoodEvents.length / RESULTS_PAGE_SIZE))

  const eventsForCurrentPage = nonFoodEvents.slice(
    resultsPage * RESULTS_PAGE_SIZE,
    (resultsPage + 1) * RESULTS_PAGE_SIZE
  )

  // handlers

  const setHoveredEventFromList = useCallback((id: string | null) => {
    setHoveredEvent(id)
    setShouldPanToHovered(!!id)
  }, [])

  const setHoveredEventFromMap = useCallback((id: string | null) => {
    setHoveredEvent(id)
    setShouldPanToHovered(false)
  }, [])

  const handleMapMarkerClick = useCallback((eventId: string) => {
    const index = nonFoodEvents.findIndex(e => e.id === eventId)
    if (index >= 0) {
      const page = Math.floor(index / RESULTS_PAGE_SIZE)
      setResultsPage(page)
      setScrollToEventId(eventId)
    }
  }, [nonFoodEvents, RESULTS_PAGE_SIZE])

  const addToSchedule = useCallback((event: Event) => {
    setScheduledEvents(prev => {
      if (prev.find(e => e.id === event.id)) return prev

      const updated = [...prev, { ...event, orderIndex: prev.length }]
      updated.sort(compareEventsByTime)
      return updated.map((e, i) => ({ ...e, orderIndex: i }))
    })

    setRecentlyAddedId(event.id)
    setTimeout(() => setRecentlyAddedId(null), 700)
  }, [])

  const removeFromSchedule = useCallback((eventId: string) => {
    setScheduledEvents(prev => prev.filter(e => e.id !== eventId))
  }, [])

  const clearSearchHistory = () => {
    setSearchHistory([])
  }

  const reorderSchedule = useCallback((from: number, to: number) => {
    setScheduledEvents(prev => {
      const result = [...prev]
      const [removed] = result.splice(from, 1)
      result.splice(to, 0, removed)
      return result.map((e, i) => ({ ...e, orderIndex: i }))
    })
  }, [])

  const toggleCategory = useCallback((category: string) => {
    setActiveFeedTab("all")
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }, [])

  const selectRecommended = useCallback(() => {
    setSearchQuery("")
    setSubmittedSearchQuery("")
    setSelectedCategories([])
    setActiveFeedTab("recommended")
    setResultsPage(0)
  }, [])

  const setFeedTab = useCallback((tab: "recommended" | "all") => {
    if (tab === "recommended") {
      setSelectedCategories([])
      setSearchQuery("")
      setSubmittedSearchQuery("")
    }
    setActiveFeedTab(tab)
    setResultsPage(0)
  }, [])

  const handleShowAllFromBanner = useCallback(() => {
    setActiveFeedTab("all")
    setSelectedCategories([])
    setResultsPage(0)
  }, [])

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      await exportSchedulePdf(scheduledEvents)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleExportIcs = async () => {
    setIsExportingPdf(true)
    try {
      await exportScheduleIcs(scheduledEvents)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleBrowseAllEvents = () => {
    setActiveFeedTab("all")
    setSearchQuery("")
    setSubmittedSearchQuery("")
    setSelectedCategories([])
    setResultsPage(0)
  }
  // render

  return (
    <OnboardingProvider
      onResetSearch={() => {
        setSearchQuery("")
        setSubmittedSearchQuery("")
        setSelectedCategories([])
      }}
      onClearSchedule={() => setScheduledEvents([])}
      onPersonalizationComplete={handlePersonalizationComplete}
      scheduledEventCount={scheduledEvents.length}
    >
      {isMobile ? (
        <MobileScheduleMap
          events={events}
          nonFoodEvents={nonFoodEvents}
          scheduledEvents={scheduledEvents}
          hoveredEvent={hoveredEvent}
          setHoveredEventFromMap={setHoveredEventFromMap}
          shouldPanToHovered={shouldPanToHovered}
          handleMapMarkerClick={handleMapMarkerClick}
          resultsPage={resultsPage}
          RESULTS_PAGE_SIZE={RESULTS_PAGE_SIZE}
          recentlyAddedId={recentlyAddedId}
          isExportingPdf={isExportingPdf}
          removeFromSchedule={removeFromSchedule}
          reorderSchedule={reorderSchedule}
          handleExportPdf={handleExportPdf}
          handleExportIcs={handleExportIcs}

          addToSchedule={addToSchedule}
          scrollToEventId={scrollToEventId}
          setHoveredEventFromList={setHoveredEventFromList}
          totalResultsPages={totalResultsPages}
          setResultsPage={setResultsPage}
          submittedSearchQuery={submittedSearchQuery}
          handleBrowseAllEvents={handleBrowseAllEvents}

          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchHistory={searchHistory}
          clearSearchHistory={clearSearchHistory}

          onSearchSubmit={(value?: string) => {
            const finalQuery = (value ?? searchQuery).trim()

            if (!finalQuery) {
              setSearchQuery("")
              setSubmittedSearchQuery("")
              setResultsPage(0)
              return
            }

            setSearchQuery(finalQuery)
            setSubmittedSearchQuery(finalQuery)
            setResultsPage(0)

            setSearchHistory((prev) => {
              const updated = [
                finalQuery,
                ...prev.filter((q) => q !== finalQuery),
              ]
              return updated.slice(0, 5)
            })
          }}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}

          activeFeedTab={activeFeedTab}
          setActiveFeedTab={setFeedTab}

          selectedInterestLabels={selectedInterestLabels}
          onEditRecommended={() => setIsEditingRecommended(true)}
          onShowAll={handleShowAllFromBanner}
          onSelectRecommended={selectRecommended}
          recommendedActive={activeFeedTab === "recommended"}

          sortOption={sortOption}
          setSortOption={setSortOption}
        />
      ) : (
        <>
          <main className="h-screen flex flex-col bg-background px-4 sm:px-5 md:px-6 py-3 overflow-hidden">
            <div className="flex flex-col gap-5 md:gap-6 lg:flex-row lg:gap-4 flex-1 min-h-0">

              {/* LEFT SIDE */}
              <div className="order-1 flex flex-col min-w-0 lg:flex-1 lg:max-w-[520px] xl:max-w-[600px] lg:sticky lg:min-h-0">

                <div data-onboarding="search-section">
                  <SearchSection
                    events={events}
                    searchHistory={searchHistory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFeedTab={activeFeedTab}
                    setActiveFeedTab={setFeedTab}
                    selectedInterestLabels={selectedInterestLabels}
                    onEditRecommended={() => setIsEditingRecommended(true)}
                    onShowAll={handleShowAllFromBanner}
                    selectedCategories={selectedCategories}
                    toggleCategory={toggleCategory}
                    onSelectRecommended={selectRecommended}
                    recommendedActive={activeFeedTab === "recommended"}
                    onSearchSubmit={(value) => {
                      const finalQuery = (value ?? searchQuery).trim()
                      if (!finalQuery) {
                        setSearchQuery("")
                        setSubmittedSearchQuery("")
                        setResultsPage(0)
                        return
                      }

                      setActiveFeedTab("all")
                    setSearchQuery(finalQuery)
                    setSubmittedSearchQuery(finalQuery)
                    setResultsPage(0)

                    setSearchHistory(prev => {
                      const updated = [
                        finalQuery,
                        ...prev.filter(q => q !== finalQuery)
                      ]
                      return updated.slice(0, 5)
                    })
                  }}
                  clearSearchHistory={clearSearchHistory}
                />
              </div>

                <div data-onboarding="event-list" className="mt-6 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden lg:min-h-0">
                  <EventList
                    events={eventsForCurrentPage}
                    allFilteredCount={nonFoodEvents.length}
                    scheduledEvents={scheduledEvents}
                    addToSchedule={addToSchedule}
                    removeFromSchedule={removeFromSchedule}
                    hoveredEvent={hoveredEvent}
                    setHoveredEvent={setHoveredEventFromList}
                    scrollToEventId={scrollToEventId}
                    onScrollToEventDone={() => setScrollToEventId(null)}
                    page={resultsPage}
                    totalPages={totalResultsPages}
                    onPageChange={setResultsPage}
                    searchQuery={submittedSearchQuery}
                    onBrowseAll={handleBrowseAllEvents}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="order-2 w-full min-w-0 flex flex-col gap-6 relative lg:flex-1 lg:gap-0 lg:min-w-[360px] min-h-[320px] lg:sticky lg:min-h-0">
                <CampusMap
                  events={events}
                  browseEvents={nonFoodEvents}
                  scheduledEvents={scheduledEvents}
                  hoveredEvent={hoveredEvent}
                  setHoveredEvent={setHoveredEventFromMap}
                  shouldPanToHovered={shouldPanToHovered}
                  onMarkerClick={handleMapMarkerClick}
                  resultsPage={resultsPage}
                  pageSize={RESULTS_PAGE_SIZE}
                  recentlyAddedId={recentlyAddedId}
                  isExporting={isExportingPdf}
                />

                <SchedulePanel
                  scheduledEvents={scheduledEvents}
                  removeFromSchedule={removeFromSchedule}
                  reorderSchedule={reorderSchedule}
                  onExportPdf={handleExportPdf}
                  onExportIcs={handleExportIcs}
                  isExporting={isExportingPdf}
                />
              </div>

            </div>
          </main>
          {isEditingRecommended && (
            <PersonalizationDialog
              initialSelected={personalInterests ?? []}
              saveLabel="Save interests"
              onDismiss={() => setIsEditingRecommended(false)}
              onPersonalized={(ids) => {
                handlePersonalizationComplete(ids)
                setIsEditingRecommended(false)
              }}
            />
          )}
        </>
      )}
    </OnboardingProvider>
  )
}