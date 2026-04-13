"use client"

import type { Event } from "@/app/page"
import { useOnboarding } from "@/app/components/onboarding/onboarding-provider"
import { SearchBarSection } from "@/app/components/search-bar-section"
import { FilterSection } from "@/app/components/filter-section"
import type { SortOption } from "@/app/components/sort-dropdown"

interface SearchSectionProps {
  events: Event[]
  searchHistory: string[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearchSubmit: (value?: string) => void
  clearSearchHistory: () => void
  activeFeedTab: "recommended" | "all"
  setActiveFeedTab: (tab: "recommended" | "all") => void
  selectedInterestLabels: string[]
  onEditRecommended?: () => void
  onShowAll?: () => void
  selectedCategories: string[]
  toggleCategory: (category: string) => void
  onSelectRecommended: () => void
  recommendedActive: boolean
  selectedSort: SortOption
  setSelectedSort: (sort: SortOption) => void
}

export function SearchSection({
  events,
  searchHistory,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  clearSearchHistory,
  activeFeedTab,
  setActiveFeedTab,
  selectedInterestLabels,
  onEditRecommended,
  onShowAll,
  selectedCategories,
  toggleCategory,
  onSelectRecommended,
  recommendedActive,
  selectedSort,
  setSelectedSort,
}: SearchSectionProps) {
  const { restart } = useOnboarding()

  const handleHelpClick = () => {
    setActiveFeedTab("all")
    restart()
  }

  return (
    <>
      {/* MOBILE / TABLET */}
<div className="relative z-30 overflow-visible rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-sm md:hidden">
        <SearchBarSection
          events={events}
          searchHistory={searchHistory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={onSearchSubmit}
          clearSearchHistory={clearSearchHistory}
          onHelpClick={handleHelpClick}
          mobile
        />

        <FilterSection
          activeFeedTab={activeFeedTab}
          setActiveFeedTab={setActiveFeedTab}
          selectedInterestLabels={selectedInterestLabels}
          onEditRecommended={onEditRecommended}
          onShowAll={onShowAll}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          onSelectRecommended={onSelectRecommended}
          recommendedActive={recommendedActive}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          mobile
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm md:block md:p-5">
        <SearchBarSection
          events={events}
          searchHistory={searchHistory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={onSearchSubmit}
          clearSearchHistory={clearSearchHistory}
          onHelpClick={handleHelpClick}
        />

        <FilterSection
          activeFeedTab={activeFeedTab}
          setActiveFeedTab={setActiveFeedTab}
          selectedInterestLabels={selectedInterestLabels}
          onEditRecommended={onEditRecommended}
          onShowAll={onShowAll}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          onSelectRecommended={onSelectRecommended}
          recommendedActive={recommendedActive}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </div>
    </>
  )
}