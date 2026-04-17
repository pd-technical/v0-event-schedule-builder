"use client"

import { useState, useCallback, useEffect } from "react"

// components
import { OnboardingProvider } from "@/app/components/onboarding/onboarding-provider"
import { MobileScheduleMap } from "./components/mobile/mobile-view"
import { MobileWarningDialog } from "./components/mobile/mobile-warning-dialog"
import { DesktopLayout } from "./components/desktop/desktop-view"
import type { SortOption } from "@/app/components/sort-dropdown"

// utils + hooks
import { getEvents } from "@/app/lib/fetchEvents"
import type { PersonalizationPillId } from "@/app/lib/personalizationInterests"
import { useEventResults } from "@/app/hooks/useEventResults"
import { useScheduleManager } from "@/app/hooks/useScheduleManager"

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

export default function PicnicDayPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [eventsReady, setEventsReady] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("")
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("relevance")

  const [personalInterests, setPersonalInterests] = useState<PersonalizationPillId[] | null>(null)
  const [activeFeedTab, setActiveFeedTab] = useState<"recommended" | "all">("all")
  const [isEditingRecommended, setIsEditingRecommended] = useState(false)

  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [shouldPanToHovered, setShouldPanToHovered] = useState(false)
  const [scrollToEventId, setScrollToEventId] = useState<string | null>(null)
  const [resultsPage, setResultsPage] = useState(0)

  const [isMobile, setIsMobile] = useState(false)
  const [mobileWarningDismissed, setMobileWarningDismissed] = useState(false)

  const resultsPageSize = 20

  const {
    scheduledEvents,
    setScheduledEvents,
    recentlyAddedId,
    isExportingPdf,
    addToSchedule,
    removeFromSchedule,
    reorderSchedule,
    handleExportPdf,
    handleExportIcs,
  } = useScheduleManager(events, eventsReady)

  const resetSearchState = useCallback(() => {
    setSearchQuery("")
    setSubmittedSearchQuery("")
    setResultsPage(0)
  }, [])

  const resetFilters = useCallback(() => {
    setSelectedCategories([])
  }, [])

  const goToAllFeed = useCallback(() => {
    setActiveFeedTab("all")
    resetFilters()
    resetSearchState()
  }, [resetFilters, resetSearchState])

  const goToRecommendedFeed = useCallback(() => {
    setActiveFeedTab("recommended")
    resetFilters()
    resetSearchState()
  }, [resetFilters, resetSearchState])

  const setFeedTab = useCallback(
    (tab: "recommended" | "all") => {
      if (tab === "recommended") {
        goToRecommendedFeed()
      } else {
        goToAllFeed()
      }
    },
    [goToRecommendedFeed, goToAllFeed]
  )

  const {
    selectedInterestLabels,
    displayedEvents,
    totalResultsPages,
    eventsForCurrentPage,
  } = useEventResults({
    events,
    personalInterests,
    activeFeedTab,
    submittedSearchQuery,
    selectedCategories,
    sortOption,
    resultsPage,
    resultsPageSize,
  })

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

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSubmittedSearchQuery("")
      setResultsPage(0)
    }
  }, [searchQuery])

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortOption(sort)
    setResultsPage(0)
  }, [])

  const commitSearch = useCallback(
    (value?: string, options?: { forceAll?: boolean }) => {
      const finalQuery = (value ?? searchQuery).trim()

      if (!finalQuery) {
        resetSearchState()
        return
      }

      if (options?.forceAll) {
        setActiveFeedTab("all")
        setSelectedCategories([])
      }

      setSearchQuery(finalQuery)
      setSubmittedSearchQuery(finalQuery)
      setResultsPage(0)

      setSearchHistory((prev) => {
        const updated = [finalQuery, ...prev.filter((q) => q !== finalQuery)]
        return updated.slice(0, 5)
      })
    },
    [searchQuery, resetSearchState]
  )

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
  }, [])

  const toggleCategory = useCallback((category: string) => {
    setActiveFeedTab("all")
    setResultsPage(0)
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }, [])

  const setHoveredEventFromList = useCallback((id: string | null) => {
    setHoveredEvent(id)
    setShouldPanToHovered(Boolean(id))
  }, [])

  const setHoveredEventFromMap = useCallback((id: string | null) => {
    setHoveredEvent(id)
    setShouldPanToHovered(false)
  }, [])

  const handleMapMarkerClick = useCallback(
    (eventId: string) => {
      const index = displayedEvents.findIndex((event) => event.id === eventId)

      if (index >= 0) {
        const page = Math.floor(index / resultsPageSize)
        setResultsPage(page)
        setScrollToEventId(eventId)
      }
    },
    [displayedEvents, resultsPageSize]
  )

  const handlePersonalizationComplete = useCallback((interestIds: PersonalizationPillId[]) => {
    setPersonalInterests(interestIds)
    setSelectedCategories([])
    setSearchQuery("")
    setSubmittedSearchQuery("")
    setActiveFeedTab("recommended")
    setResultsPage(0)
  }, [])

  const data = {
    events,
    displayedEvents,
    eventsForCurrentPage,
    scheduledEvents,
    selectedInterestLabels,
  }

  const ui = {
    hoveredEvent,
    shouldPanToHovered,
    resultsPage,
    totalResultsPages,
    scrollToEventId,
    submittedSearchQuery,
    searchQuery,
    searchHistory,
    activeFeedTab,
    selectedCategories,
    sortOption,
    recommendedActive: activeFeedTab === "recommended",
  }

  const actions = {
    setHoveredEventFromMap,
    setHoveredEventFromList,
    handleMapMarkerClick,
    setResultsPage,
    handleBrowseAllEvents: goToAllFeed,
    setSearchQuery,
    clearSearchHistory,
    toggleCategory,
    setFeedTab,
    selectRecommended: goToRecommendedFeed,
    handleShowAllFromBanner: goToAllFeed,
    setSortOption: handleSortChange,
    commitSearch,
  }

  const schedule = {
    recentlyAddedId,
    isExportingPdf,
    addToSchedule,
    removeFromSchedule,
    reorderSchedule,
    handleExportPdf,
    handleExportIcs,
  }

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
      {/* Show mobile warning once on first mobile visit */}
      {isMobile && !mobileWarningDismissed && (
        <MobileWarningDialog onDismiss={() => setMobileWarningDismissed(true)} />
      )}
      {isMobile ? (
        <MobileScheduleMap
          data={data}
          ui={ui}
          actions={actions}
          schedule={schedule}
        />
      ) : (
        <DesktopLayout
          data={data}
          ui={ui}
          actions={actions}
          schedule={schedule}
          isEditingRecommended={isEditingRecommended}
          setIsEditingRecommended={setIsEditingRecommended}
          personalInterests={personalInterests}
          onPersonalizationComplete={handlePersonalizationComplete}
        />
      )}
    </OnboardingProvider>
  )
}
