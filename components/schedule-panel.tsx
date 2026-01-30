"use client"

import React from "react"

import { useState, useRef } from "react"
import { X, GripVertical, AlertTriangle, Calendar, Download, ChevronUp, ChevronDown } from "lucide-react"
import type { ScheduledEvent } from "@/app/page"

interface SchedulePanelProps {
  scheduledEvents: ScheduledEvent[]
  removeFromSchedule: (eventId: string) => void
  reorderSchedule: (fromIndex: number, toIndex: number) => void
}

function parseTime(timeStr: string): number {
  const [time, period] = timeStr.split(" ")
  const [hours, minutes] = time.split(":").map(Number)
  let h = hours
  if (period === "PM" && hours !== 12) h += 12
  if (period === "AM" && hours === 12) h = 0
  return h * 60 + minutes
}

function isOutOfOrder(events: ScheduledEvent[], index: number): boolean {
  if (index === 0) return false
  const currentTime = parseTime(events[index].startTime)
  const prevTime = parseTime(events[index - 1].startTime)
  return currentTime < prevTime
}

export function SchedulePanel({ 
  scheduledEvents, 
  removeFromSchedule, 
  reorderSchedule 
}: SchedulePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    dragOverIndex.current = index
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex.current !== null && draggedIndex !== dragOverIndex.current) {
      reorderSchedule(draggedIndex, dragOverIndex.current)
    }
    setDraggedIndex(null)
    dragOverIndex.current = null
  }

  const moveItem = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1
    if (toIndex >= 0 && toIndex < scheduledEvents.length) {
      reorderSchedule(fromIndex, toIndex)
    }
  }

  return (
    <div 
      className={`absolute top-4 right-4 w-72 bg-card border border-border rounded-lg shadow-lg transition-all z-30 ${
        isCollapsed ? "h-auto" : "max-h-[440px]"
      }`}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-border cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">My Schedule</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
            {scheduledEvents.length}
          </span>
        </div>
        <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform ${
          isCollapsed ? "rotate-180" : ""
        }`} />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          {scheduledEvents.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No events added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click + on events to add them
              </p>
            </div>
          ) : (
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {scheduledEvents.map((event, index) => {
                const outOfOrder = isOutOfOrder(scheduledEvents, index)
                const isDragging = draggedIndex === index

                return (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative flex items-start gap-2 p-2 rounded-lg mb-1 transition-all ${
                      isDragging 
                        ? "opacity-50 bg-muted" 
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="flex flex-col items-center gap-0.5 pt-1 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                    </div>

                    {/* Index Number */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-[10px] font-bold mt-0.5">
                      {index + 1}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {event.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {event.startTime} · {event.location}
                      </p>

                      {/* Out of Order Warning */}
                      {outOfOrder && (
                        <div className="flex items-center gap-1 mt-1 text-destructive">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[10px] font-medium">
                            Time conflict with previous event
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveItem(index, "up")}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => moveItem(index, "down")}
                        disabled={index === scheduledEvents.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromSchedule(event.id)}
                      className="flex-shrink-0 p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          {scheduledEvents.length > 0 && (
            <div className="p-3 border-t border-border">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" />
                Export Schedule
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
