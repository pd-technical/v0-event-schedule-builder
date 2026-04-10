"use client"

import { Search, Clock, X, HelpCircle, Pencil } from "lucide-react"
import { useMemo, useState } from "react"
import type { Event } from "@/app/page"
import { useOnboarding } from "@/app/components/onboarding/onboarding-provider"
import {
  EVENT_FILTER_CATEGORY_PILLS,
  filterPillCategoryOn,
  filterPillIdle,
  filterPillRecommendedOn,
} from "@/app/lib/eventFilters"

/** Same typography for Recommended, All events, and category pills (must stay in sync). */
const FILTER_BY_PILL_TEXT =
  "px-4 py-2 text-sm font-medium leading-none transition-colors"

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
}: SearchSectionProps) {
  const { restart } = useOnboarding()
  const dropdownItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    if (q) {
      return []
    }

    return searchHistory.slice(0, 5).map((term) => ({
      type: "history" as const,
      label: term,
    }))
  }, [searchQuery, events, searchHistory])

  const [isFocused, setIsFocused] = useState(false)
  const allEventsActive = activeFeedTab === "all"

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSearchSubmit(searchQuery)
            }}
            className="flex w-full min-w-0"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Search for events..."
              className="
                min-w-0 flex-1
                rounded-l-xl border border-primary/25
                bg-secondary px-4 py-3
                text-foreground
                placeholder:text-muted-foreground
                transition-all
                focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25
              "
            />

            <button
              type="submit"
              className="flex items-center justify-center rounded-r-xl bg-primary px-5 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {isFocused && dropdownItems.length > 0 && (
            <div className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-[0_10px_25px_rgba(2,40,81,0.08)]">
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Recent Searches
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearSearchHistory}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFocused(false)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {dropdownItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseDown={() => {
                    setSearchQuery(item.label)
                    onSearchSubmit(item.label)
                    setIsFocused(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-primary/5"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveFeedTab("all")
            restart()
          }}
          className="flex shrink-0 items-center justify-center rounded-xl bg-primary px-3 py-3.5 text-primary-foreground transition-colors hover:bg-primary/90"
          aria-label="Help"
          title="Replay tutorial"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {activeFeedTab === "recommended" && (
        <div className="mt-5 rounded-xl border border-[#f3e7c9] bg-[#f8f4e8] px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-foreground">
                Showing events for your interests:
              </span>
              {selectedInterestLabels.length > 0 ? (
                <>
                  <span className="text-sm font-semibold italic text-foreground">
                    {selectedInterestLabels.join(", ")}
                  </span>
                  {onEditRecommended && (
                    <button
                      type="button"
                      onClick={onEditRecommended}
                      className="inline-flex shrink-0 rounded p-1 text-[#6b4f3c] hover:bg-black/5"
                      aria-label="Edit recommended interests"
                      title="Edit recommended interests"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="text-sm italic text-muted-foreground">
                    Complete personalization to load your recommended picks.
                  </span>
                  {onEditRecommended && (
                    <button
                      type="button"
                      onClick={onEditRecommended}
                      className="inline-flex shrink-0 rounded p-1 text-[#6b4f3c] hover:bg-black/5"
                      aria-label="Add your interests"
                      title="Pick your interests"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                  )}
                </>
              )}
            </div>
            {onShowAll && (
              <button
                type="button"
                onClick={onShowAll}
                className="ml-auto shrink-0 text-xs font-bold uppercase tracking-wide text-[#2a2018] hover:underline"
              >
                Show all
              </button>
            )}
          </div>
        </div>
      )}

      <div
        data-onboarding="category-filters"
        className="mt-5 flex flex-col gap-2 xl:flex-row xl:items-start xl:gap-3"
      >
        <h3 className="shrink-0 pt-0.5 text-xs font-semibold uppercase leading-none tracking-wide text-muted-foreground xl:pt-1.5">
          FILTER BY
        </h3>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelectRecommended}
            className={`${FILTER_BY_PILL_TEXT} ${
              recommendedActive ? filterPillRecommendedOn : filterPillIdle
            }`}
          >
            Recommended
          </button>
          <button
            type="button"
            onClick={() => setActiveFeedTab("all")}
            className={`${FILTER_BY_PILL_TEXT} ${
              allEventsActive ? filterPillCategoryOn : filterPillIdle
            }`}
          >
            All Events
          </button>
          {EVENT_FILTER_CATEGORY_PILLS.map((category) => {
            const isSelected = selectedCategories.includes(category.id)
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`${FILTER_BY_PILL_TEXT} ${
                  isSelected ? filterPillCategoryOn : filterPillIdle
                }`}
              >
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c9a227]" />
            {selectedCategories.length} filter{selectedCategories.length !== 1 ? "s" : ""} active
          </span>

          <button
            type="button"
            onClick={() => selectedCategories.forEach(toggleCategory)}
            className="font-medium text-primary transition hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
