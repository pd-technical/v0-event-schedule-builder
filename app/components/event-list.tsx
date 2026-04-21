"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  Plus,
  Check,
  MapPin,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { Event, ScheduledEvent } from "@/app/page"
import { SortDropdown, type SortOption } from "@/app/components/sort-dropdown"
import { CategoryIcon } from "./category-icon"
import ticketedEventsData from "@/app/lib/ticketed-events.json"

type TicketedEventEntry = {
  name: string
  aliases?: string[]
  url: string
}

const ticketedEvents = ticketedEventsData as TicketedEventEntry[]

function normalizeName(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function getTicketUrl(eventName: string) {
  const normalizedEventName = normalizeName(eventName)

  const match = ticketedEvents.find((entry) => {
    const names = [entry.name, ...(entry.aliases ?? [])]

    return names.some((name) => {
      const normalizedName = normalizeName(name)
      return (
        normalizedName === normalizedEventName ||
        normalizedName.includes(normalizedEventName) ||
        normalizedEventName.includes(normalizedName)
      )
    })
  })

  return match?.url
}

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
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
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
  sortOption,
  setSortOption,
}: EventListProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const listScrollRef = useRef<HTMLDivElement>(null)

  const scheduledIds = useMemo(
    () => new Set(scheduledEvents.map((event) => event.id)),
    [scheduledEvents]
  )

  const trimmedQuery = searchQuery.trim()
  const hasSearch = trimmedQuery.length > 0

  useEffect(() => {
    if (!scrollToEventId || !listScrollRef.current) return

    const el = listScrollRef.current.querySelector<HTMLElement>(
      `[data-event-id="${scrollToEventId}"]`
    )

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
      setExpandedEvent(scrollToEventId)
    }

    onScrollToEventDone()
  }, [scrollToEventId, onScrollToEventDone])

  useEffect(() => {
    listScrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [page])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-5 border-b border-[#E5E7EB] bg-background/95 py-3 backdrop-blur">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold uppercase leading-none tracking-wide text-[#002D62]">
            {hasSearch
              ? `Found ${events.length} Events`
              : `Found ${allFilteredCount} Events`}
          </h3>

          {hasSearch && (
            <p className="mt-1.5 truncate text-xs text-[#64748B]">
              for <span className="text-[#002D62]">&quot;{trimmedQuery}&quot;</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <SortDropdown
            selectedSort={sortOption}
            setSelectedSort={setSortOption}
          />

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(0, page - 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7E2EE] bg-white text-[#163A70] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page === 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="min-w-[58px] text-center text-sm font-semibold text-[#163A70]">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  onPageChange(Math.min(totalPages - 1, page + 1))
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7E2EE] bg-white text-[#163A70] shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={page === totalPages - 1}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={listScrollRef}
        className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto"
      >
        {events.map((event) => {
          const scheduled = scheduledIds.has(event.id)
          const isExpanded = expandedEvent === event.id
          const isHovered = hoveredEvent === event.id
          const ticketUrl = getTicketUrl(event.name)

          return (
            <div
              key={event.id}
              data-event-id={event.id}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              className={`relative overflow-hidden rounded-xl border transition-all duration-200 ease-out ${
                isHovered
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-md"
                  : scheduled
                    ? "border-[var(--color-primary)] bg-[var(--color-secondary)] shadow-md"
                    : "border-border/80 bg-card shadow-sm hover:border-primary/20 hover:shadow-md"
              }`}
            >
              {isHovered && (
                <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-lg bg-accent" />
              )}

              <div className="flex min-w-0 items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  aria-expanded={isExpanded}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <h4 className="flex items-start gap-1.5 break-words font-medium text-foreground">
                      <CategoryIcon event={event} size={12} className="mt-1.5 shrink-0" />
                      <span>{event.name}</span>
                    </h4>

                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 whitespace-nowrap font-semibold text-primary">
                        <Clock className="h-3 w-3 shrink-0 text-accent" />
                        <span>
                          {event.startTime || "8:00 AM"} - {event.endTime || "9:00 PM"}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-start gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span
                          className={`block min-w-0 ${
                            isExpanded ? "whitespace-normal break-words" : "truncate"
                          }`}
                        >
                          {event.location}
                          {event.location_details && <> — {event.location_details}</>}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  aria-label={scheduled ? "Remove from schedule" : "Add to schedule"}
                  onClick={() =>
                    scheduled ? removeFromSchedule(event.id) : addToSchedule(event)
                  }
                  className={`shrink-0 rounded-full p-2 transition-all ${
                    scheduled
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {scheduled ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-primary/10 bg-secondary/40 px-10 py-3">
                  {event.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                      {event.category}
                    </span>

                    {event.tags?.filter((tag) => tag.toLowerCase() !== "ticketed").map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium capitalize text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                    {ticketUrl && (
                      <a
                        href={ticketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-800 transition hover:bg-red-200"
                      >
                        Get tickets
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {events.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            {hasSearch ? (
              <>
                <p className="text-sm font-medium">No results for "{trimmedQuery}"</p>
                <p className="mt-2 text-xs">Try different keywords or filters.</p>
                <button
                  type="button"
                  onClick={onBrowseAll}
                  className="mt-3 text-xs font-semibold text-accent hover:underline"
                >
                  Browse all events
                </button>
              </>
            ) : (
              <p className="text-sm font-medium">No events available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
