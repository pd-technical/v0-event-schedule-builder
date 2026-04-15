"use client"

import { Search, Clock, X, HelpCircle, MapPin } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import type { Event } from "@/app/page"
import { rankedEventMatchesSearch } from "@/app/lib/searchUtils"

interface SearchBarSectionProps {
  events: Event[]
  searchHistory: string[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSearchSubmit: (value?: string) => void
  clearSearchHistory: () => void
  onHelpClick: () => void
  mobile?: boolean
}

const MAX_SUGGESTIONS = 8

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>

  const start = text.toLowerCase().indexOf(q.toLowerCase())
  if (start === -1) return <>{text}</>

  const end = start + q.length

  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-accent/35 font-medium text-foreground">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  )
}

export function SearchBarSection({
  events,
  searchHistory,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  clearSearchHistory,
  onHelpClick,
  mobile = false,
}: SearchBarSectionProps) {
  const trimmedQuery = searchQuery.trim()
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSearching = !!trimmedQuery
  const mode = isSearching ? "events" : "history"

  const items = useMemo(() => {
    return isSearching
      ? rankedEventMatchesSearch(events, trimmedQuery)
          .slice(0, MAX_SUGGESTIONS)
          .map((event) => ({ type: "event" as const, event }))
      : searchHistory
          .slice(0, 5)
          .map((label) => ({ type: "history" as const, label }))
  }, [isSearching, events, trimmedQuery, searchHistory])

  const showDropdown = isFocused && (isSearching || items.length > 0)
  const showNoResults = isFocused && isSearching && items.length === 0

  const closeSearch = () => {
    inputRef.current?.blur()
    setIsFocused(false)
  }

  const submitSearch = (value = searchQuery) => {
    onSearchSubmit(value)
    closeSearch()
  }

  const inputClasses = mobile
    ? "flex-1 min-w-0 py-3 pl-10 pr-4 bg-[#DDEAF7] border border-[#B7CCE3] rounded-lg text-foreground text-sm text-[#163A70] placeholder:text-[#163A70]/65 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#8FB2D8] transition-all"
    : "flex-1 min-w-0 pl-10 pr-4 py-3 bg-secondary border border-primary/20 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"

  const searchIconClasses = "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#163A70]/60"

  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      <div className="relative min-w-0 flex-1">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitSearch()
          }}
          className="relative flex w-full min-w-0"
        >
          <Search className={searchIconClasses} strokeWidth={2.25} />

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="Search for events..."
            autoComplete="off"
            aria-expanded={showDropdown || showNoResults}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            className={inputClasses}
          />
        </form>

        {(showDropdown || showNoResults) && (
          <div
            id="search-suggestions"
            role="listbox"
            className="absolute z-[70] mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-[0_10px_25px_rgba(2,40,81,0.08)]"
          >
            {showNoResults ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No events match &ldquo;{trimmedQuery}&rdquo;. Try a different word or check spelling.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border/60 px-4 pb-2 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {mode === "events" ? "Matching events" : "Recent searches"}
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
                      onClick={closeSearch}
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
                        submitSearch(item.label)
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
                        submitSearch(name)
                      }}
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary/5"
                    >
                      <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          <HighlightMatch text={item.event.name} query={trimmedQuery} />
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
        onClick={onHelpClick}
        aria-label="Help"
        title="Replay tutorial"
        className={`flex shrink-0 items-center justify-center rounded-xl bg-[#002D62] text-white transition-colors hover:bg-[#00244d] ${
          mobile ? "py-3 w-12 rounded-lg" : "h-12 w-12"
        }`}
      >
        <HelpCircle className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  )
}