"use client"

import { Search, Clock, X, HelpCircle, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
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

  const showDropdown =
    isFocused && (mode === "events" ? true : items.length > 0)

  const showNoResults =
    isFocused && mode === "events" && trimmedQuery && items.length === 0

  return (
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
            className={
              mobile
                ? `
                  flex-1 min-w-0 h-14 px-4
                  bg-[#DDEAF7]
                  border border-[#B7CCE3]
                  rounded-l-[18px]
                  text-[15px] text-[#163A70]
                  placeholder:text-[#163A70]/65
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary/20
                  focus:border-[#8FB2D8]
                  transition-all
                `
                : `
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
                `
            }
          />

          <button
            type="submit"
            className={
              mobile
                ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-r-[18px] bg-[#123E7C] text-white transition-colors hover:bg-[#0f3568]"
                : "flex h-12 w-14 shrink-0 items-center justify-center rounded-r-xl bg-[#002D62] text-white transition-colors hover:bg-[#00244d] sm:w-16"
            }
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </form>

        {(showDropdown || showNoResults) && (
          <div
            id="search-suggestions"
            role="listbox"
            className="absolute z-[70] mt-2 w-full bg-card border border-border rounded-lg shadow-[0_10px_25px_rgba(2,40,81,0.08)] max-h-72 overflow-y-auto"
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
        onClick={onHelpClick}
        className={
          mobile
            ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#123E7C] text-white transition-colors hover:bg-[#0f3568]"
            : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002D62] text-white transition-colors hover:bg-[#00244d]"
        }
        aria-label="Help"
        title="Replay tutorial"
      >
        <HelpCircle className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  )
}