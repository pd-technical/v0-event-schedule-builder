"use client"

import { Search, Clock, X, HelpCircle, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import type { Event } from "@/app/page"
import { useOnboarding } from "@/app/components/onboarding/onboarding-provider"
import { rankedEventMatchesSearch } from "@/app/lib/searchUtils"

interface SearchSectionProps {
  events: Event[]
  searchHistory: string[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearchSubmit: (value?: string) => void
  clearSearchHistory: () => void
}

const MAX_SUGGESTIONS = 8

type DropdownItem =
  | { type: "history"; label: string }
  | { type: "event"; event: Event }

/** Bold the first case-insensitive match of `query` in `text` (student-friendly, no regex footguns). */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>

  const lower = text.toLowerCase()
  const idx = lower.indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/35 text-foreground font-medium rounded px-0.5">
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

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
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
            />

            <button
              type="submit"
              className="px-5 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {(showDropdown || showNoResults) && (
            <div
              id="search-suggestions"
              role="listbox"
              className="absolute z-30 mt-2 w-full bg-card border border-border rounded-lg shadow-[0_10px_25px_rgba(2,40,81,0.08)] max-h-72 overflow-y-auto"
            >
              {showNoResults ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No events match &ldquo;{trimmedQuery}&rdquo;. Try a different
                  word or check spelling.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/60">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wide">
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
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close suggestions"
                      >
                        <X className="w-4 h-4" />
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
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
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
                        className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
                      >
                        <Search className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground block">
                            <HighlightMatch
                              text={item.event.name}
                              query={trimmedQuery}
                            />
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
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
          onClick={restart}
          className="flex-shrink-0 py-3.5 px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          aria-label="Help"
          title="Replay tutorial"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
