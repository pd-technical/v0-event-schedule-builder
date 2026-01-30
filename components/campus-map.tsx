"use client"

import type { Event, ScheduledEvent } from "@/app/page"

interface CampusMapProps {
  events: Event[]
  scheduledEvents: ScheduledEvent[]
  hoveredEvent: string | null
}

export function CampusMap({ events, scheduledEvents, hoveredEvent }: CampusMapProps) {
  const getScheduleIndex = (eventId: string) => {
    const index = scheduledEvents.findIndex(e => e.id === eventId)
    return index >= 0 ? index + 1 : null
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-[480px] relative">
      {/* Map Placeholder - Mid-fi style */}
      <div className="absolute inset-0 bg-[#e8ebe4]">
        {/* Grid overlay for map feel */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5b6770" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Simulated roads */}
        <svg className="absolute inset-0" width="100%" height="100%">
          <path 
            d="M 0 200 Q 150 180 300 200 T 600 180" 
            stroke="#d1d5db" 
            strokeWidth="12" 
            fill="none"
          />
          <path 
            d="M 200 0 Q 220 150 200 300 T 220 500" 
            stroke="#d1d5db" 
            strokeWidth="8" 
            fill="none"
          />
          <path 
            d="M 400 0 Q 380 200 400 400 T 380 600" 
            stroke="#d1d5db" 
            strokeWidth="8" 
            fill="none"
          />
        </svg>

        {/* Building blocks */}
        <div className="absolute top-[20%] left-[15%] w-16 h-12 bg-[#c9d1c8] rounded" />
        <div className="absolute top-[35%] left-[25%] w-20 h-14 bg-[#c9d1c8] rounded" />
        <div className="absolute top-[25%] left-[55%] w-24 h-16 bg-[#c9d1c8] rounded" />
        <div className="absolute top-[50%] left-[40%] w-14 h-10 bg-[#c9d1c8] rounded" />
        <div className="absolute top-[60%] left-[60%] w-18 h-12 bg-[#c9d1c8] rounded" />
        <div className="absolute top-[70%] left-[20%] w-16 h-14 bg-[#c9d1c8] rounded" />

        {/* Green spaces */}
        <div className="absolute top-[40%] left-[10%] w-12 h-12 bg-[#a8c686] rounded-full opacity-60" />
        <div className="absolute top-[55%] left-[70%] w-16 h-16 bg-[#a8c686] rounded-full opacity-60" />
        <div className="absolute top-[15%] left-[70%] w-10 h-10 bg-[#a8c686] rounded-full opacity-60" />
      </div>

      {/* Event Pins */}
      {events.map((event) => {
        const scheduleIndex = getScheduleIndex(event.id)
        const isHovered = hoveredEvent === event.id
        const isScheduled = scheduleIndex !== null

        return (
          <div
            key={event.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
            style={{ 
              left: "50%",  // REPLACE WITH MAP COORDINATE
              top: "50%",
              zIndex: isHovered ? 20 : isScheduled ? 10 : 5
            }}
          >
            <div
              className={`relative flex items-center justify-center rounded-full transition-all ${
                isScheduled
                  ? "w-8 h-8 bg-primary text-primary-foreground shadow-md"
                  : isHovered
                    ? "w-6 h-6 bg-accent border-2 border-primary shadow-md"
                    : "w-5 h-5 bg-card border-2 border-muted-foreground/40"
              }`}
            >
              {isScheduled && (
                <span className="text-xs font-bold">{scheduleIndex}</span>
              )}
            </div>

            {/* Tooltip on hover */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded shadow-lg whitespace-nowrap z-30">
                <p className="text-xs font-medium text-foreground">{event.name}</p>
                <p className="text-[10px] text-muted-foreground">{event.startTime}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Route lines between scheduled events */}
      {scheduledEvents.length > 1 && (
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          {scheduledEvents.slice(0, -1).map((event, index) => {
            const nextEvent = scheduledEvents[index + 1]
            const currentPos = { x: 50, y: 50 }
            const nextPos = { x: 50, y: 50 } // REPLACE

            if (!currentPos || !nextPos) return null

            return (
              <line
                key={`route-${event.id}-${nextEvent.id}`}
                x1={`${currentPos.x}%`}
                y1={`${currentPos.y}%`}
                x2={`${nextPos.x}%`}
                y2={`${nextPos.y}%`}
                stroke="#022851"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.6"
              />
            )
          })}
        </svg>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded border border-border p-2 z-20">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-card border border-muted-foreground/40 rounded-full" />
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}
