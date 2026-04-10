import type { Event, ScheduledEvent } from "@/app/page"

/** Key used in localStorage (scoped so it won’t clash with other Picnic Day embeds). */
const STORAGE_KEY = "picnic-day-schedule-builder-v1"

/** How long saved schedules are kept (2 days from last save). */
const CACHE_MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000

type StoredPayload = {
  savedAt: number
  /** Order matches the user’s schedule order. */
  orderedEventIds: string[]
}

function isValidPayload(data: unknown): data is StoredPayload {
  if (data === null || typeof data !== "object") return false
  const o = data as Record<string, unknown>
  return (
    typeof o.savedAt === "number" &&
    Array.isArray(o.orderedEventIds) &&
    o.orderedEventIds.every((id) => typeof id === "string")
  )
}

/**
 * Read a saved schedule from the browser. Returns null if missing, expired, or invalid.
 */
export function readScheduleCache(): StoredPayload | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isValidPayload(parsed)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (Date.now() - parsed.savedAt > CACHE_MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}

/**
 * Save the current schedule order. Updates the “last saved” time (starts a new 2-day window).
 */
export function writeScheduleCache(orderedEventIds: string[]): void {
  if (typeof window === "undefined") return
  try {
    const payload: StoredPayload = {
      savedAt: Date.now(),
      orderedEventIds,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* Private mode or quota — schedule still works for this session */
  }
}

/** Turn stored IDs into full events using the live catalog (drops IDs that no longer exist). */
export function scheduleFromCachedIds(
  orderedIds: string[],
  catalog: Event[]
): ScheduledEvent[] {
  const byId = new Map(catalog.map((e) => [e.id, e]))
  const out: ScheduledEvent[] = []
  for (const id of orderedIds) {
    const event = byId.get(id)
    if (event) {
      out.push({ ...event, orderIndex: out.length })
    }
  }
  return out
}
