"use client"

import { CampusMap } from "@/app/components/campus-map"
import { SchedulePanel } from "@/app/components/schedule-panel"
import { EventList } from "@/app/components/event-list"
import { SearchSection } from "@/app/components/search-section"
import { useEffect, useState } from "react"

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

  return (
    <div className="flex flex-col gap-4 py-3 pb-24">
      <SchedulePanel
        scheduledEvents={scheduledEvents}
        removeFromSchedule={removeFromSchedule}
        reorderSchedule={reorderSchedule}
        onExportPdf={handleExportPdf}
        onExportIcs={handleExportIcs}
        isExporting={isExportingPdf}
      />

      <div
        className="relative z-0 h-[55vh] rounded-2xl overflow-hidden border border-border"
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
           className="fixed inset-0 bg-black/25 z-40 transition-opacity"
          onClick={() => setIsListOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-x-0 bottom-0 z-50
          transition-transform duration-300 ease-in-out
          ${isListOpen ? "translate-y-0" : "translate-y-[calc(100%-120px)]"}
        `}
      >
        <div
          className="pt-2 pb-2 cursor-pointer"
          onClick={() => setIsListOpen(true)}
        >
          <div className="bg-white rounded-t-3xl shadow-2xl border-t border-border overflow-hidden">
            <div className="px-4 pt-2 pb-2 bg-white/95 backdrop-blur-sm">

              {/* HANDLE */}
              <button
                onClick={() => setIsListOpen(prev => !prev)}
                className="w-full flex flex-col items-center mb-2"
              >
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </button>


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
              />
            </div>

            {isListOpen && (
<<<<<<< HEAD
              <div className="max-h-[55vh] overflow-y-auto px-4 pb-4">
=======
              <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
>>>>>>> 35703f5 (made the card scroll up further)
                <EventList
                  events={nonFoodEvents.slice(
                    resultsPage * RESULTS_PAGE_SIZE,
                    (resultsPage + 1) * RESULTS_PAGE_SIZE
                  )}
                  allFilteredCount={nonFoodEvents.length}
                  scheduledEvents={scheduledEvents}
                  addToSchedule={addToSchedule}
                  removeFromSchedule={removeFromSchedule}
                  hoveredEvent={hoveredEvent}
                  setHoveredEvent={setHoveredEventFromList}
                  scrollToEventId={scrollToEventId}
                  onScrollToEventDone={() => { }}
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