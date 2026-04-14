"use client"

import { useEffect, useState } from "react"
import { CampusMap } from "@/app/components/campus-map"
import { SchedulePanel } from "@/app/components/schedule-panel"
import { EventList } from "@/app/components/event-list"
import { SearchSection } from "@/app/components/search-section"
import { useOnboarding } from "@/app/components/onboarding/onboarding-provider"

export function MobileScheduleMap({ data, ui, actions, schedule }: any) {
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
    submittedSearchQuery,
    searchQuery,
    searchHistory,
    activeFeedTab,
    selectedCategories,
    sortOption,
    recommendedActive,
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

  const [isListOpen, setIsListOpen] = useState(false)
  const { tutorialStep } = useOnboarding()
  const { restart } = useOnboarding()

  useEffect(() => {
    if (searchQuery.trim()) setIsListOpen(true)
  }, [searchQuery])

  useEffect(() => {
    if (tutorialStep === 2) setIsListOpen(false)
    else if (tutorialStep === 0 || tutorialStep === 1) setIsListOpen(true)
  }, [tutorialStep])

  const panelHeight = isListOpen ? "h-[85dvh]" : "h-[120px]"
  const panelTranslate = isListOpen
    ? "translate-y-0"
    : "translate-y-[calc(100%-120px)]"

  return (
    <div className="flex h-[100dvh] flex-col gap-4 bg-background py-3 pb-[120px]">
      {/* Schedule */}
      <div data-onboarding="schedule-panel">
        <SchedulePanel
          scheduledEvents={scheduledEvents}
          removeFromSchedule={removeFromSchedule}
          reorderSchedule={reorderSchedule}
          onExportPdf={handleExportPdf}
          onExportIcs={handleExportIcs}
          isExporting={isExportingPdf}
        />
      </div>

      {/* Map */}
      <div
        data-onboarding="campus-map"
        className="relative z-0 min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200"
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
          pageSize={eventsForCurrentPage.length || 5}
          recentlyAddedId={recentlyAddedId}
          isExporting={isExportingPdf}
        />
      </div>

      {/* Overlay */}
      {isListOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25"
          onClick={() => setIsListOpen(false)}
        />
      )}

      {/* Pop up */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${panelTranslate}`}
      >
        <div onClick={() => setIsListOpen(true)}>
          <div className={`flex flex-col rounded-t-3xl bg-white shadow-2xl ${panelHeight}`}>
            
            {/* Header */}
            <div
              className="relative z-50 shrink-0 rounded-t-3xl bg-white/95 px-4 pt-2 pb-2 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setIsListOpen((prev) => !prev)}
                className="mb-2 flex w-full flex-col items-center"
              >
                <svg
                  className={`text-gray-400 transition-transform duration-300 ${
                    isListOpen ? "rotate-180" : ""
                  }`}
                  width="28"
                  height="16"
                  viewBox="0 0 28 16"
                  fill="none"
                >
                  <path
                    d="M2 12 L14 4 L26 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Search */}
              <div data-onboarding="search-section" className="relative z-[60]">
                <SearchSection
                  events={events}
                  searchHistory={searchHistory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearchSubmit={(value) =>
                    commitSearch(value, { forceAll: true })
                  }
                  clearSearchHistory={clearSearchHistory}
                  activeFeedTab={activeFeedTab}
                  setActiveFeedTab={setFeedTab}
                  selectedInterestLabels={selectedInterestLabels}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  onShowAll={handleShowAllFromBanner}
                  onSelectRecommended={selectRecommended}
                  recommendedActive={recommendedActive}
                  selectedSort={sortOption}
                  setSelectedSort={setSortOption}
                  onEditRecommended={restart}
                />
              </div>
            </div>

            {/* Event List */}
            {isListOpen && (
              <div
                data-onboarding="event-list"
                className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                onClick={(e) => e.stopPropagation()}
              >
                <EventList
                  events={eventsForCurrentPage}
                  allFilteredCount={nonFoodEvents.length}
                  scheduledEvents={scheduledEvents}
                  addToSchedule={addToSchedule}
                  removeFromSchedule={removeFromSchedule}
                  hoveredEvent={hoveredEvent}
                  setHoveredEvent={setHoveredEventFromList}
                  scrollToEventId={null}
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