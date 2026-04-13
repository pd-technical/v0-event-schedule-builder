"use client"

import { Search, Clock, X, HelpCircle, Pencil, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import type { Event } from "@/app/page"
import { useOnboarding } from "@/app/components/onboarding/onboarding-provider"
import {
  EVENT_FILTER_CATEGORY_PILLS,
  filterPillCategoryOn,
  filterPillIdle,
  filterPillRecommendedOn,
} from "@/app/lib/eventFilters"
import { rankedEventMatchesSearch } from "@/app/lib/searchUtils"

/** Compact pills so two rows fit in the sidebar (Recommended row + categories). */
const FILTER_BY_PILL_TEXT =
  "px-3 py-1.5 text-xs font-semibold leading-tight transition-colors"

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

const MAX_SUGGESTIONS = 8

/** Bold the first case-insensitive match of `query` in `text`. */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>

  const lower = text.toLowerCase()
  const idx = lower.indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-accent/35 px-0.5 font-medium text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  )
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
  const trimmedQuery = searchQuery.trim()

  const { items, mode } = useMemo(() => {
    if (trimmedQuery) {
      const matches = rankedEventMatchesSearch(events, trimmedQuery).slice(
        0,
        MAX_SUGGESTIONS
      )
      return {
        mode: "events" as const,
        items: matches.map((event) => ({ type: "event" as const, event })),
      }
    }

    return {
      mode: "history" as const,
      items: searchHistory.slice(0, 5).map((label) => ({
        type: "history" as const,
        label,
      })),
    }
  }, [trimmedQuery, events, searchHistory])

  const [isFocused, setIsFocused] = useState(false)
  const showDropdown =
    isFocused && (mode === "events" ? true : items.length > 0)

  const showNoResults =
    isFocused && mode === "events" && trimmedQuery && items.length === 0

  const allEventsActive = activeFeedTab === "all"

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-stretch gap-2 sm:gap-3">
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
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 150)
              }}
              placeholder="Search for events..."
              autoComplete="off"
              aria-expanded={showDropdown || showNoResults ? true : false}
              aria-controls="search-suggestions"
              aria-autocomplete="list"
              className="
<<<<<<< HEAD
                h-12 min-w-0 flex-1
                rounded-l-xl border border-[#B8D4E8] bg-[#E6F0F9]
                px-4 text-sm text-[#002D62]
                placeholder:text-[#64748B]
                transition-all
                focus:border-[#002D62] focus:outline-none focus:ring-2 focus:ring-[#002D62]/20
              "
=======
                flex-1
                min-w-0
                px-4
                py-3
                bg-secondary
                border border-primary/20
                rounded-l-lg
                text-foreground
                placeholder:text-muted-foreground
                focus:outline-none
                focus:ring-2
                focus:ring-primary/25
                focus:border-primary
                transition-all
            "
>>>>>>> f10c7ce (fixed UI of the new search card)
            />

            <button
              type="submit"
              className="flex h-12 w-14 shrink-0 items-center justify-center rounded-r-xl bg-[#002D62] text-white transition-colors hover:bg-[#00244d] sm:w-16"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </form>

          {(showDropdown || showNoResults) && (
            <div
              id="search-suggestions"
              role="listbox"
<<<<<<< HEAD
              className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-[0_10px_25px_rgba(2,40,81,0.08)]"
=======
              className="absolute z-[70] mt-2 w-full bg-card border border-border rounded-lg shadow-[0_10px_25px_rgba(2,40,81,0.08)] max-h-72 overflow-y-auto"
>>>>>>> f10c7ce (fixed UI of the new search card)
            >
              {showNoResults ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No events match &ldquo;{trimmedQuery}&rdquo;. Try a different
                  word or check spelling.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-border/60 px-4 pb-2 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                      {mode === "events"
                        ? "Matching events"
                        : "Recent searches"}
                    </span>

                    <div className="flex items-center gap-3">
                      {mode === "history" && (
                        <button
                          type="button"
                          onClick={clearSearchHistory}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsFocused(false)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Close suggestions"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {items.map((item, index) =>
                    item.type === "history" ? (
                      <button
                        key={`h-${item.label}-${index}`}
                        type="button"
                        role="option"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setSearchQuery(item.label)
                          onSearchSubmit(item.label)
                          setIsFocused(false)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary/5"
                      >
                        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ) : (
                      <button
                        key={item.event.id}
                        type="button"
                        role="option"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          const name = item.event.name
                          setSearchQuery(name)
                          onSearchSubmit(name)
                          setIsFocused(false)
                        }}
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary/5"
                      >
                        <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            <HighlightMatch
                              text={item.event.name}
                              query={trimmedQuery}
                            />
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {item.event.startTime} · {item.event.location}
                            </span>
                          </span>
                        </span>
                      </button>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveFeedTab("all")
            restart()
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002D62] text-white transition-colors hover:bg-[#00244d]"
          aria-label="Help"
          title="Replay tutorial"
        >
          <HelpCircle className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
<<<<<<< HEAD

      {activeFeedTab === "recommended" && (
        <div className="mt-5 rounded-xl bg-[#FEF9E7] px-4 py-3.5 ring-1 ring-[#F3E5AB]/80">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-bold text-[#002D62]">
                Showing events for your interests:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {selectedInterestLabels.length > 0 ? (
                  <span className="text-sm italic text-[#002D62]">
                    {selectedInterestLabels.join(", ")}
                  </span>
                ) : (
                  <span className="text-sm italic text-[#64748B]">
                    Complete personalization to load your recommended picks.
                  </span>
                )}
                {onEditRecommended && (
                  <button
                    type="button"
                    onClick={onEditRecommended}
                    className="inline-flex shrink-0 rounded-md p-1 text-[#5c4033] hover:bg-black/[0.06]"
                    aria-label="Edit recommended interests"
                    title="Edit recommended interests"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
            {onShowAll && (
              <button
                type="button"
                onClick={onShowAll}
                className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#002D62] hover:underline"
              >
                SHOW ALL
              </button>
            )}
          </div>
        </div>
      )}

      <div
        data-onboarding="category-filters"
        className="mt-6 flex flex-wrap items-start gap-x-3 gap-y-2"
      >
        <h3 className="shrink-0 pt-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-[#64748B]">
          FILTER BY
        </h3>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
=======
      {/* {/* Quick Search Tags 
      <div className="flex flex-wrap gap-2 mt-3">
        <div className="px-1 py-1 text-(--color-muted-foreground) text-xs italic ">Suggested Searches</div>
        {["battle of the bands", "chemistry show", "chick handling", "cockroach racing", "doxie derby", "laser maze"].map((tag) => (
>>>>>>> f10c7ce (fixed UI of the new search card)
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
        <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs text-[#64748B]">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C9A227]" />
            {selectedCategories.length} filter
            {selectedCategories.length !== 1 ? "s" : ""} active
          </span>

          <button
            type="button"
            onClick={() => selectedCategories.forEach(toggleCategory)}
            className="font-semibold text-[#002D62] transition hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
