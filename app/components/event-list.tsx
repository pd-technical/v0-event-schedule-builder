"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Check, MapPin, Clock, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { Event, ScheduledEvent } from "@/app/page"

interface EventListProps {
  events: Event[]
  allFilteredCount: number
  scheduledEvents: ScheduledEvent[]
  pageSize: number
  addToSchedule: (event: Event) => void
  removeFromSchedule: (eventId: string) => void
  hoveredEvent: string | null
  setHoveredEvent: (id: string | null) => void
  scrollToEventId: string | null
  onScrollToEventDone: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  searchQuery: string
  onBrowseAll: () => void
  sortOption: "relevance" | "alphabetical" | "time"
  setSortOption: (option: "relevance" | "alphabetical" | "time") => void
}

export function EventList({
  events,
  allFilteredCount,
  scheduledEvents,
  pageSize,
  addToSchedule,
  removeFromSchedule,
  hoveredEvent,
  setHoveredEvent,
  scrollToEventId,
  onScrollToEventDone,
  page,
  totalPages,
  onPageChange,
  searchQuery,
  onBrowseAll,
  sortOption,
  setSortOption,
}: EventListProps) {
  function isFoodTruck(event: Event) {
    return event.name.toLowerCase().includes("food truck")
  }

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)

  const isScheduled = (eventId: string) =>
    scheduledEvents.some(e => e.id === eventId)

  // When scrollToEventId is set (e.g. after clicking a map marker), scroll list to that event and expand it
  useEffect(() => {
    if (!scrollToEventId || !listScrollRef.current) return
    const el = listScrollRef.current.querySelector(`[data-event-id="${scrollToEventId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
      setExpandedEvent(scrollToEventId)
    }
    onScrollToEventDone()
  }, [scrollToEventId, onScrollToEventDone])

  // When page changes, scroll back to top of list
  useEffect(() => {
  if (listScrollRef.current) {
    listScrollRef.current.scrollTo({
      top: 0,
      behavior: "smooth", // optional
    })
  }
}, [page])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden lg:min-h-0">
      <div className="mb-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h3 className="flex min-h-8 min-w-0 items-center text-xs font-semibold uppercase leading-none tracking-wide text-primary">
          {searchQuery.trim().length === 0 ? (
            <>All Events ({allFilteredCount})</>
          ) : (
            <>
              {allFilteredCount} Events Found{" "}
              <span className="normal-case font-normal text-muted-foreground">
                for &quot;
                <span className="break-all text-foreground">{searchQuery.trim()}</span>
                &quot;
              </span>
            </>
          )}
        </h3>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3 sm:ml-auto sm:w-auto sm:shrink-0">
          <div
            data-onboarding="sort-section"
            className="flex h-8 shrink-0 items-center gap-2"
          >
            <span className="whitespace-nowrap text-xs font-medium leading-none text-muted-foreground">
              Sort by:
            </span>
            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value as "relevance" | "alphabetical" | "time")
              }
              className="
                h-8 max-w-[11rem] shrink-0
                rounded-md border border-border
                bg-transparent px-2.5
                text-xs leading-tight text-muted-foreground
                transition hover:border-primary
                focus:outline-none focus:ring-1 focus:ring-primary
              "
              aria-label="Sort events"
            >
              <option value="relevance">Relevance</option>
              <option value="time">Time</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex h-8 items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="
                  inline-flex h-6 w-6 shrink-0 items-center justify-center
                  rounded border border-border bg-secondary/50 text-primary
                  transition hover:bg-accent hover:text-accent-foreground
                  disabled:cursor-not-allowed disabled:opacity-30
                "
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
              </button>

              <span className="min-w-[2.75rem] text-center text-xs font-medium tabular-nums leading-none text-primary">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="
                  inline-flex h-6 w-6 shrink-0 items-center justify-center
                  rounded border border-border bg-secondary/50 text-primary
                  transition hover:bg-accent hover:text-accent-foreground
                  disabled:cursor-not-allowed disabled:opacity-30
                  disabled:hover:bg-secondary/50 disabled:hover:text-primary
                "
                aria-label="Next page"
              >
                <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:min-h-0">
        <div
          ref={listScrollRef}
          className="min-w-0 space-y-2 overflow-x-hidden overflow-y-auto lg:flex-1"
        >
          {events.map((event) => {
            const scheduled = isScheduled(event.id)
            const isExpanded = expandedEvent === event.id
            const isHovered = hoveredEvent === event.id

            return (
              <div
                key={event.id}
                data-event-id={event.id}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
                className={`relative min-w-0 overflow-hidden rounded-lg border transition-all duration-200 ease-out ${isHovered
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-md"
                  : scheduled
                    ? "border-[var(--color-primary)] bg-[var(--color-secondary)] shadow-md"
                    : "bg-card border-border shadow-sm"
                  }`}
              >
                {isHovered && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-lg" />
                )}
                {/* Main Row */}
                <div className="flex min-w-0 items-start gap-3 p-3">
                  <button
                    onClick={() => {
                      setExpandedEvent(isExpanded ? null : event.id)
                      setHoveredEvent(event.id)
                    }}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""
                      }`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="flex min-w-0 items-start gap-2 font-medium text-foreground">
                        {isFoodTruck(event) && (
                          <span className="shrink-0 text-base leading-6">🍔</span>
                        )}
                        <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                          {event.name}
                        </span>
                      </h4>
                      <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {/* TIME */}
                        <div className="flex min-w-0 items-center gap-1 font-semibold text-primary">
                          <Clock className="h-3 w-3 shrink-0 text-accent" />
                          <span className="min-w-0 truncate">
                            {event.startTime || "8:00 AM"} - {event.endTime || "9:00 PM"}
                          </span>
                        </div>

                        {/* LOCATION */}
                        <div className="flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                            <span className="min-w-0 break-words">
                              {event.location}
                              {event.location_details && (
                              <> — {event.location_details}</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      scheduled ? removeFromSchedule(event.id) : addToSchedule(event)}
                    className={`flex-shrink-0 p-2 rounded-full transition-all ${scheduled
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary hover:bg-primary hover:text-primary-foreground text-muted-foreground"
                      }`}
                  >
                    {scheduled ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-primary/10 bg-secondary/30">
                    <div className="flex min-w-0 items-start gap-3 p-3">

                      {/* Chevron column spacer (matches Chevron width) */}
                      <div className="w-4 shrink-0" />

                      {/* Content column (aligns with title/time/location above) */}
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="px-2 py-0.5 text-xs font-medium bg-highlight/10 text-highlight rounded-full capitalize">
                            {event.category}
                          </span>

                          {event.tags && event.tags.length > 0 && (
                            <>
                              {event.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="
                                    px-2.5 py-0.5
                                    text-[11px]
                                    font-medium
                                    bg-primary/10
                                    text-primary
                                    rounded-full
                                    capitalize
                                  "
                                >
                                  {tag}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Plus button column spacer (matches button width) */}
                      <div className="w-8 shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {events.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery.trim().length > 0 ? (
                <>
                  <p className="text-sm font-medium">
                    No results for "{searchQuery.trim()}"
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium">
                  No events available
                </p>
              )}

              <p className="text-xs mt-2">
                Try different keywords or filters.
              </p>
              <button
                onClick={onBrowseAll}
                className="mt-3 text-xs font-semibold text-accent hover:underline"
              >
                Browse all events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
