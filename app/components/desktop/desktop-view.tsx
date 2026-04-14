"use client"

import { SearchSection } from "@/app/components/search-section"
import { EventList } from "@/app/components/event-list"
import { CampusMap } from "@/app/components/campus-map"
import { SchedulePanel } from "@/app/components/schedule-panel"
import { PersonalizationDialog } from "@/app/components/onboarding/personalization-dialog"
import type { Event, ScheduledEvent } from "@/app/page"
import type { PersonalizationPillId } from "@/app/lib/personalizationInterests"
import type { SortOption } from "@/app/components/sort-dropdown"

interface DesktopLayoutProps {
  data: {
    events: Event[]
    nonFoodEvents: Event[]
    eventsForCurrentPage: Event[]
    scheduledEvents: ScheduledEvent[]
    selectedInterestLabels: string[]
  }
  ui: {
    hoveredEvent: string | null
    shouldPanToHovered: boolean
    resultsPage: number
    totalResultsPages: number
    scrollToEventId: string | null
    submittedSearchQuery: string
    searchQuery: string
    searchHistory: string[]
    activeFeedTab: "recommended" | "all"
    selectedCategories: string[]
    sortOption: SortOption
  }
  actions: {
    setHoveredEventFromMap: (id: string | null) => void
    setHoveredEventFromList: (id: string | null) => void
    handleMapMarkerClick: (eventId: string) => void
    setResultsPage: (page: number) => void
    handleBrowseAllEvents: () => void
    setSearchQuery: (value: string) => void
    clearSearchHistory: () => void
    toggleCategory: (category: string) => void
    setFeedTab: (tab: "recommended" | "all") => void
    selectRecommended: () => void
    handleShowAllFromBanner: () => void
    setSortOption: (sort: SortOption) => void
    commitSearch: (value?: string, options?: { forceAll?: boolean }) => void
  }
  schedule: {
    recentlyAddedId: string | null
    isExportingPdf: boolean
    addToSchedule: (event: Event) => void
    removeFromSchedule: (eventId: string) => void
    reorderSchedule: (startIndex: number, endIndex: number) => void
    handleExportPdf: () => void
    handleExportIcs: () => void
  }
  isEditingRecommended: boolean
  setIsEditingRecommended: (value: boolean) => void
  personalInterests: PersonalizationPillId[] | null
  onPersonalizationComplete: (ids: PersonalizationPillId[]) => void
}

export function DesktopLayout({
  data,
  ui,
  actions,
  schedule,
  isEditingRecommended,
  setIsEditingRecommended,
  personalInterests,
  onPersonalizationComplete,
}: DesktopLayoutProps) {
  const {
    events,
    nonFoodEvents,
    eventsForCurrentPage,
    scheduledEvents,
    selectedInterestLabels,
  } = data

  const {
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
  } = ui

  const {
    setHoveredEventFromMap,
    setHoveredEventFromList,
    handleMapMarkerClick,
    setResultsPage,
    handleBrowseAllEvents,
    setSearchQuery,
    clearSearchHistory,
    toggleCategory,
    setFeedTab,
    selectRecommended,
    handleShowAllFromBanner,
    setSortOption,
    commitSearch,
  } = actions

  const {
    recentlyAddedId,
    isExportingPdf,
    addToSchedule,
    removeFromSchedule,
    reorderSchedule,
    handleExportPdf,
    handleExportIcs,
  } = schedule

  return (
    <>
      <main className="flex h-screen flex-col overflow-hidden bg-background px-4 py-3 sm:px-5 md:px-6">
        <div className="flex min-h-0 flex-1 flex-col gap-5 md:gap-6 lg:flex-row lg:gap-4">
          <section className="order-1 flex min-w-0 flex-col lg:min-h-0 lg:max-w-[520px] lg:flex-1 xl:max-w-[600px]">
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
                onSearchSubmit={(value) => commitSearch(value, { forceAll: true })}
                clearSearchHistory={clearSearchHistory}
              />
            </div>

            <div
              data-onboarding="event-list"
              className="mt-6 flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden"
            >
              <EventList
                events={eventsForCurrentPage}
                allFilteredCount={nonFoodEvents.length}
                scheduledEvents={scheduledEvents}
                addToSchedule={addToSchedule}
                removeFromSchedule={removeFromSchedule}
                hoveredEvent={hoveredEvent}
                setHoveredEvent={setHoveredEventFromList}
                scrollToEventId={scrollToEventId}
                onScrollToEventDone={() => {}}
                page={resultsPage}
                totalPages={totalResultsPages}
                onPageChange={setResultsPage}
                searchQuery={submittedSearchQuery}
                onBrowseAll={handleBrowseAllEvents}
                sortOption={sortOption}
                setSortOption={setSortOption}
              />
            </div>
          </section>

          <aside className="relative order-2 flex min-h-[320px] w-full min-w-0 flex-col gap-6 lg:min-h-0 lg:min-w-[360px] lg:flex-1 lg:gap-0">
            <CampusMap
              events={events}
              browseEvents={nonFoodEvents}
              scheduledEvents={scheduledEvents}
              hoveredEvent={hoveredEvent}
              setHoveredEvent={setHoveredEventFromMap}
              shouldPanToHovered={shouldPanToHovered}
              onMarkerClick={handleMapMarkerClick}
              resultsPage={resultsPage}
              pageSize={20}
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
          </aside>
        </div>
      </main>

      {isEditingRecommended && (
        <PersonalizationDialog
          initialSelected={personalInterests ?? []}
          saveLabel="Save interests"
          onDismiss={() => setIsEditingRecommended(false)}
          onPersonalized={(ids) => {
            onPersonalizationComplete(ids)
            setIsEditingRecommended(false)
          }}
        />
      )}
    </>
  )
}