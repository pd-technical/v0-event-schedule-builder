"use client"

import { useEffect, useState } from "react"
import { CampusMap } from "@/app/components/campus-map"
import { SchedulePanel } from "@/app/components/schedule-panel"
import { EventList } from "@/app/components/event-list"
import { SearchSection } from "@/app/components/search-section"

export function MobileScheduleMap(props: any) {
  const {
    events,
    nonFoodEvents,
    scheduledEvents,
    hoveredEvent,
    setHoveredEventFromMap,
    shouldPanToHovered,
    handleMapMarkerClick,
    resultsPage,
    RESULTS_PAGE_SIZE,
    recentlyAddedId,
    isExportingPdf,
    removeFromSchedule,
    reorderSchedule,
    handleExportPdf,
    handleExportIcs,
    addToSchedule,
    scrollToEventId,
    setHoveredEventFromList,
    totalResultsPages,
    setResultsPage,
    submittedSearchQuery,
    handleBrowseAllEvents,
    searchQuery,
    setSearchQuery,
    searchHistory,
    onSearchSubmit,
    clearSearchHistory,
    sortOption,
    setSortOption,
    activeFeedTab,
    setActiveFeedTab,
    selectedInterestLabels,
    onEditRecommended,
    onShowAll,
    selectedCategories,
    toggleCategory,
    onSelectRecommended,
    recommendedActive,
  } = props

  const [isListOpen, setIsListOpen] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsListOpen(true)
    }
  }, [searchQuery])

  const paginatedEvents = nonFoodEvents.slice(
    resultsPage * RESULTS_PAGE_SIZE,
    (resultsPage + 1) * RESULTS_PAGE_SIZE
  )

  return (
    <div className="flex flex-col gap-4 bg-background py-3 pb-24">
      <SchedulePanel
        scheduledEvents={scheduledEvents}
        removeFromSchedule={removeFromSchedule}
        reorderSchedule={reorderSchedule}
        onExportPdf={handleExportPdf}
        onExportIcs={handleExportIcs}
        isExporting={isExportingPdf}
      />

      <div
        className="relative z-0 h-[55vh] overflow-hidden rounded-2xl border border-gray-200"
        onClick={() => setIsListOpen(false)}
      >
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
      </div>

      {isListOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25"
          onClick={() => setIsListOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-x-0 bottom-0 z-50
          transition-transform duration-300 ease-in-out
          ${isListOpen ? "translate-y-0" : "translate-y-[calc(100%-140px)]"}
        `}
      >
        <div onClick={() => setIsListOpen(true)}>
          <div
            className={`
              flex flex-col rounded-t-3xl bg-white shadow-2xl
              ${isListOpen ? "h-[85dvh]" : "h-[140px]"}
            `}
          >
            <div
              className="relative z-50 shrink-0 rounded-t-3xl bg-white/95 px-4 pt-2 pb-2 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsListOpen((prev: boolean) => !prev)}
                className="mb-2 flex w-full flex-col items-center"
              >
                <div className="h-1.5 w-10 rounded-full bg-gray-300" />
              </button>

              <div className="mb-2 text-center text-sm font-medium">
                Browse Events ({nonFoodEvents.length})
              </div>

              <div className="relative z-[60]">
                <SearchSection
                  events={events}
                  searchHistory={searchHistory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearchSubmit={onSearchSubmit}
                  clearSearchHistory={clearSearchHistory}
                  activeFeedTab={activeFeedTab}
                  setActiveFeedTab={setActiveFeedTab}
                  selectedInterestLabels={selectedInterestLabels}
                  onEditRecommended={onEditRecommended}
                  onShowAll={onShowAll}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  onSelectRecommended={onSelectRecommended}
                  recommendedActive={recommendedActive}
                  selectedSort={sortOption}
                  setSelectedSort={setSortOption}
                />
              </div>
            </div>

            {isListOpen && (
              <div
                className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                onClick={(e) => e.stopPropagation()}
              >
                <EventList
                  events={paginatedEvents}
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}