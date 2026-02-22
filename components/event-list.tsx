"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Check, MapPin, Clock, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { Event, ScheduledEvent } from "@/app/page"
import { formatTimeRange, formatTime } from "@/lib/time"

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
  searchQuery
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

  const pageSize = 20
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, allFilteredCount)

  return (
    <div className="flex-1">
      <div className="relative">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wide leading-none mb-4 pl-1 relative">
          {allFilteredCount} Events Found
          <span className="absolute left-1 -bottom-1 h-[2px] w-12 bg-accent rounded-full" />
          {searchQuery.trim() && (
            <span className="normal-case font-normal text-muted-foreground ml-1">
              for "<span className="text-foreground">{searchQuery}</span>"
            </span>
          )}
          {allFilteredCount > pageSize && (
            <span className="normal-case font-normal text-muted-foreground ml-1">
              (showing {start}–{end})
            </span>
          )}
        </h3>

        {totalPages > 1 && (
          <div className="absolute right-0 -top-1 flex items-center gap-1 pr-1">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-primary/30 text-primary bg-card hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-medium text-primary px-2">
              {page + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-primary/30 text-primary bg-card hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="mt-4">
        <div
          ref={listScrollRef}
          className="space-y-2 max-h-[380px] md:max-h-[420px] lg:max-h-[520px] overflow-y-auto pr-2 -mr-2 lg:mr-0"
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
                className={`relative border rounded-lg transition-all duration-200 ease-out ${
                  isHovered
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
                          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
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
              <p className="text-sm">No events match your search.</p>
              <p className="text-xs mt-1">Try different keywords or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
