"use client"

import { useState } from "react"
import { Plus, Check, MapPin, Clock, ChevronDown } from "lucide-react"
import type { Event, ScheduledEvent } from "@/app/page"

interface EventListProps {
  events: Event[]
  scheduledEvents: ScheduledEvent[]
  addToSchedule: (event: Event) => void
  hoveredEvent: string | null
  setHoveredEvent: (id: string | null) => void
}

export function EventList({ 
  events, 
  scheduledEvents, 
  addToSchedule,
  hoveredEvent,
  setHoveredEvent
}: EventListProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const isScheduled = (eventId: string) => 
    scheduledEvents.some(e => e.id === eventId)

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {events.length} Events Found
        </h3>
      </div>

      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2">
        {events.map((event) => {
          const scheduled = isScheduled(event.id)
          const isExpanded = expandedEvent === event.id
          const isHovered = hoveredEvent === event.id

          return (
            <div
              key={event.id}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              className={`bg-card border rounded-lg transition-all ${
                isHovered 
                  ? "border-primary/50 shadow-sm" 
                  : "border-border"
              }`}
            >
              {/* Main Row */}
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className="flex-1 flex items-start gap-3 text-left"
                >
                  <ChevronDown className={`w-4 h-4 mt-1 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {event.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => !scheduled && addToSchedule(event)}
                  disabled={scheduled}
                  className={`flex-shrink-0 p-2 rounded-full transition-all ${
                    scheduled
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
                <div className="px-3 pb-3 pt-0 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-muted-foreground">
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-secondary rounded-full text-secondary-foreground capitalize">
                      {event.category}
                    </span>
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
  )
}
