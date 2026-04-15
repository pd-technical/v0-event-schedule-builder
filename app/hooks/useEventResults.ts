import { useMemo } from "react"
import type { Event } from "@/app/page"
import type { SortOption } from "@/app/components/sort-dropdown"
import {
  PERSONALIZATION_PILLS,
  topEventsForPersonalization,
  type PersonalizationPillId,
} from "@/app/lib/personalizationInterests"
import { rankedEventMatchesSearch } from "@/app/lib/searchUtils"
import {
  CATEGORY_TO_TAGS,
  compareEventsByTime,
  isFoodEvent,
  isRestroom,
} from "@/app/lib/eventUtils"

interface UseEventResultsParams {
  events: Event[]
  personalInterests: PersonalizationPillId[] | null
  activeFeedTab: "recommended" | "all"
  submittedSearchQuery: string
  selectedCategories: string[]
  sortOption: SortOption
  resultsPage: number
  resultsPageSize: number
}

export function useEventResults({
  events,
  personalInterests,
  activeFeedTab,
  submittedSearchQuery,
  selectedCategories,
  sortOption,
  resultsPage,
  resultsPageSize,
}: UseEventResultsParams) {
  const recommendedSeedEvents = useMemo(
    () =>
      personalInterests?.length
        ? topEventsForPersonalization(events, personalInterests, 3)
        : [],
    [events, personalInterests]
  )

  const selectedInterestLabels = useMemo(() => {
    if (!personalInterests?.length) return []

    const labelMap = new Map(
      PERSONALIZATION_PILLS.map((pill) => [pill.id, pill.label])
    )

    return personalInterests.map((id) => labelMap.get(id) ?? id).slice(0, 3)
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

  const searchRanked = useMemo(() => {
    const trimmedQuery = submittedSearchQuery.trim()

    if (!trimmedQuery) return baseEvents

    const pool = activeFeedTab === "recommended" ? baseEvents : events
    return rankedEventMatchesSearch(pool, submittedSearchQuery)
  }, [baseEvents, submittedSearchQuery, events, activeFeedTab])

  const filteredEvents = useMemo(() => {
    let result = searchRanked

    if (selectedCategories.length > 0) {
      result = result.filter((event) =>
        selectedCategories.some((category) => {
          const validTags = CATEGORY_TO_TAGS[category] || []

          return validTags.some((tag) =>
            event.tags?.some(
              (eventTag) => eventTag.toLowerCase() === tag.toLowerCase()
            )
          )
        })
      )
    }

    const sorted = [...result]

    if (sortOption === "earliest") {
      sorted.sort(compareEventsByTime)
    } else if (sortOption === "az") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortOption === "relevance") {
      if (!submittedSearchQuery.trim()) {
        sorted.sort((a, b) => a.name.localeCompare(b.name))
      }
    }

    return sorted
  }, [searchRanked, selectedCategories, sortOption, submittedSearchQuery])

  const displayedEvents = useMemo(
    () => filteredEvents.filter((event) => !isFoodEvent(event) && !isRestroom(event)),
    [filteredEvents]
  )

  const totalResultsPages = useMemo(
    () => Math.max(1, Math.ceil(displayedEvents.length / resultsPageSize)),
    [displayedEvents.length, resultsPageSize]
  )

  const eventsForCurrentPage = useMemo(
    () =>
      displayedEvents.slice(
        resultsPage * resultsPageSize,
        (resultsPage + 1) * resultsPageSize
      ),
    [displayedEvents, resultsPage, resultsPageSize]
  )

  return {
    recommendedSeedEvents,
    selectedInterestLabels,
    baseEvents,
    searchRanked,
    filteredEvents,
    displayedEvents,
    totalResultsPages,
    eventsForCurrentPage,
  }
}