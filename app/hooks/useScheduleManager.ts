import { useCallback, useEffect, useRef, useState } from "react"
import type { Event, ScheduledEvent } from "@/app/page"
import { exportSchedulePdf } from "@/app/lib/exportPdf"
import { exportScheduleIcs } from "@/app/lib/exportIcs"
import {
  readScheduleCache,
  writeScheduleCache,
  scheduleFromCachedIds,
} from "@/app/lib/scheduleCache"
import { compareEventsByTime } from "@/app/lib/eventUtils"

export function useScheduleManager(events: Event[], eventsReady: boolean) {
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([])
  const [scheduleCacheReady, setScheduleCacheReady] = useState(false)
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const recentlyAddedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!eventsReady) return

    if (events.length > 0) {
      const cached = readScheduleCache()

      if (cached?.orderedEventIds.length) {
        const restored = scheduleFromCachedIds(cached.orderedEventIds, events)

        if (restored.length > 0) {
          setScheduledEvents(restored)
          writeScheduleCache(restored.map((event) => event.id))
        }
      }
    }

    setScheduleCacheReady(true)
  }, [events, eventsReady])

  useEffect(() => {
    if (!scheduleCacheReady || events.length === 0) return
    writeScheduleCache(scheduledEvents.map((event) => event.id))
  }, [scheduledEvents, scheduleCacheReady, events.length])

  useEffect(() => {
    return () => {
      if (recentlyAddedTimeoutRef.current) {
        clearTimeout(recentlyAddedTimeoutRef.current)
      }
    }
  }, [])

  const addToSchedule = useCallback((event: Event) => {
    setScheduledEvents((prev) => {
      if (prev.some((scheduledEvent) => scheduledEvent.id === event.id)) {
        return prev
      }

      const updated = [...prev, { ...event, orderIndex: prev.length }]
      updated.sort(compareEventsByTime)

      return updated.map((scheduledEvent, index) => ({
        ...scheduledEvent,
        orderIndex: index,
      }))
    })

    setRecentlyAddedId(event.id)

    if (recentlyAddedTimeoutRef.current) {
      clearTimeout(recentlyAddedTimeoutRef.current)
    }

    recentlyAddedTimeoutRef.current = setTimeout(() => {
      setRecentlyAddedId(null)
    }, 700)
  }, [])

  const removeFromSchedule = useCallback((eventId: string) => {
    setScheduledEvents((prev) =>
      prev
        .filter((event) => event.id !== eventId)
        .map((event, index) => ({ ...event, orderIndex: index }))
    )
  }, [])

  const reorderSchedule = useCallback((from: number, to: number) => {
    setScheduledEvents((prev) => {
      const result = [...prev]
      const [removed] = result.splice(from, 1)
      result.splice(to, 0, removed)

      return result.map((event, index) => ({
        ...event,
        orderIndex: index,
      }))
    })
  }, [])

  const handleExportPdf = useCallback(async () => {
    setIsExportingPdf(true)

    try {
      await exportSchedulePdf(scheduledEvents)
    } finally {
      setIsExportingPdf(false)
    }
  }, [scheduledEvents])

  const handleExportIcs = useCallback(async () => {
    setIsExportingPdf(true)

    try {
      await exportScheduleIcs(scheduledEvents)
    } finally {
      setIsExportingPdf(false)
    }
  }, [scheduledEvents])

  return {
    scheduledEvents,
    setScheduledEvents,
    recentlyAddedId,
    isExportingPdf,
    addToSchedule,
    removeFromSchedule,
    reorderSchedule,
    handleExportPdf,
    handleExportIcs,
  }
}