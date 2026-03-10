"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Check, MapPin, Clock, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { Event, ScheduledEvent } from "@/app/page"

interface EventListProps {
  events: Event[]
  allFilteredCount: number
  scheduledEvents: ScheduledEvent[]
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
}

export function EventList({
  events,
  allFilteredCount,
  scheduledEvents,
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
}: EventListProps) {
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

  const pageSize = 20
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, allFilteredCount)

  return (
    <div className="flex-1 lg:flex lg:flex-col lg:min-h-0">
      <div className="flex items-center justify-between mb-3">

        {/* LEFT — Title */}
        <div className="relative">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wide leading-none">
            {searchQuery.trim().length === 0 ? (
              <>All Events ({allFilteredCount})</>
            ) : (
              <>
                {allFilteredCount} Events Found
                <span className="normal-case font-normal text-muted-foreground ml-1">
                  for "<span className="text-foreground">{searchQuery.trim()}</span>"
                </span>
              </>
            )}
          </h3>
        </div>

        {/* RIGHT — Sort + Pagination */}
        <div className="flex items-center gap-6 text-xs">

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="
                  px-3 py-1.5
                  rounded-md
                  border border-border
                  bg-secondary/50
                  text-primary
                  hover:bg-accent hover:text-accent-foreground
                  transition
                  disabled:opacity-30 disabled:cursor-not-allowed
                "
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-nowrap text-sm font-medium text-primary">
                {page + 1} / {totalPages}
              </span>

              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="
                  px-3 py-1.5
                  rounded-md
                  border border-border
                  bg-secondary/50
                  text-primary
                  hover:bg-accent hover:text-accent-foreground
                  transition
                  disabled:opacity-30 disabled:cursor-not-allowed
                "
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
        <div
          ref={listScrollRef}
          className="space-y-2 lg:flex-1 lg:overflow-y-auto pr-2 -mr-2 lg:mr-0"
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
                className={`relative border rounded-lg transition-all duration-200 ease-out ${isHovered
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
                <div className="flex items-start gap-3 p-3">
                  <button
                    onClick={() => {
                      setExpandedEvent(isExpanded ? null : event.id)
                      setHoveredEvent(event.id)
                    }}
                    className="flex-1 flex items-start gap-3 text-left"
                  >
                    <ChevronDown className={`w-4 h-4 mt-1 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""
                      }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">
                        {event.name}
                      </h4>
                      <div className="mt-1 text-xs text-muted-foreground space-y-1">
                        {/* TIME */}
                        <div className="flex items-center gap-1 whitespace-nowrap text-primary font-semibold">
                          <Clock className="w-3 h-3 text-accent flex-shrink-0" />
                          <span>{event.startTime || "8:00 AM"} - {event.endTime || "9:00 PM"}</span>
                        </div>

                        {/* LOCATION */}
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {event.location}
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
                    <div className="flex items-start gap-3 p-3">

                      {/* Chevron column spacer (matches Chevron width) */}
                      <div className="w-4" />

                      {/* Content column (aligns with title/time/location above) */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
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
                      <div className="w-8" />
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
