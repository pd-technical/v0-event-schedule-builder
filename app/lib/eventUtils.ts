import type { Event, ScheduledEvent } from "@/app/page"

export function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return Number.POSITIVE_INFINITY

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0

  return hours * 60 + minutes
}

export function compareEventsByTime(
  a: Event | ScheduledEvent,
  b: Event | ScheduledEvent
) {
  const startCompare = timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  if (startCompare !== 0) return startCompare
  return timeToMinutes(a.endTime) - timeToMinutes(b.endTime)
}

export function isFoodEvent(event: Event | ScheduledEvent) {
  return event.tags?.some((tag) => tag.toLowerCase().includes("food")) ?? false
}

export function isRestroom(event: Event | ScheduledEvent) {
  return event.tags?.some((tag) => tag.toLowerCase().includes("restroom")) ?? false
}

export const CATEGORY_TO_TAGS: Record<string, string[]> = {
  family: ["kids", "toddlers", "fun", "activities", "games"],
  animals: ["animals", "bugs", "insects", "pets"],
  science: ["science", "education", "tech", "engineering", "math"],
  music: ["music", "performance"],
  creative: ["art", "crafts"],
  food: ["food", "drink", "coffee"],
  community: ["cultural", "culture", "personal", "services"],
}